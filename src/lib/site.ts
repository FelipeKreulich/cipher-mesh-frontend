import snapshot from "@/lib/commands.snapshot.json";

const PACKAGE = "ciphermesh";
const REPO = "https://github.com/FelipeKreulich/secret-chat-lan";

export const site = {
  name: "CipherMesh",
  hub: "ciphermesh.de",
  install: "npx ciphermesh@latest",
  author: "Felipe Kreulich",
  authorUrl: "https://github.com/FelipeKreulich",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ciphermesh.de",

  repo: REPO,
  frontendRepo: "https://github.com/FelipeKreulich/cipher-mesh-frontend",
  issues: `${REPO}/issues/new/choose`,
  npm: "https://www.npmjs.com/package/ciphermesh",
  docs: `${REPO}/blob/master/docs/ARCHITECTURE.md`,
  pluginDocs: `${REPO}/blob/master/docs/PLUGINS.md`,
  selfhostDocs: `${REPO}/blob/master/deploy/README.md`,
  contributing: `${REPO}/blob/master/CONTRIBUTING.md`,
  terms: `${REPO}/blob/master/TERMS.md`,
  security: `${REPO}/blob/master/SECURITY.md`,
  coffee: "https://www.buymeacoffee.com/felipekreulich",
} as const;

/**
 * Claims made on the page. They are numbers a visitor can check against the
 * repository, so they only move when the repository does.
 */
export const stats = {
  /** Fallback only. The live value comes from npm — see npmVersion(). */
  version: "2.10.0",
  tests: 472,
  /**
   * Fallbacks only. The live values come from the generated command list — see
   * `commandReference()`. They were hand-written until 2026-08-06 and had drifted
   * to 66 and 63 against a real 67 and 64, which is exactly the kind of small
   * wrong number that costs a page its credibility on all the others.
   */
  commands: snapshot.counts.total,
  p2pCommands: snapshot.counts.p2p,
} as const;

/**
 * The published version, read from npm rather than kept here.
 *
 * A hardcoded version is wrong the moment a release goes out, and this page
 * spends its credibility on claims being checkable — a stale number undermines
 * every other one next to it.
 *
 * Falls back to the constant above if the registry is slow or unreachable: a
 * slightly old number is better than a broken section.
 */
export async function npmVersion(): Promise<string> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${PACKAGE}/latest`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return stats.version;
    const data = await res.json();
    return typeof data?.version === "string" ? data.version : stats.version;
  } catch {
    return stats.version;
  }
}
