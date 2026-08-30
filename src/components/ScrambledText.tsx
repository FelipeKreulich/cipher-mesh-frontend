"use client";

import React, { useEffect, useRef } from "react";

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  children: React.ReactNode;
}

/** How often a scrambling character swaps glyph, at `speed` 1, in ms. */
const SWAP_MS = 16;

type Tween = { original: string; started: number; duration: number };

/**
 * Split the element's text into per-word and per-character spans, the shape
 * GSAP's SplitText produced. Words stay whole elements so a long heading still
 * wraps between words rather than mid-word, and whitespace between them is left
 * as text nodes so the line breaks where it always did.
 */
function split(root: HTMLElement) {
  // The nodes themselves, not their markup: replaceChildren detaches them but
  // they stay alive on this array, so reverting is a re-attach rather than a
  // re-parse of a string.
  const original = Array.from(root.childNodes);
  const chars: HTMLElement[] = [];
  const fragment = document.createDocumentFragment();

  for (const token of (root.textContent ?? "").split(/(\s+)/)) {
    if (token === "") continue;
    if (/^\s+$/.test(token)) {
      fragment.appendChild(document.createTextNode(token));
      continue;
    }
    const word = document.createElement("span");
    word.className = "inline-block";
    // Array.from splits by code point, so an emoji or an accented character is
    // one span rather than a pair of broken halves.
    for (const character of Array.from(token)) {
      const span = document.createElement("span");
      span.className = "inline-block will-change-transform";
      span.textContent = character;
      word.appendChild(span);
      chars.push(span);
    }
    fragment.appendChild(word);
  }

  root.replaceChildren(fragment);
  return {
    chars,
    revert: () => {
      root.replaceChildren(...original);
    },
  };
}

/**
 * Characters near the pointer fall apart and reassemble.
 *
 * Adapted from the React Bits component, which drove this with GSAP's SplitText
 * and ScrambleTextPlugin. It no longer does, and that is the point: GSAP was
 * this site's only use of GSAP, ~34 KiB gzipped of vendor code for one hover
 * flourish, and it was the thing that made the flourish unaffordable on
 * `/status`. That route is `force-dynamic`, and a route rendered on demand does
 * not share entry chunks with the static ones — adding the component there
 * pushed GSAP and `motion` into three per-route copies instead of one, +105 KiB
 * gzipped across the site, over the budget. The effect itself is a few dozen
 * lines of `requestAnimationFrame`, so it is a few dozen lines now, every page
 * can have it, and the site ships less JavaScript than before it did.
 *
 * Behaviour is unchanged: it renders inline so it can sit inside a heading,
 * carries no styling of its own, splits by word as well as character so long
 * lines still wrap between words, and does nothing at all — not even splitting
 * the DOM — when the visitor has asked for reduced motion.
 */
const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 110,
  duration = 1.1,
  speed = 0.5,
  scrambleChars = "01#$%&/",
  className = "",
  children,
}) => {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { chars, revert } = split(root);
    const glyphs = Array.from(scrambleChars);
    if (chars.length === 0 || glyphs.length === 0) return revert;

    // One entry per character currently scrambling. Re-entering a character
    // that is already running replaces its tween, which is what GSAP's
    // `overwrite: true` did — the nearer pass wins instead of the two fighting.
    const running = new Map<HTMLElement, Tween>();
    const swapEvery = SWAP_MS / Math.max(speed, 0.05);
    let lastSwap = 0;
    let frame = 0;

    const tick = (now: number) => {
      const swap = now - lastSwap >= swapEvery;
      if (swap) lastSwap = now;

      for (const [char, tween] of running) {
        if (now - tween.started >= tween.duration) {
          char.textContent = tween.original;
          running.delete(char);
          continue;
        }
        if (swap) {
          char.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }

      frame = running.size > 0 ? requestAnimationFrame(tick) : 0;
    };

    const handleMove = (event: PointerEvent) => {
      for (const char of chars) {
        const { left, top, width, height } = char.getBoundingClientRect();
        const distance = Math.hypot(
          event.clientX - (left + width / 2),
          event.clientY - (top + height / 2),
        );
        if (distance >= radius) continue;

        running.set(char, {
          // The character a running tween is already scrambling is not its own
          // text any more, so the letter to restore comes from the existing
          // tween when there is one.
          original: running.get(char)?.original ?? char.textContent ?? "",
          started: performance.now(),
          // Nearer the pointer, longer the fall — the same falloff as before.
          duration: duration * (1 - distance / radius) * 1000,
        });
      }
      if (running.size > 0 && frame === 0) {
        frame = requestAnimationFrame(tick);
      }
    };

    root.addEventListener("pointermove", handleMove);

    return () => {
      root.removeEventListener("pointermove", handleMove);
      if (frame !== 0) cancelAnimationFrame(frame);
      revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <span ref={rootRef} className={className}>
      {children}
    </span>
  );
};

export default ScrambledText;
