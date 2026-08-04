"use client";

import { useEffect, useRef } from "react";

/**
 * The Doom fire algorithm, in violet.
 *
 * A grid of heat values: the bottom row is the source, and every frame each
 * cell takes the one below it minus a random amount, drifting sideways as it
 * cools. Rendered at a handful of pixels and scaled up with
 * `image-rendering: pixelated`, which is the point — a smooth particle effect
 * would look like every other button on the web, and this project is a
 * terminal.
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

/**
 * Side of one fire pixel in CSS pixels. The grid is derived from the element's
 * real size rather than fixed, so a wide box does not stretch the pixels into
 * rectangles — square pixels are most of what makes this read as pixel art.
 */
const PIXEL = 8;
const FRAME_MS = 45;

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

    let cols = 0;
    let rows = 0;
    let heat = new Uint8Array(0);
    let image: ImageData | null = null;

    const resize = () => {
      const nextCols = Math.max(8, Math.round(canvas.clientWidth / PIXEL));
      const nextRows = Math.max(6, Math.round(canvas.clientHeight / PIXEL));
      if (nextCols === cols && nextRows === rows) return;
      cols = nextCols;
      rows = nextRows;
      canvas.width = cols;
      canvas.height = rows;
      heat = new Uint8Array(cols * rows);
      image = ctx.createImageData(cols, rows);
    };

    let level = 0;
    let frame = 0;
    let last = 0;

    const spread = () => {
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
    };

    const paint = () => {
      if (!image) return;
      const data = image.data;
      for (let i = 0; i < heat.length; i += 1) {
        const [r, g, b, a] = RAMP[Math.min(heat[i], RAMP.length - 1)];
        const o = i * 4;
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = b;
        data[o + 3] = a;
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;

      resize();
      if (!heat.length) return;

      // Eased, so the flame catches and dies down instead of snapping.
      level += (target.current - level) * 0.18;

      const source = Math.round(level * (RAMP.length - 1));
      for (let x = 0; x < cols; x += 1) {
        heat[(rows - 1) * cols + x] =
          source > 0 && Math.random() > 0.08 ? source : 0;
      }

      spread();
      paint();

      // Once the last ember is out there is nothing left to animate. Stopping
      // beats redrawing an invisible flame on every frame of every page view.
      if (source === 0 && level < 0.01 && heat.every((v) => v === 0)) {
        cancelAnimationFrame(frame);
        frame = 0;
        ctx.clearRect(0, 0, cols, rows);
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
