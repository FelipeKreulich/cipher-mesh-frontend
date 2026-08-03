"use client";

import React, { useEffect, useRef } from "react";

interface NoiseProps {
  /** Size of the generated tile in device pixels. */
  patternSize?: number;
  /** Redraw every Nth frame. Higher is cheaper and calmer. */
  patternRefreshInterval?: number;
  /** 0–255. */
  patternAlpha?: number;
  className?: string;
}

/**
 * Animated film grain.
 *
 * Adapted from the React Bits component: it fills whatever it is placed inside
 * instead of the viewport, draws a small tile rather than a 1024px one every
 * other frame, stops while the tab is hidden, and settles on a single static
 * frame when the visitor has asked for reduced motion.
 */
const Noise: React.FC<NoiseProps> = ({
  patternSize = 256,
  patternRefreshInterval = 3,
  patternAlpha = 14,
  className = "",
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = patternSize;
    canvas.height = patternSize;

    const drawGrain = () => {
      const image = ctx.createImageData(patternSize, patternSize);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(image, 0, 0);
    };

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let animationId = 0;

    const loop = () => {
      if (frame % patternRefreshInterval === 0) drawGrain();
      frame += 1;
      animationId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      if (animationId) window.cancelAnimationFrame(animationId);
      animationId = 0;
    };

    const play = () => {
      if (motion.matches) {
        stop();
        drawGrain();
        return;
      }
      if (!animationId) animationId = window.requestAnimationFrame(loop);
    };

    const onVisibility = () => (document.hidden ? stop() : play());

    play();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", play);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", play);
    };
  }, [patternSize, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      ref={grainRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
};

export default Noise;
