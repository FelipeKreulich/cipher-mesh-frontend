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
  version: "2.6.0",
  tests: 418,
  commands: 64,
  p2pCommands: 61,
} as const;
