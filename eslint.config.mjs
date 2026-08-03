import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Files produced by `shadcn add` — both the shadcn/ui primitives and the React
 * Bits effects — are vendored, not authored here. They get re-fetched on
 * update, so patching them to satisfy a lint rule loses the patch. Their one
 * offence is setState-in-effect, which is how those components work.
 */
const VENDORED = [
  "src/components/ui/**",
  "src/hooks/use-mobile.ts",
  "src/components/DecryptedText.tsx",
  "src/components/ScrambledText.tsx",
  "src/components/Noise.tsx",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: VENDORED,
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
