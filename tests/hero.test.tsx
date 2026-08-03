import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { messages, renderWithIntl } from "./helpers";

// With reduced motion the hero renders its finished state, which is the frame
// worth asserting on: every line typed, every envelope sealed.
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => true,
}));

const { Hero } = await import("@/components/sections/hero");

describe("Hero", () => {
  it("shows the headline", () => {
    renderWithIntl(<Hero />);
    expect(
      screen.getByRole("heading", { level: 1, name: messages.hero.title }),
    ).toBeInTheDocument();
  });

  it("shows every line of the transcript", () => {
    renderWithIntl(<Hero />);
    for (const line of messages.hero.transcript) {
      expect(screen.getByText(line.text)).toBeInTheDocument();
    }
  });

  it("pairs one envelope with each line", () => {
    const { container } = renderWithIntl(<Hero />);
    const plain = container.querySelectorAll('[data-slot="plain-row"]');
    const sealed = container.querySelectorAll('[data-slot="sealed-row"]');

    expect(plain).toHaveLength(messages.hero.transcript.length);
    expect(sealed).toHaveLength(plain.length);
  });

  it("seals every line to the same length, however long it is", () => {
    // The claim the pane makes in words — padding hides the plaintext length —
    // has to hold in the markup, or the demonstration is a lie.
    const { container } = renderWithIntl(<Hero />);
    const lengths = [
      ...container.querySelectorAll('[data-slot="sealed-row"]'),
    ].map((row) => row.textContent?.length);

    expect(new Set(lengths).size).toBe(1);
  });

  it("offers the install command", () => {
    renderWithIntl(<Hero />);
    expect(screen.getByText("npx ciphermesh@latest")).toBeInTheDocument();
  });
});
