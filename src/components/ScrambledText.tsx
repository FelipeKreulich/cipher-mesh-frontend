"use client";

import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import React, { useEffect, useRef } from "react";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Characters near the pointer fall apart and reassemble.
 *
 * Adapted from the React Bits component: it renders inline so it can sit inside
 * a heading, carries no styling of its own, splits by word as well as character
 * so long lines still wrap between words, and does nothing at all when the
 * visitor has asked for reduced motion.
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

    const split = SplitText.create(root, {
      type: "words,chars",
      wordsClass: "inline-block",
      charsClass: "inline-block will-change-transform",
    });

    split.chars.forEach((el) => {
      const char = el as HTMLElement;
      gsap.set(char, { attr: { "data-content": char.innerHTML } });
    });

    const handleMove = (event: PointerEvent) => {
      split.chars.forEach((el) => {
        const char = el as HTMLElement;
        const { left, top, width, height } = char.getBoundingClientRect();
        const distance = Math.hypot(
          event.clientX - (left + width / 2),
          event.clientY - (top + height / 2),
        );
        if (distance >= radius) return;

        gsap.to(char, {
          overwrite: true,
          duration: duration * (1 - distance / radius),
          scrambleText: {
            text: char.dataset.content || "",
            chars: scrambleChars,
            speed,
          },
          ease: "none",
        });
      });
    };

    root.addEventListener("pointermove", handleMove);

    return () => {
      root.removeEventListener("pointermove", handleMove);
      split.revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <span ref={rootRef} className={className}>
      {children}
    </span>
  );
};

export default ScrambledText;
