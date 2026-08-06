"use client";

import { useEffect, useRef } from "react";

/**
 * The Double Ratchet, as a field of sessions.
 *
 * Each rail is one conversation. The bright block at its head is the key that
 * conversation can use right now; behind it lies every key it has already
 * spent, going darker one step at a time until nothing is left. That is
 * forward secrecy drawn rather than claimed — the past is not merely private,
 * it is gone, and the rail that wrote it cannot get it back either. Ahead of
 * the head there is nothing at all, because the next key does not exist until
 * the next message arrives.
 *
 * Every so often a rail beats cyan: a DH ratchet step, the moment the other
 * side replies and the chain is replaced instead of advanced. It ages away
 * with the rest, so the beat travels backwards down the rail like a tick mark
 * on tape.
 *
 * The motion is discrete on purpose. A ratchet steps; it does not glide. That
 * honesty is also what makes it cheap: the field redraws about eighteen times
 * a second instead of sixty, every colour it can ever need is built once at
 * startup, and a frame is a few hundred `fillRect` calls with no allocation.
 * The three.js lattice this replaced cost 132 KB of bundle — a third of all
 * the JavaScript on the site — and ran a bloom pass forever.
 */

/** Everything lands on a multiple of this. Square pixels are the house style. */
const CELL = 4;

/** One ratchet step. Slow enough to read as steps rather than a blur. */
const TICK_MS = 55;

/** Steps a rail takes to reach full strength after it starts. */
const FADE_IN = 6;

/**
 * Head to gone.
 *
 * Index 0 is the key in hand, near-white violet; the rest is the site's signal
 * darkening and thinning out as it is spent. The last stop is not transparent
 * by accident — a key that fades to nothing is the point.
 */
const SPENT = [
  [226, 205, 255, 255],
  [176, 118, 255, 240],
  [140, 74, 255, 214],
  [123, 45, 255, 188],
  [104, 34, 218, 163],
  [88, 28, 184, 138],
  [72, 23, 150, 114],
  [58, 19, 120, 91],
  [46, 16, 95, 69],
  [35, 13, 72, 49],
  [26, 11, 52, 31],
  [18, 9, 36, 15],
] as const;

/** The same decay in the site's cyan, for the DH steps. */
const RATCHETED = [
  [198, 244, 255, 255],
  [140, 226, 250, 240],
  [96, 210, 246, 214],
  [76, 201, 240, 188],
  [62, 172, 208, 163],
  [52, 146, 178, 138],
  [43, 120, 148, 114],
  [35, 97, 120, 91],
  [28, 77, 96, 69],
  [21, 58, 73, 49],
  [15, 42, 53, 31],
  [10, 29, 37, 15],
] as const;

const LEVELS = SPENT.length;

/**
 * Depth. Nearer rails are chunkier and hold less history; distant ones are
 * hairlines that remember further back, so every tier's trail ends up about
 * the same length on screen and the field reads as depth rather than as three
 * separate patterns.
 *
 * Sizes are in cells.
 */
const TIERS = [
  { block: 7, height: 3, gap: 2, trail: 14, dim: 1 },
  { block: 5, height: 2, gap: 2, trail: 20, dim: 0.62 },
  { block: 3, height: 1, gap: 1, trail: 28, dim: 0.38 },
] as const;

/** Weighted pick: mostly distant, a few near. A wall of chunky rails is noise. */
const DEPTH_MIX = [0, 0, 1, 1, 1, 2, 2, 2, 2] as const;

/**
 * The band the hero's headline and copy occupy, as a fraction of the height.
 * Rails crossing it are always the faintest tier — the background gets to be
 * interesting everywhere the text is not.
 */
const QUIET = [0.18, 0.66] as const;

type Chain = {
  y: number;
  x0: number;
  bw: number;
  bh: number;
  pitch: number;
  trail: number;
  dim: number;
  tier: number;
  period: number;
  wait: number;
  /** Block index of the current key. Negative means it has not started yet. */
  head: number;
  span: number;
  dh: Set<number>;
  nextDh: number;
};

/**
 * Every colour the field can ever paint, built once.
 *
 * Indexed `[tone][tier][birth][level]`. Four dimensions looks excessive until
 * you count the alternative: a template string per block per frame, which is
 * thousands of throwaway strings a second for a decoration.
 */
function buildPalette() {
  const tones = [SPENT, RATCHETED];
  return tones.map((ramp) =>
    TIERS.map(({ dim }) =>
      Array.from({ length: FADE_IN + 1 }, (_, birth) =>
        Array.from({ length: LEVELS }, (_, level) => {
          const [r, g, b, a] = ramp[level];
          const alpha = (a / 255) * dim * (birth / FADE_IN);
          return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        }),
      ),
    ),
  );
}

const PALETTE = buildPalette();

const snap = (n: number) => Math.round(n / CELL) * CELL;

function layout(width: number, height: number): Chain[] {
  const count = Math.max(8, Math.min(26, Math.round(height / 54)));
  const lane = height / count;

  return Array.from({ length: count }, (_, i) => {
    const y = snap((i + 0.5) * lane + (Math.random() - 0.5) * lane * 0.55);
    const inQuiet = y > height * QUIET[0] && y < height * QUIET[1];
    const tier = inQuiet
      ? TIERS.length - 1
      : DEPTH_MIX[Math.floor(Math.random() * DEPTH_MIX.length)];

    const spec = TIERS[tier];
    const bw = spec.block * CELL;
    const pitch = bw + spec.gap * CELL;

    return {
      y,
      // Offset each rail so the blocks never line up into a grid.
      x0: snap(Math.random() * pitch),
      bw,
      bh: spec.height * CELL,
      pitch,
      trail: spec.trail,
      dim: spec.dim,
      tier,
      period: 2 + Math.floor(Math.random() * 5),
      wait: 1 + Math.floor(Math.random() * 5),
      // Staggered start: some rails are already mid-conversation, some have
      // not begun. Starting them all at zero would make the field pulse.
      head: Math.floor(Math.random() * (width / pitch + spec.trail)) - 20,
      span: Math.ceil(width / pitch) + 1,
      dh: new Set<number>(),
      nextDh: 6 + Math.floor(Math.random() * 14),
    };
  });
}

function step(chain: Chain) {
  if (--chain.wait > 0) return;
  chain.wait = chain.period;
  chain.head += 1;

  if (chain.head >= 0 && --chain.nextDh <= 0) {
    chain.dh.add(chain.head);
    chain.nextDh = 6 + Math.floor(Math.random() * 14);
  }

  // Off the right edge, trail and all: the session ends and a new one starts
  // somewhere off the left after a pause of its own length.
  if (chain.head - chain.trail > chain.span) {
    chain.head = -(8 + Math.floor(Math.random() * 40));
    chain.dh.clear();
    chain.nextDh = 6 + Math.floor(Math.random() * 14);
  }
}

export function RatchetField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let chains: Chain[] = [];
    let cssW = 0;
    let cssH = 0;

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);

      for (const chain of chains) {
        if (chain.head < 0) continue;
        const birth = Math.min(FADE_IN, chain.head);
        const shades = PALETTE[0][chain.tier][birth];
        const beats = PALETTE[1][chain.tier][birth];

        for (let age = 0; age < chain.trail; age++) {
          const index = chain.head - age;
          if (index < 0) break;
          if (index > chain.span) continue;

          const level = Math.round((age / (chain.trail - 1)) * (LEVELS - 1));
          const isDh = chain.dh.has(index);

          ctx.fillStyle = isDh ? beats[level] : shades[level];
          if (isDh) {
            // A DH step stands one cell taller: the chain was replaced, not
            // merely advanced, and the rail shows the seam.
            ctx.fillRect(
              chain.x0 + index * chain.pitch,
              chain.y - CELL,
              chain.bw,
              chain.bh + CELL * 2,
            );
          } else {
            ctx.fillRect(
              chain.x0 + index * chain.pitch,
              chain.y,
              chain.bw,
              chain.bh,
            );
          }
        }
      }
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = Math.max(1, canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);

      // Assigning width or height wipes the canvas even when the value has not
      // changed, so both are guarded — mobile browsers fire resize on scroll
      // as the URL bar moves, and rebuilding the field every time would keep
      // restarting every conversation on the screen.
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (Math.abs(w - cssW) > 2 || Math.abs(h - cssH) > 2 || !chains.length) {
        cssW = w;
        cssH = h;
        chains = layout(w, h);
      }
      draw();
    };

    let frame = 0;
    let last = 0;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!last) last = now;
      const elapsed = now - last;
      if (elapsed < TICK_MS) return;
      // Snap rather than accumulate: coming back to a hidden tab should resume,
      // not fast-forward through every step it missed.
      last = now - (elapsed % TICK_MS);

      for (const chain of chains) step(chain);
      draw();
    };

    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && !frame && !reduce) {
        last = 0;
        frame = requestAnimationFrame(loop);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (!reduce) {
      frame = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
