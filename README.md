# sigfox-js

[![CI](https://github.com/septk/sigfox.js/actions/workflows/ci.yml/badge.svg)](https://github.com/septk/sigfox.js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/sigfox-js)](https://www.npmjs.com/package/sigfox-js)

Typed, zero-dependency Node.js client for the [Sigfox API v2](https://support.sigfox.com/apidocs).

- Real errors: failed calls throw, with the HTTP status and the API's error body.
- Pagination handled for you: `for await` over every device or message.
- Retries on rate limiting (429) and transient failures, timeouts, `AbortSignal` support.
- ESM and CommonJS, full TypeScript types, no runtime dependencies (uses the built-in `fetch`).

Requires Node.js 22 or later.

## Install

```sh
npm install sigfox-js
```

## Quick start

Create an API access in the Sigfox backend (**Group → API access**) and use its login and password.

```ts
import { SigfoxClient } from 'sigfox-js'
// or: const { SigfoxClient } = require('sigfox-js')

const sigfox = new SigfoxClient({
  username: process.env.SIGFOX_API_LOGIN!,
  password: process.env.SIGFOX_API_PASSWORD!,
})

const device = await sigfox.devices.get('1A2B3C')
console.log(device.name, device.lastCom)
```

## Pagination

List endpoints return a `Paginator`. Nothing is requested until you consume it.

```ts
// Every device, fetched page by page as you iterate
for await (const device of sigfox.devices.list({ groupIds: ['5f…'] })) {
  console.log(device.id, device.name)
}

// The last 24 h of messages, collected into an array (stops after 500)
const messages = await sigfox.devices
  .messages('1A2B3C', { since: new Date(Date.now() - 86_400_000) })
  .toArray(500)

// Just one request
const { data, paging } = await sigfox.devices.list().firstPage()
```

`since` and `before` accept a `Date` or a millisecond timestamp.

## Errors

```ts
import { SigfoxApiError, SigfoxConnectionError } from 'sigfox-js'

try {
  await sigfox.devices.get('nope')
} catch (error) {
  if (error instanceof SigfoxApiError) {
    console.error(error.status, error.body) // e.g. 404 { message: '…' }
  } else if (error instanceof SigfoxConnectionError) {
    console.error(error.timedOut ? 'timed out' : 'network error', error.cause)
  } else {
    throw error
  }
}
```

Both extend `SigfoxError`.

## Options

```ts
new SigfoxClient({
  username: '…',
  password: '…',
  baseUrl: 'https://api.sigfox.com/v2', // default
  timeoutMs: 30_000,                    // per attempt
  maxRetries: 2,                        // 429 always; 5xx and network errors on GET only
  fetch: customFetch,                   // proxies, instrumentation, tests
})
```

Every method also takes `{ signal }` as its last argument to cancel the call.

## Available calls

| Method | Endpoint |
| --- | --- |
| `devices.list(filters?)` | `GET /devices` |
| `devices.get(id)` | `GET /devices/{id}` |
| `devices.messages(id, { since?, before?, limit? })` | `GET /devices/{id}/messages` |
| `devices.messagesMetric(id)` | `GET /devices/{id}/messages/metric` |
| `devices.locations(id, { since?, before?, limit? })` | `GET /devices/{id}/locations` |
| `devices.undeliveredCallbacks(id, { since?, before?, limit? })` | `GET /devices/{id}/callbacks-not-delivered` |
| `devices.modemCertificate(id)` | `GET /devices/{id}/certificate/modem` |
| `devices.productCertificate(id)` | `GET /devices/{id}/certificate/product` |
| `devices.consumption(id, { year, month? })` | `GET /devices/{id}/consumption/{year}[/{month}]` |
| `devices.unsubscribeJobStatus(jobId)` | `GET /devices/bulk/unsubscribe/{jobId}` |

Anything not wrapped yet can be reached with the same auth, retries and errors:

```ts
const types = await sigfox.request('GET', '/device-types', { query: { limit: 10 } })
```

## Roadmap

- Devices: create, update, delete and bulk operations
- Device types, groups, users, contracts, coverages, callbacks

## Upgrading from 1.x

See [MIGRATION.md](./MIGRATION.md). The old method names still work but are deprecated.

## License

MIT
