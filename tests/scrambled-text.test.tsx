import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScrambledText from "@/components/ScrambledText";

function reducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));
}

/**
 * A hand-driven clock for the animation loop: `now` is what both
 * `performance.now()` and the frame callback report, so a test can step the
 * effect forward by an exact number of milliseconds.
 */
function frameClock() {
  let now = 0;
  const pending: FrameRequestCallback[] = [];

  vi.stubGlobal("performance", { now: () => now });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    pending.push(cb);
    return pending.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});

  return {
    advance(ms: number) {
      now += ms;
      const due = pending.splice(0, pending.length);
      act(() => {
        for (const cb of due) cb(now);
      });
    },
  };
}

/**
 * jsdom gives every element a zero-size rect, so distance from the pointer is
 * always 0 and every character is in range. Placing them by index instead lets
 * a test aim at one character and check the falloff on the others.
 */
function layOutChars(root: HTMLElement, spacing = 100) {
  const chars = root.querySelectorAll(":scope > span > span");
  chars.forEach((char, index) => {
    (char as HTMLElement).getBoundingClientRect = () =>
      ({
        left: index * spacing,
        top: 0,
        width: 0,
        height: 0,
      }) as DOMRect;
  });
  return [...chars] as HTMLElement[];
}

function pointerAt(root: HTMLElement, x: number) {
  act(() => {
    const event = new Event("pointermove", { bubbles: true }) as PointerEvent;
    Object.defineProperty(event, "clientX", { value: x });
    Object.defineProperty(event, "clientY", { value: 0 });
    root.dispatchEvent(event);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ScrambledText", () => {
  beforeEach(() => {
    reducedMotion(false);
  });

  it("leaves the DOM alone when the visitor asked for reduced motion", () => {
    reducedMotion(true);
    const { container } = render(<ScrambledText>hello there</ScrambledText>);

    // Not merely "does not animate" — it must not split the heading into
    // per-character spans either, which is DOM a screen reader has to walk.
    expect(container.querySelectorAll("span span")).toHaveLength(0);
    expect(container.textContent).toBe("hello there");
  });

  it("splits into words and characters without changing the text", () => {
    const { container } = render(<ScrambledText>ab cd</ScrambledText>);
    const root = container.firstElementChild as HTMLElement;

    // Words stay whole elements so a long heading still wraps between words.
    expect(root.querySelectorAll(":scope > span")).toHaveLength(2);
    expect(root.querySelectorAll(":scope > span > span")).toHaveLength(4);
    expect(root.textContent).toBe("ab cd");
  });

  it("keeps a code point whole", () => {
    // Splitting by UTF-16 unit would put half a surrogate pair in each span.
    const { container } = render(<ScrambledText>a🦊b</ScrambledText>);
    const chars = [
      ...container.querySelectorAll(":scope span > span > span"),
    ].map((span) => span.textContent);
    expect(chars).toEqual(["a", "🦊", "b"]);
  });

  it("scrambles what is near the pointer and restores it", () => {
    const clock = frameClock();
    const { container } = render(
      <ScrambledText radius={110} duration={1} scrambleChars="#">
        abc
      </ScrambledText>,
    );
    const root = container.firstElementChild as HTMLElement;
    const chars = layOutChars(root);

    pointerAt(root, 0); // on the first character; the third is 200px away
    clock.advance(40); // past the first glyph swap (32ms at the default speed)

    expect(chars[0].textContent).toBe("#");
    expect(chars[2].textContent).toBe("c");

    // The falloff is linear in distance, so the nearest character runs the
    // longest — a full `duration` — and lands back on its own letter.
    clock.advance(1000);
    expect(chars[0].textContent).toBe("a");
  });

  it("a second pass restores the letter, not the glyph it was showing", () => {
    // The regression this guards: re-entering a character mid-scramble and
    // reading its "original" off the DOM would freeze it on a scramble glyph.
    const clock = frameClock();
    const { container } = render(
      <ScrambledText radius={110} duration={1} scrambleChars="#">
        abc
      </ScrambledText>,
    );
    const root = container.firstElementChild as HTMLElement;
    const chars = layOutChars(root);

    pointerAt(root, 0);
    clock.advance(40);
    expect(chars[0].textContent).toBe("#");

    pointerAt(root, 0); // second pass while the first is still running
    clock.advance(2000);
    expect(chars[0].textContent).toBe("a");
  });

  it("puts the original text back on unmount", () => {
    const clock = frameClock();
    const { container, unmount } = render(<ScrambledText>ab cd</ScrambledText>);
    const root = container.firstElementChild as HTMLElement;
    layOutChars(root);
    pointerAt(root, 0);
    clock.advance(40);

    unmount();
    expect(container.textContent).toBe("");
  });
});
