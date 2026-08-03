import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Presence } from "@/components/site/presence";

import { renderWithIntl } from "./helpers";

function mockPresence(body: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, json: async () => body }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Presence", () => {
  it("shows the range when the hub has people in it", async () => {
    mockPresence({ online: "6-20" });
    renderWithIntl(<Presence />);

    expect(
      await screen.findByText("6-20 people in the hub right now"),
    ).toBeInTheDocument();
  });

  it("invites the visitor in when the hub is empty", async () => {
    mockPresence({ online: "0" });
    renderWithIntl(<Presence />);

    expect(
      await screen.findByText("Nobody in the hub right now — be the first"),
    ).toBeInTheDocument();
  });

  it("renders nothing when the relay cannot be reached", async () => {
    // A failed fetch means "no information", not "the project is dead". An
    // error or a zero here would say the wrong thing to every visitor during a
    // blip, so the component has to disappear instead.
    mockPresence({ online: null });
    const { container } = renderWithIntl(<Presence />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { container } = renderWithIntl(<Presence />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
