import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TranscriptPlayer } from "@/components/site/transcript-player";

describe("TranscriptPlayer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses a vertically scrollable, touch-friendly viewport on narrow screens", () => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    const { container } = render(<TranscriptPlayer replayLabel="Replay" />);
    const viewport = container.querySelector(
      '[data-slot="transcript-viewport"]',
    );

    expect(viewport).toHaveClass(
      "overflow-x-hidden",
      "overflow-y-auto",
      "touch-pan-y",
    );
  });
});
