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
3. Add it to the table in `README.md` and a line to `CHANGELOG.md`.

## Releasing

1. Bump `version` in `package.json` and `src/version.ts` (a test checks they match) and update
   `CHANGELOG.md`.
2. Merge to `master`, then publish a GitHub release tagged `vX.Y.Z`. The Release workflow publishes
   to npm.
