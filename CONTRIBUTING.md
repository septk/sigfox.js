# Contributing

Thanks for helping out.

## Setup

Node.js 22 or later.

```sh
git clone https://github.com/septk/sigfox.js
cd sigfox.js
npm install
```

## Before opening a PR

```sh
npm run check   # lint + typecheck + tests (with coverage thresholds) + build
npm run format  # auto-fix formatting and import order
```

Every endpoint needs a test that asserts the exact URL and query string it calls; see
`test/devices.test.ts`. Tests never hit the real API: pass a fake `fetch` (see `test/helpers.ts`).

## Adding an endpoint

1. Add the response and parameter types under `src/types/`.
2. Add the method to the resource class under `src/resources/` (or a new resource, wired in
   `src/client.ts` and exported from `src/index.ts`). List endpoints return a `Paginator`.
3. Add it to the table in `README.md`.

## Releasing

Releases are automatic. Every merge to `master` runs semantic-release, which reads the
Conventional Commit messages since the last tag, picks the version, publishes to npm and writes
the GitHub release notes. Never edit `version` in `package.json` by hand.

| Commit / PR title | Release |
| --- | --- |
| `fix: …` | patch |
| `feat: …` | minor |
| `feat!: …` or a `BREAKING CHANGE:` footer | major |
| `docs:`, `chore:`, `test:`, `ci:`, `refactor:` … | none |

PRs are squash-merged, so the **PR title** becomes the commit message; a check enforces the
format.
