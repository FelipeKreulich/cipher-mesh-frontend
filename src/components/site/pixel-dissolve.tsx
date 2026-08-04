"use client";

import { useEffect, useRef } from "react";

/**
 * A card coming apart into embers.
 *
 * Where PixelFire adds flames outside an element, this eats into one: cells
 * disappear in a ragged front sweeping from the right, painting the page's own
 * background over what was there and leaving a line of embers at the edge.
 *
 * It sits on the `/panic` card, which wipes the session, the history, the trust
 * store and the keys with no undo. Every other card in that section stays
 * still — the effect is the one place on the page where destruction is the
 * subject.
 *
 * It never runs to completion. Half-eaten reads as "this could go"; fully eaten
 * just hides the text the visitor came to read.
 */
const PIXEL = 6;
const FRAME_MS = 45;
const MAX = 0.46;

/** Where the page shows through: the panel's own colour. */
const HOLE = [14, 14, 22];
const EMBER = [
  [123, 45, 255],
  [160, 107, 255],
  [201, 155, 255],
];

type PixelDissolveProps = {
  /** 0 leaves the card whole; 1 eats as far as it ever goes. */
  intensity: number;
  className?: string;
};

export function PixelDissolve({ intensity, className }: PixelDissolveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(intensity);
  const relight = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let threshold = new Float32Array(0);
    let image: ImageData | null = null;

    // Each cell decides for itself when it goes: a fixed random value biased by
    // how far right it sits. That is what gives the front its ragged edge
    // instead of a straight wipe, and it stays put between frames so the card
    // comes apart the same way every time.
    const seed = () => {
      threshold = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const across = 1 - x / Math.max(1, cols - 1);
          threshold[y * cols + x] = across * 0.78 + Math.random() * 0.34;
        }
      }
    };

    const resize = () => {
      const nextCols = Math.max(8, Math.round(canvas.clientWidth / PIXEL));
      const nextRows = Math.max(4, Math.round(canvas.clientHeight / PIXEL));
      if (nextCols === cols && nextRows === rows) return;
      cols = nextCols;
      rows = nextRows;
      canvas.width = cols;
      canvas.height = rows;
      image = ctx.createImageData(cols, rows);
      seed();
    };

    let level = 0;
    let frame = 0;
    let last = 0;

    const paint = () => {
      if (!image) return;
      const data = image.data;
      for (let i = 0; i < threshold.length; i += 1) {
        const t = threshold[i];
        const o = i * 4;
        if (t < level) {
          // Gone: the page shows through.
          data[o] = HOLE[0];
          data[o + 1] = HOLE[1];
          data[o + 2] = HOLE[2];
          data[o + 3] = 255;
        } else if (t < level + 0.07) {
          // Going: the burning edge, brightest right at the front.
          const heat = 1 - (t - level) / 0.07;
          const [r, g, b] = EMBER[Math.min(2, Math.floor(heat * 3))];
          data[o] = r;
          data[o + 1] = g;
          data[o + 2] = b;
          data[o + 3] = 235;
        } else {
          data[o + 3] = 0;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;

      resize();
      level += (target.current * MAX - level) * 0.16;
      paint();

      if (target.current === 0 && level < 0.004) {
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
