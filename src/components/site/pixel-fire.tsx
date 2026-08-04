"use client";

import { useEffect, useRef } from "react";

/**
 * The Doom fire algorithm, in violet, burning along an element's border.
 *
 * A grid of heat values: the bottom row is the source, and every frame each
 * cell takes the one below it minus a random amount, drifting sideways as it
 * cools. Rendered at a handful of pixels and scaled up with
 * `image-rendering: pixelated` — a smooth particle effect would look like every
 * other button on the web, and this project is a terminal.
 *
 * Fire only ever rises, so a border needs four of them: one strip per edge,
 * each rotated to burn outwards. That is also what keeps it contained — the
 * flames point away from the element and can never climb over whatever sits
 * above it.
 *
 * The palette is the site's violet, not a new colour: heat runs from the
 * background through signal to near-white at the source.
 */
const RAMP = [
  [0, 0, 0, 0],
  [26, 8, 54, 90],
  [52, 14, 108, 140],
  [78, 22, 158, 180],
  [104, 30, 208, 205],
  [123, 45, 255, 225],
  [150, 82, 255, 235],
  [176, 118, 255, 245],
  [201, 155, 255, 250],
  [224, 195, 255, 252],
  [244, 234, 255, 255],
];

/** Side of one fire pixel, in CSS pixels. Square pixels are the whole look. */
const PIXEL = 4;
/**
 * How far the flames reach past the edge, in CSS pixels.
 *
 * Must match the inset the caller positions this canvas with — 16 here pairs
 * with `-inset-4`. A mismatch does not break anything, it just leaves the band
 * a little short of the canvas or spilling past it. Keep it a multiple of
 * PIXEL so the band lands on whole fire pixels.
 */
const BAND = 16;
const FRAME_MS = 45;

type Strip = {
  cols: number;
  rows: number;
  heat: Uint8Array;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image: ImageData;
};

function makeStrip(cols: number, rows: number): Strip | null {
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;
  return {
    cols,
    rows,
    heat: new Uint8Array(cols * rows),
    canvas,
    ctx,
    image: ctx.createImageData(cols, rows),
  };
}

function burn(strip: Strip, source: number) {
  const { cols, rows, heat } = strip;

  // Source row sits at the bottom of the strip, which after rotation is the
  // edge touching the element — so every flame licks away from it.
  for (let x = 0; x < cols; x += 1) {
    heat[(rows - 1) * cols + x] =
      source > 0 && Math.random() > 0.08 ? source : 0;
  }

  for (let y = rows - 1; y > 0; y -= 1) {
    for (let x = 0; x < cols; x += 1) {
      const below = heat[y * cols + x];
      if (below === 0) {
        heat[(y - 1) * cols + x] = 0;
        continue;
      }
      const decay = Math.floor(Math.random() * 3);
      const drift = Math.floor(Math.random() * 3);
      const to = (y - 1) * cols + ((x + drift - 1 + cols) % cols);
      heat[to] = Math.max(0, below - decay);
    }
  }

  const data = strip.image.data;
  for (let i = 0; i < heat.length; i += 1) {
    const [r, g, b, a] = RAMP[Math.min(heat[i], RAMP.length - 1)];
    const o = i * 4;
    data[o] = r;
    data[o + 1] = g;
    data[o + 2] = b;
    data[o + 3] = a;
  }
  strip.ctx.putImageData(strip.image, 0, 0);
}

type PixelFireProps = {
  /** How hard it burns: 0 puts it out, 1 is a full flame. */
  intensity: number;
  className?: string;
};

export function PixelFire({ intensity, className }: PixelFireProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(intensity);
  // The loop stops itself once the last ember is out, so relighting needs a
  // handle back into it — otherwise the second hover finds a dead animation.
  const relight = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const band = Math.round(BAND / PIXEL);
    let inner = { w: 0, h: 0 };
    let horizontal: Strip | null = null;
    let vertical: Strip | null = null;

    // The canvas covers the element plus one band on each side; the element
    // itself is drawn over the middle by the DOM, so only the border shows.
    const resize = () => {
      const w = Math.max(8, Math.round(canvas.clientWidth / PIXEL) - band * 2);
      const h = Math.max(4, Math.round(canvas.clientHeight / PIXEL) - band * 2);
      if (w === inner.w && h === inner.h) return;
      inner = { w, h };
      canvas.width = w + band * 2;
      canvas.height = h + band * 2;
      horizontal = makeStrip(w, band);
      vertical = makeStrip(h, band);
    };

    let level = 0;
    let frame = 0;
    let last = 0;

    const blit = (strip: Strip, x: number, y: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.drawImage(strip.canvas, 0, 0);
      ctx.restore();
    };

    const draw = () => {
      if (!horizontal || !vertical) return;
      const { w, h } = inner;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Top: the strip as drawn, source row against the element.
      blit(horizontal, band, 0, 0);
      // Bottom: same strip turned upside down, so it burns downwards.
      ctx.save();
      ctx.translate(band + w, band + h + band);
      ctx.rotate(Math.PI);
      ctx.drawImage(horizontal.canvas, 0, 0);
      ctx.restore();
      // Left: rotated a quarter turn anticlockwise, burning outwards.
      blit(vertical, 0, band + h, -Math.PI / 2);
      // Right: the same, mirrored to the far side.
      blit(vertical, band + w + band, band, Math.PI / 2);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;

      resize();
      if (!horizontal || !vertical) return;

      // Eased, so the flame catches and dies down instead of snapping.
      level += (target.current - level) * 0.18;
      const source = Math.round(level * (RAMP.length - 1));

      burn(horizontal, source);
      burn(vertical, source);
      draw();

      // Once the last ember is out there is nothing left to animate. Stopping
      // beats redrawing an invisible flame on every frame of every page view.
      if (
        source === 0 &&
        level < 0.01 &&
        horizontal.heat.every((v) => v === 0) &&
        vertical.heat.every((v) => v === 0)
      ) {
        cancelAnimationFrame(frame);
        frame = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const start = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(loop);
    };

    relight.current = start;
    resize();
    start();

    const observer = new ResizeObserver(() => {
      resize();
      if (target.current > 0) start();
    });
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && target.current > 0) {
        start();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      relight.current = () => {};
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // The loop reads the target every frame rather than restarting on each
  // change, so the flame eases between levels instead of snapping.
  useEffect(() => {
    target.current = intensity;
    if (intensity > 0) relight.current();
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
