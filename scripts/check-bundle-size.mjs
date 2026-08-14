#!/usr/bin/env node
/**
 * Bundle budget.
 *
 * A landing page that loads slowly is a landing page for a privacy tool that
 * looks like everything else, and bundle size only ever grows by accident — one
 * import at a time, each defensible on its own. The 133 KB removed in the
 * ratchet-backdrop change is exactly the kind of win that quietly comes back.
 *
 * So this measures what the browser actually downloads — every client chunk
 * Next.js emits, gzipped the way a server would send it, one file at a time —
 * and fails when it exceeds the budget in bundle-budget.json.
 *
 * Raising the budget is allowed. It is a decision, made in a diff, with a reason
 * in the commit message. That is the whole point: not to freeze the number, but
 * to stop it moving without anyone noticing.
 *
 *   node scripts/check-bundle-size.mjs           check against the budget
 *   node scripts/check-bundle-size.mjs --print   just report, exit 0
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const staticDir = join(root, ".next", "static");
const budgetFile = join(root, "bundle-budget.json");
const routeManifests = {
  home: "[locale]/page",
  security: "[locale]/security/page",
  gettingStarted: "[locale]/getting-started/page",
  features: "[locale]/features/page",
  commands: "[locale]/commands/page",
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

let files;
try {
  files = walk(staticDir);
} catch {
  console.error(
    `No build found at ${relative(root, staticDir)} — run \`npm run build\` first.`,
  );
  process.exit(1);
}

if (files.length === 0) {
  // An empty build passing a size check is the failure mode this whole script
  // would otherwise be blind to.
  console.error(
    "Found no client chunks. That is a broken build, not a small one.",
  );
  process.exit(1);
}

// Gzipped per file, because that is how they are served: one request each, each
// compressed on its own. Concatenating first would flatter the total.
const measured = files
  .map((file) => ({
    file: relative(staticDir, file),
    raw: statSync(file).size,
    gzip: gzipSync(readFileSync(file), { level: 9 }).length,
  }))
  .sort((a, b) => b.gzip - a.gzip);

const totalGzip = measured.reduce((sum, f) => sum + f.gzip, 0);
const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

function routeBytes(route) {
  const manifest = join(
    root,
    ".next",
    "server",
    "app",
    `${route}_client-reference-manifest.js`,
  );
  try {
    const source = readFileSync(manifest, "utf-8");
    // Turbopack initialises the global first and assigns the JSON on a second
    // line, so the last assignment is the manifest rather than the bootstrap.
    const json = source
      .slice(source.lastIndexOf("= ") + 2)
      .replace(/;\s*$/, "");
    const data = JSON.parse(json);
    const chunks = new Set(
      Object.values(data.clientModules).flatMap((module) => module.chunks),
    );
    return [...chunks].reduce((sum, chunk) => {
      const file = join(root, ".next", chunk.replace(/^\/_next\//, ""));
      return sum + gzipSync(readFileSync(file), { level: 9 }).length;
    }, 0);
  } catch {
    return null;
  }
}

console.log(`Client chunks: ${measured.length}`);
console.log(`Total gzipped: ${kib(totalGzip)}`);
console.log("\nLargest:");
for (const f of measured.slice(0, 5)) {
  console.log(`  ${kib(f.gzip).padStart(10)}  ${f.file}`);
}

if (process.argv.includes("--routes")) {
  console.log("\nRoute client payloads (gzipped, shared chunks included):");
  for (const [name, route] of Object.entries(routeManifests)) {
    const bytes = routeBytes(route);
    console.log(
      `  ${name.padEnd(16)} ${bytes === null ? "unavailable" : kib(bytes)}`,
    );
  }
}

if (process.argv.includes("--print")) {
  process.exit(0);
}

const budget = JSON.parse(readFileSync(budgetFile, "utf-8"));
const limit = budget.totalGzipBytes;

console.log(`\nBudget: ${kib(limit)}`);

if (totalGzip > limit) {
  const over = totalGzip - limit;
  console.error(
    `\n✗ Over budget by ${kib(over)}.\n\n` +
      `  Either find the import that did this, or raise totalGzipBytes in\n` +
      `  bundle-budget.json and say why in the commit message. Both are fine —\n` +
      `  what is not fine is the number moving on its own.\n`,
  );
  process.exit(1);
}

console.log(`✓ Under budget with ${kib(limit - totalGzip)} to spare.`);
