import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RatchetField } from "@/components/site/ratchet-field";

/** Must match CELL in the component: the grid everything is supposed to land on. */
const CELL = 4;

type Rect = { x: number; y: number; w: number; h: number; alpha: number };

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
 * A ResizeObserver that fires immediately, the way a real one does on observe.
 * Without it the component never sizes itself and never draws anything, and
 * every assertion below would pass against an empty canvas.
 */
function stubResizeObserver() {
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private cb: () => void) {}
      observe = () => this.cb();
      unobserve = vi.fn();
      disconnect = disconnect;
    },
  );
  return { disconnect };
}

function stubCanvas() {
  const rects: Rect[] = [];
  const clearRect = vi.fn();
  let style = "";

  const ctx = {
    clearRect,
    setTransform: vi.fn(),
    get fillStyle() {
      return style;
    },
    set fillStyle(value: string) {
      style = value;
    },
    fillRect: (x: number, y: number, w: number, h: number) => {
      const alpha = Number(/rgba\([^)]*,([\d.]+)\)$/.exec(style)?.[1]);
      rects.push({ x, y, w, h, alpha });
    },
  };

  const getContext = vi.fn(
    () => ctx,
  ) as unknown as HTMLCanvasElement["getContext"];
  HTMLCanvasElement.prototype.getContext = getContext;

  return { rects, clearRect, getContext };
}

beforeEach(() => {
  // jsdom lays nothing out, so the field would size itself to nothing.
  for (const [prop, value] of [
    ["clientWidth", 1200],
    ["clientHeight", 800],
  ] as const) {
    Object.defineProperty(HTMLCanvasElement.prototype, prop, {
      value,
      configurable: true,
    });
  }
  // A fixed layout: every rail lands on its own row, so the assertions below
  // are about the drawing rules rather than about which dice came up.
  vi.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("RatchetField", () => {
  it("is hidden from assistive technology", () => {
    reducedMotion(true);
    stubResizeObserver();
    stubCanvas();

    const { container } = render(<RatchetField />);
    expect(container.querySelector("canvas")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("draws a still field for reduced motion, and never schedules a frame", () => {
    reducedMotion(true);
    stubResizeObserver();
    const { rects } = stubCanvas();
    const raf = vi.spyOn(window, "requestAnimationFrame");

    render(<RatchetField />);

    // The mesh is worth seeing even when motion is not wanted, so the field is
    // composed rather than skipped — but nothing may keep running afterwards.
    expect(rects.length).toBeGreaterThan(0);
    expect(raf).not.toHaveBeenCalled();
  });

  it("lands every block on the pixel grid", () => {
    reducedMotion(true);
    stubResizeObserver();
    const { rects } = stubCanvas();

    render(<RatchetField />);

    // Half-pixel rectangles are what make canvas work look accidental. The
    // whole style depends on this holding for every block, including the
    // taller DH steps, which are drawn from a different origin.
    const offGrid = rects.filter(
      (r) =>
        r.x % CELL || r.y % CELL || r.w % CELL || r.h % CELL || !(r.alpha > 0),
    );
    expect(offGrid).toEqual([]);
  });

  it("keeps the newest key the brightest thing on its rail", () => {
    reducedMotion(true);
    stubResizeObserver();
    const { rects } = stubCanvas();

    render(<RatchetField />);

    // This is forward secrecy as the animation states it: on any one rail, the
    // further left a block is the older it is, and older must always mean
    // fainter. If a past key could ever outshine the current one the picture
    // would be claiming the opposite of what the protocol does.
    const rails = new Map<number, Rect[]>();
    for (const rect of rects) {
      const rail = rails.get(rect.y) ?? [];
      rail.push(rect);
      rails.set(rect.y, rail);
    }
    expect(rails.size).toBeGreaterThan(4);

    for (const rail of rails.values()) {
      const byX = [...rail].sort((a, b) => a.x - b.x);
      const brightening = byX.every(
        (rect, i) => i === 0 || rect.alpha >= byX[i - 1].alpha,
      );
      expect(brightening).toBe(true);
    }
  });

  it("clears before it paints, so trails cannot smear", () => {
    reducedMotion(true);
    stubResizeObserver();
    const { clearRect } = stubCanvas();

    render(<RatchetField />);
    expect(clearRect).toHaveBeenCalled();
  });

  it("sets up and tears down cleanly when motion is allowed", () => {
    // Every other test runs the reduced-motion path, which never starts the
    // loop. Without this one the stepping code is never exercised at all and
    // could throw in a browser while CI stays green.
    reducedMotion(false);
    const { disconnect } = stubResizeObserver();
    stubCanvas();

    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    const cancel = vi.spyOn(window, "cancelAnimationFrame");

    const { unmount } = render(<RatchetField />);

    expect(frames).toHaveLength(1);
    // Two ticks far enough apart to step every rail at least once.
    expect(() => frames[0](0)).not.toThrow();
    expect(() => frames[1](5000)).not.toThrow();

    expect(() => unmount()).not.toThrow();
    expect(cancel).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });
});
