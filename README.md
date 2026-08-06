# CipherMesh — landing page

The website for [CipherMesh](https://github.com/FelipeKreulich/secret-chat-lan), a
terminal chat where the relay only ever sees ciphertext.

The page has one job: make the central claim checkable in the first five
seconds. The hero shows the same conversation twice — the plaintext on your
machine and the sealed envelope the relay stores — one envelope per line, every
envelope the same length, and no sender attached to any of them.

**Live:** [ciphermesh.de](https://ciphermesh.de) · **Client:**
[`npx ciphermesh@latest`](https://www.npmjs.com/package/ciphermesh)

## Stack

|            |                                                         |
| ---------- | ------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                      |
| Styling    | Tailwind CSS v4, design tokens in `src/app/globals.css` |
| Components | shadcn/ui (`radix-nova`), React Bits effects            |
| Motion     | Motion, GSAP (SplitText + ScrambleText), canvas 2D      |
| i18n       | next-intl — English and Portuguese                      |
| Tests      | Vitest + Testing Library                                |

## Running it

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /en
```

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Development server                      |
| `npm run build`     | Production build                        |
| `npm run lint`      | ESLint                                  |
| `npm run format`    | Prettier (writes)                       |
| `npm run typecheck` | `tsc --noEmit`                          |
| `npm test`          | Vitest, once                            |
| `npm run validate`  | Lint + format check + typecheck + tests |

`npm run validate` is what CI runs. Run it before pushing.

## Layout

```
messages/                 en.json / pt.json — all copy lives here
src/
  app/[locale]/           layout, page, error, not-found
  app/icon.svg            the mark, also the favicon
  components/sections/    one file per section of the page
  components/site/        header, footer, shared page furniture
  components/ui/          shadcn primitives (vendored — do not hand-edit)
  components/*.tsx        React Bits effects (vendored, locally adapted)
  i18n/                   next-intl routing, navigation, request config
  lib/site.ts             links and the numbers the page claims
  lib/cipher.ts           deterministic stand-in for a sealed envelope
tests/                    Vitest suites
```

### Copy

No string is hardcoded in a component unless it is product UI — the client's own
prompts (`Server`, `Room`, `/join`) stay in English everywhere, because the
client has no i18n layer and never pretends to. Everything else goes in
`messages/en.json` and `messages/pt.json`, and a test fails if the two files
drift apart.

Watch the braces: next-intl parses every string as ICU, so `{ send }` sitting in
prose becomes a variable the component never passes and the section throws at
render time. A test catches that too.

### Design tokens

`src/app/globals.css` is the single source. Violet (`--color-signal`) marks
anything you hold — plaintext, your keys, your input. Cyan (`--color-wire`)
marks anything on the wire. Amber (`--color-warn`) is reserved for the one
warning on the page. Nothing else gets an accent.

### Numbers

`src/lib/site.ts` holds the test count, command count and version the page
claims. Each is checkable against the client repository, so they move only when
it does.

### Vendored components

`src/components/ui/**` and the React Bits effects (`DecryptedText`,
`ScrambledText`, `Noise`) come from `shadcn add`. They are re-fetched on update,
so a hand-edit there is a hand-edit you will lose — the local adaptations that
do exist are marked with a comment saying so, and ESLint exempts these paths
from `react-hooks/set-state-in-effect` rather than patching them.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md)
for the workflow and the language rules. Short version: issues and PRs in
English, commits in Portuguese, branch off `dev`.

## Licence

MIT. See [LICENSE](LICENSE).
