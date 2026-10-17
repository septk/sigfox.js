import { SigfoxClient } from './client.js'

export { SigfoxApiError, SigfoxConnectionError, SigfoxError } from './errors.js'
export { DEFAULT_BASE_URL, type Query, type QueryValue, type SigfoxClientOptions } from './http.js'
export { type Page, Paginator } from './pagination.js'
export type { CallOptions, Devices } from './resources/devices.js'
export type * from './types/devices.js'
export { VERSION } from './version.js'
export { SigfoxClient }

/** @deprecated v1 name. Use {@link SigfoxClient}. */
export const SigfoxApi = SigfoxClient
/** @deprecated v1 name. Use {@link SigfoxClient}. */
export type SigfoxApi = SigfoxClient

export default SigfoxClient
