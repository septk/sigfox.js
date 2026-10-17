# Changelog

## 2.0.0

Full rewrite. See [MIGRATION.md](./MIGRATION.md).

### Breaking

- Failed requests reject with `SigfoxApiError` / `SigfoxConnectionError` instead of resolving with
  the status text.
- Requires Node.js 22+. axios removed; the client has no runtime dependencies.
- `SigfoxClient` is now a named export (default export and `SigfoxApi` alias kept).
- Types rewritten; `RootObject` / `Datum` removed in favour of `Page<Device>` / `Device`.

### Added

- Automatic pagination (`Paginator`: `for await`, `toArray(max)`, `pages()`, `firstPage()`).
- Filters on `list`, `messages`, `locations`, `undeliveredCallbacks` (`since`, `before`, `limit`…).
- Retries with `Retry-After` support on 429, and on 5xx / network errors for GET.
- Per-attempt timeout and `AbortSignal` on every call.
- `client.request()` escape hatch for endpoints not wrapped yet.
- New method names (`get`, `list`, `messages`, `consumption`…). The 1.x names are deprecated
  aliases.

### Fixed

- Headers defined in the config were never sent (only `auth` reached axios).
- `getAllDevices` silently capped results at 100.
- `getModemCert` was typed as `{ id }` only.
- Network errors crashed with a `TypeError` instead of a usable error.
- Device ids are now URL-encoded.

### Tooling

- TypeScript 6, tsup (ESM + CJS builds), Vitest with real coverage over all of `src/`, Biome.
- GitHub Actions for CI, npm trusted publishing and docs, replacing Travis and semantic-release.

## 1.1.0 and earlier

Published from the original 2019–2020 codebase.
