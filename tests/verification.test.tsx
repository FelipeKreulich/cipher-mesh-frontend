import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SasCheck } from "@/components/site/sas-check";
import { keyArtBox } from "@/lib/key-art";
import { computeSas, DEMO_KEYS } from "@/lib/sas";

import { renderWithIntl } from "./helpers";

/**
 * The exact box the terminal client prints for this key, captured by running
 * `keyArt` from `src/shared/keyArt.js` in the CipherMesh repository.
 *
 * This is the point of the whole file: the site claims to run the same
 * algorithm the client runs, and a port that quietly drifts would turn the
 * verification section into a decorative lie. If a future change to the walk,
 * the coin ramp or the border breaks this, it should break loudly.
 */
const CLIENT_OUTPUT = [
  "+-----[rita]------+",
  "|  . ..=.E.       |",
  "| . +o+=Oo        |",
  "|. .o+==B+        |",
  "| . +=B*+oo       |",
  "|  + ====S        |",
  "|   o o+ =        |",
  "|     oo+ o       |",
  "|    . ...        |",
  "|                 |",
  "+-----------------+",
];

describe("key art", () => {
  it("reproduces the client's output exactly", () => {
    expect(keyArtBox(DEMO_KEYS.peer, "rita")).toEqual(CLIENT_OUTPUT);
  });

  it("draws a different picture for a different key", () => {
    // The entire reason the art is shown: a key that changed has to be obvious
    // at a glance, not on careful inspection.
    const mine = keyArtBox(DEMO_KEYS.you);
    const theirs = keyArtBox(DEMO_KEYS.middle);
    expect(mine).not.toEqual(theirs);
  });

  it("keeps every line the same width", () => {
    // Drawn with a monospace font, so one short row bends the whole frame.
    const widths = new Set(
      keyArtBox(DEMO_KEYS.you, "rita").map((l) => l.length),
    );
    expect([...widths]).toEqual([19]);
  });
});

describe("SAS", () => {
  it("is the same from either side", async () => {
    // Neither end sends the code, so agreement is only possible because both
    // sort the keys before hashing. Lose that and verification silently stops
    // working while still looking like it works.
    const mine = await computeSas(DEMO_KEYS.you, DEMO_KEYS.peer);
    const theirs = await computeSas(DEMO_KEYS.peer, DEMO_KEYS.you);
    expect(mine).toBe(theirs);
  });

  it("is thirteen digits grouped 4-4-5, like the client's", async () => {
    const code = await computeSas(DEMO_KEYS.you, DEMO_KEYS.peer);
    expect(code).toMatch(/^\d{4} \d{4} \d{5}$/);
  });

  it("differs once a third key is involved", async () => {
    const honest = await computeSas(DEMO_KEYS.you, DEMO_KEYS.peer);
    const intercepted = await computeSas(DEMO_KEYS.you, DEMO_KEYS.middle);
    expect(intercepted).not.toBe(honest);
  });
});

describe("SasCheck", () => {
  it("shows one code on a direct connection and two under interception", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SasCheck />);

    const codes = async () => {
      const panes = await screen.findAllByText(/SAS code for/);
      return panes.map(
        (node) => /\d{4} \d{4} \d{5}/.exec(node.textContent ?? "")?.[0],
      );
    };

    await waitFor(async () => {
      const [mine, theirs] = await codes();
      expect(mine).toBeDefined();
      expect(mine).toBe(theirs);
    });

    await user.click(screen.getByRole("button", { name: /middle/i }));

    // The claim the section exists to make: with a machine in between, the two
    // terminals cannot be made to agree.
    await waitFor(async () => {
      const [mine, theirs] = await codes();
      expect(mine).toBeDefined();
      expect(mine).not.toBe(theirs);
    });
  });

  it("tells the visitor what to do in each case", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SasCheck />);

    const verdict = () => screen.getByRole("status");

    await waitFor(() =>
      expect(within(verdict()).getByText(/verify-confirm/)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /middle/i }));

    await waitFor(() =>
      expect(within(verdict()).queryByText(/verify-confirm/)).toBeNull(),
    );
  });
});
