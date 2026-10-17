import { HttpClient, type Query, type SigfoxClientOptions } from './http.js'
import { Devices } from './resources/devices.js'

/**
 * Client for the Sigfox API v2.
 *
 * ```ts
 * import { SigfoxClient } from 'sigfox-js'
 *
 * const sigfox = new SigfoxClient({ username: process.env.SIGFOX_USER!, password: process.env.SIGFOX_PASS! })
 * for await (const device of sigfox.devices.list()) console.log(device.id, device.name)
 * ```
 */
export class SigfoxClient {
  readonly devices: Devices
  private readonly http: HttpClient

  constructor(options: SigfoxClientOptions) {
    this.http = new HttpClient(options)
    this.devices = new Devices(this.http)
  }

  /**
   * Escape hatch for endpoints this library doesn't wrap yet. `path` is relative to the API
   * root, e.g. `request('GET', '/device-types')`. Errors are thrown as for any other call.
   */
  request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: { query?: Query; body?: unknown; signal?: AbortSignal } = {},
  ): Promise<T> {
    return this.http.request<T>(method, path, options)
  }
}
