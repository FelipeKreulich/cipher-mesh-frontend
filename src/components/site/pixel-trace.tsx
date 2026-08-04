"use client";

import { useEffect, useRef } from "react";

/**
 * A light running around the border, one pixel at a time.
 *
 * The same visual language as the fire and the dissolve — a low-resolution grid
 * scaled up — but here the grid is only the perimeter, so a bright head with a
 * fading tail walks the edge like a packet on a wire. That is the metaphor the
 * whole site runs on, which is why this earns its place on the two cards that
 * explain what the hub is.
 *
 * Cyan for the hub, violet for a relay of your own: the site already means
 * those two things by those two colours.
 */
const TONES = {
  wire: [76, 201, 240],
  signal: [160, 107, 255],
} as const;

type Tone = keyof typeof TONES;

/** Side of one pixel, in CSS pixels. */
const PIXEL = 4;
/** Seconds for one full lap. Slow enough to follow, quick enough to notice. */
const LAP = 3.4;
/** Share of the perimeter the tail covers. */
const TAIL = 0.16;
const FRAME_MS = 33;

type PixelTraceProps = {
  tone: Tone;
  className?: string;
};

export function PixelTrace({ tone, className }: PixelTraceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const [r, g, b] = TONES[tone];
    let cells: { x: number; y: number }[] = [];
    let cols = 0;
    let rows = 0;

    // The border, walked clockwise from the top-left. Precomputed once per
    // size so each frame is just an index into it.
    const trace = () => {
      const out: { x: number; y: number }[] = [];
      for (let x = 0; x < cols; x += 1) out.push({ x, y: 0 });
      for (let y = 1; y < rows; y += 1) out.push({ x: cols - 1, y });
      for (let x = cols - 2; x >= 0; x -= 1) out.push({ x, y: rows - 1 });
      for (let y = rows - 2; y >= 1; y -= 1) out.push({ x: 0, y });
      return out;
    };

    const resize = () => {
      const nextCols = Math.max(6, Math.round(canvas.clientWidth / PIXEL));
      const nextRows = Math.max(6, Math.round(canvas.clientHeight / PIXEL));
      if (nextCols === cols && nextRows === rows) return;
      cols = nextCols;
      rows = nextRows;
      canvas.width = cols;
      canvas.height = rows;
      cells = trace();
    };

    let frame = 0;
    let last = 0;
    let start = 0;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      if (!start) start = now;

      resize();
      if (!cells.length) return;

      ctx.clearRect(0, 0, cols, rows);

      const head = ((now - start) / (LAP * 1000)) % 1;
      const tail = Math.max(4, Math.round(cells.length * TAIL));
      const headIndex = Math.floor(head * cells.length);

      for (let i = 0; i < tail; i += 1) {
        const cell = cells[(headIndex - i + cells.length * 2) % cells.length];
        // Bright at the head, gone by the end of the tail.
        const fade = 1 - i / tail;
        ctx.fillStyle = `rgba(${r},${g},${b},${fade * fade * 0.95})`;
        ctx.fillRect(cell.x, cell.y, 1, 1);
      }
    };

    const startLoop = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(loop);
    };

    resize();
    startLoop();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden) {
        // Restart the clock so the light does not jump on return.
        start = 0;
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
