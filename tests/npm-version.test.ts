import { afterEach, describe, expect, it, vi } from "vitest";

import { npmVersion, stats } from "@/lib/site";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("npmVersion", () => {
  it("reports what npm actually published", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: "9.9.9" }),
      }),
    );

    await expect(npmVersion()).resolves.toBe("9.9.9");
  });

  it("falls back when the registry is unreachable", async () => {
    // The page is worth more with a slightly old number than with a broken
    // section, so a registry outage must never take the proof down.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(npmVersion()).resolves.toBe(stats.version);
  });

  it("falls back on a bad response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );

    await expect(npmVersion()).resolves.toBe(stats.version);
  });

  it("falls back when the payload has no version", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ name: "ciphermesh" }),
      }),
    );

    await expect(npmVersion()).resolves.toBe(stats.version);
  });
});
