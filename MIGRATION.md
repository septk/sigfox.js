# Migrating from 1.x to 2.0

## 1. Errors now throw (the important one)

In 1.x a failed call **resolved** with the HTTP status text, so this "worked":

```js
const device = await api.devices.getDeviceInfo('BAD') // device === 'Not Found'
```

and a network failure crashed with `TypeError: Cannot read property 'statusText' of undefined`.

In 2.0 every failure rejects with a `SigfoxApiError` (HTTP error, with `status` and `body`) or a
`SigfoxConnectionError` (network / timeout). Wrap calls in `try/catch`, and remove any checks like
`typeof result === 'string'`.

## 2. Node.js 22+

The client uses the built-in `fetch`. axios is no longer a dependency.

## 3. Import

```js
// 1.x
const SigfoxApi = require('sigfox-js')

// 2.0 — CommonJS
const { SigfoxClient } = require('sigfox-js')
// 2.0 — ESM / TypeScript
import { SigfoxClient } from 'sigfox-js'
```

`SigfoxApi` is still exported as a deprecated alias of `SigfoxClient`, and is the default export.

## 4. Method names

The 1.x names still work and are marked `@deprecated`. They will be removed in 3.0.

| 1.x | 2.0 |
| --- | --- |
| `getDeviceInfo(id)` | `get(id)` |
| `getAllDevices()` | `list(filters?)` — see below |
| `getMessagesList(id)` | `messages(id, { since, before, limit })` |
| `getLocations(id)` | `locations(id, { since, before, limit })` |
| `getCallbacksNotDelivered(id)` | `undeliveredCallbacks(id, { since, before, limit })` |
| `getMessagesMetric(id)` | `messagesMetric(id)` |
| `getModemCert(id)` | `modemCertificate(id)` |
| `getProductCert(id)` | `productCertificate(id)` |
| `getDeviceConsYearly(id, y)` | `consumption(id, { year: y })` |
| `getDeviceConsMonthly(id, y, m)` | `consumption(id, { year: y, month: m })` |
| `unsubscribeActions(jobId)` | `unsubscribeJobStatus(jobId)` |

## 5. Lists are paginated

`getAllDevices()` only ever returned the first 100 devices. `list()` returns a `Paginator`:

```js
for await (const device of client.devices.list()) { … }   // all of them
const all = await client.devices.list().toArray()
const firstPage = await client.devices.list().firstPage() // { data, paging } like 1.x
```

The deprecated aliases (`getAllDevices`, `getMessagesList`, …) keep returning the first page only,
as before.

## 6. Types

Types were rewritten from scratch. `RootObject` and `Datum` are gone; use `Page<Device>` and
`Device`. `getModemCert` now returns the full `ModemCertificate` instead of `{ id }`.
