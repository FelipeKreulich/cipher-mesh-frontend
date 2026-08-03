import { describe, expect, it } from "vitest";

import en from "@/../messages/en.json";
import pt from "@/../messages/pt.json";

type Tree = { [key: string]: unknown };

function paths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => paths(item, `${prefix}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Tree).flatMap(([key, child]) =>
      paths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") {
    return Object.values(value as Tree).flatMap(strings);
  }
  return [];
}

describe("messages", () => {
  it("has the same keys in both locales", () => {
    // A key added to one file and forgotten in the other renders the raw key
    // path to the visitor, so the two trees must stay identical.
    expect(paths(pt).sort()).toEqual(paths(en).sort());
  });

  it.each([
    ["en", en],
    ["pt", pt],
  ])("only uses known placeholders in %s", (_locale, tree) => {
    // next-intl parses every string as ICU, so a stray brace in prose — say a
    // code sample written as { send } — becomes a variable the component never
    // passes, and the section throws at render time.
    const allowed = new Set(["version", "tests", "commands", "p2p"]);
    const used = new Set<string>();

    for (const value of strings(tree)) {
      for (const match of value.matchAll(/\{\s*([^}]*?)\s*\}/g)) {
        used.add(match[1]);
      }
    }

    expect([...used].filter((name) => !allowed.has(name))).toEqual([]);
  });

  it.each([
    ["en", en],
    ["pt", pt],
  ])("has no empty strings in %s", (_locale, tree) => {
    const empties = paths(tree).filter((path) => {
      const value = path
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .reduce<unknown>(
          (node, key) => (node as Tree | undefined)?.[key],
          tree as unknown,
        );
      return typeof value === "string" && value.trim() === "";
    });

    expect(empties).toEqual([]);
  });
});
