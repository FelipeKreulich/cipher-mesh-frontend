# Contributing

Thanks for looking. This is the landing page for CipherMesh — bug reports about
the _client_ belong in
[the client repository](https://github.com/FelipeKreulich/secret-chat-lan/issues).

## Language

The project is public and aimed at an international audience, so anything a
stranger might read is **English**:

| Where                          | Language                            |
| ------------------------------ | ----------------------------------- |
| Code, comments, identifiers    | **English**                         |
| Issue titles and bodies        | **English**                         |
| Pull request titles and bodies | **English**                         |
| `README.md`, this file         | **English**                         |
| Commit messages                | Portuguese (Conventional Commits)   |
| `messages/en.json`             | English                             |
| `messages/pt.json`             | Portuguese — keep in sync with `en` |

Site copy is the exception: it exists in both, and a test fails if one file has a
key the other does not.

## Workflow

1. Open an **issue** describing the problem or the change.
2. Branch off `dev` — `feat/…`, `fix/…`, `chore/…`, `docs/…`.
3. Commit with a Conventional Commit message ending in `Refs #<issue>`.
4. PR into `dev`, then a release PR from `dev` into `master`.
5. Delete the branch.

`dev` and `master` are permanent and kept content-identical.

## Before you push

```bash
npm run validate      # lint + prettier + typecheck + the whole suite
```

Everything must be green — the pre-push hook runs typecheck and tests, and CI
runs all of it plus a production build. New behaviour needs a test; a bug fix
needs a test that fails without the fix.

## House rules

**Copy is design material.** Write it the way the interface should speak: plain
verbs, sentence case, no filler. Say what something does rather than selling it.
An error explains what happened and what to do next, in the interface's voice.

**Don't hand-edit vendored components.** `src/components/ui/**` and the React
Bits effects are fetched by `shadcn add`. If one genuinely needs changing, keep
the change small and mark it with a comment explaining why, so the next update
does not silently drop it.

**Every claim on the page must be checkable.** The numbers live in
`src/lib/site.ts` and the commands shown are real commands. If a section
describes a behaviour, that behaviour exists in the client today — this page
does not advertise a roadmap.

**Respect reduced motion.** Every animation on the site has a still state. If
you add one, give it a still state too.
