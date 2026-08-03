import { describe, expect, it } from "vitest";

import { sealedLines } from "@/lib/cipher";

describe("sealedLines", () => {
  it("returns the requested shape", () => {
    const rows = sealedLines("seed", 3, 44);
    expect(rows).toHaveLength(3);
    for (const row of rows) expect(row).toHaveLength(44);
  });

  it("is deterministic for the same seed", () => {
    // The hero renders on the server and again on the client. Anything random
    // here would be a hydration mismatch.
    expect(sealedLines("hello", 2, 20)).toEqual(sealedLines("hello", 2, 20));
  });

  it("produces different output for different seeds", () => {
    expect(sealedLines("a", 1, 40)[0]).not.toEqual(sealedLines("b", 1, 40)[0]);
  });

  it("only emits base64 characters", () => {
    expect(sealedLines("alphabet", 4, 60).join("")).toMatch(/^[A-Za-z0-9+/]+$/);
  });

  it("gives every message the same length, whatever it says", () => {
    // This is the claim the hero makes visually: padding hides the length of
    // the plaintext, so a short line and a long one seal to the same size.
    const short = sealedLines("0:hi", 1, 44)[0];
    const long = sealedLines(
      "1:a considerably longer sentence than the other one",
      1,
      44,
    )[0];
    expect(long).toHaveLength(short.length);
  });
});
