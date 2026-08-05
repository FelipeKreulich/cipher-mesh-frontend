<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CipherMesh landing page — working notes

Read [CONTRIBUTING.md](CONTRIBUTING.md) first; it has the workflow and the
language rules. What follows is what is easy to get wrong here.

## What this page is arguing

CipherMesh's claim is that the relay cannot read anything. The page's job is to
make that checkable rather than asserted. Every section is a command and its
output (`~/ciphermesh $ …`), and the hero is the proof: the same conversation
twice, one sealed envelope per plaintext line, every envelope the same length,
none of them carrying a sender.

A change that makes the page assert more and show less is the wrong change.

## Rules that bite

**Copy lives in `messages/`.** Never hardcode a sentence in a component. The
exception is product UI — the client's own prompts (`Server`, `Room`, `/join`,
`/verify`) stay English everywhere, because the client has no i18n layer. Add a
key to one locale and you add it to the other; a test enforces it.

**The Portuguese is European.** `messages/pt.json` uses "tu" forms and
European vocabulary — ecrã, ficheiro, palavra-passe, ligação, correr, a correr.
Not "você", "tela", "arquivo", "senha", "rodando". The URL stays `/pt` but the
document declares `lang="pt-PT"`.

**Braces are ICU syntax.** `{ send }` sitting in prose is read as a variable and
throws at render time. Rewrite the sentence rather than escaping it. A test
guards this, with an allowlist of the placeholders that are real (`version`,
`tests`, `commands`, `p2p`).

**Numbers come from `src/lib/site.ts`.** Test count, command count, version —
each checkable against the client repository. Update them there, once.

**Vendored code is vendored.** `src/components/ui/**` plus `DecryptedText`,
`ScrambledText` and `Noise` come from `shadcn add`. Local adaptations exist and
say so in a comment (they render inline, fill their container, respect reduced
motion). ESLint exempts these paths instead of us patching upstream.

**Presence is a range, never a number.** `/api/presence` passes through what the
relay publishes — `1-5`, `6-20` — validated against a known set, so a
misconfigured relay cannot put arbitrary text on the page. Never ask the relay
for an exact count, a room name or a nickname: a live number would let anyone
polling the page watch people arrive and leave, which is the metadata the whole
project exists to withhold. When the relay is unreachable the component renders
**nothing** — an error or a zero would tell every visitor the project is dead
during a blip.

**Colour carries meaning.** Violet is what you hold, cyan is what is on the
wire, amber is the single warning on the page (plugins have no sandbox). A
fourth accent dilutes all three.

**Every animation needs a still state.** `CipherMesh3D`, `Noise`, the typing
hero, `Reveal`, `DecryptedText` and `ScrambledText` all check
`prefers-reduced-motion`. Anything new must too.

**Three.js is there for one thing: bloom.** It is the only dependency on the
page that costs real weight, so it is loaded after first paint via
`mesh-backdrop.tsx` and used for nothing else. If a future effect does not need
post-processing, write it in canvas like the fire, the dissolve and the trace.

## Already learned the hard way

- **WebGL uniforms belong to the program.** `CipherField` tracks its own
  width/height rather than reading `canvas.width`, because a remount onto an
  already-correctly-sized canvas skips `resize()` and never writes `uRes` into
  the new program — rendering at 0×0. Switching locale remounts the layout, so
  this was a real bug, not a hypothetical one.
- **Never call `loseContext()` in cleanup.** It kills the canvas permanently, so
  Strict Mode's second mount gets the dead context straight back from
  `getContext()`.
- **`userEvent.setup()` installs its own clipboard stub.** Plant clipboard mocks
  after it, never before.
- **`next/font` and weights.** Martian Mono is a variable font and takes no
  `weight`; the IBM Plex families are static and need explicit weights.

## Commands

```bash
npm run dev
npm run validate     # exactly what CI runs
```
