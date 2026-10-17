import { SigfoxApiError, SigfoxConnectionError, SigfoxError } from './errors.js'
import { VERSION } from './version.js'

export const DEFAULT_BASE_URL = 'https://api.sigfox.com/v2'

export interface SigfoxClientOptions {
  /** API access login, from the Sigfox backend ("API access" page). */
  username: string
  /** API access password. */
  password: string
  /** Override the API root. Defaults to `https://api.sigfox.com/v2`. */
  baseUrl?: string
  /** Per-attempt timeout in milliseconds. Defaults to 30 000. */
  timeoutMs?: number
  /**
   * How many times to retry a request after a 429, or after a 5xx / connection failure on a
   * GET. Defaults to 2. Set to 0 to disable retries.
   */
  maxRetries?: number
  /** Custom `fetch` implementation (proxies, instrumentation, tests). Defaults to global fetch. */
  fetch?: typeof fetch
}

export type QueryValue = string | number | boolean | Date | null | undefined
export type Query = Record<string, QueryValue | readonly QueryValue[]>

export interface RequestOptions {
  query?: Query | undefined
  body?: unknown
  signal?: AbortSignal | undefined
}

const RETRYABLE_GET_STATUSES = new Set([502, 503, 504])
const MAX_RETRY_DELAY_MS = 60_000

/** @internal */
export class HttpClient {
  readonly baseUrl: string
  private readonly authorization: string
  private readonly timeoutMs: number
  private readonly maxRetries: number
  private readonly fetchImpl: typeof fetch

  constructor(options: SigfoxClientOptions) {
    if (!options?.username || !options?.password) {
      throw new SigfoxError('SigfoxClient needs both `username` and `password`')
    }
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
    this.authorization = `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`
    this.timeoutMs = options.timeoutMs ?? 30_000
    this.maxRetries = options.maxRetries ?? 2
    const fetchImpl = options.fetch ?? globalThis.fetch
    if (typeof fetchImpl !== 'function') {
      throw new SigfoxError('No fetch implementation available; pass one in `options.fetch`')
    }
    this.fetchImpl = fetchImpl
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options)
  }

  async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, options.query)
    const headers: Record<string, string> = {
      Authorization: this.authorization,
      Accept: 'application/json',
      'User-Agent': `sigfox-js/${VERSION}`,
    }
    let body: string | undefined
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }

    for (let attempt = 0; ; attempt++) {
      const canRetry = attempt < this.maxRetries
      const timeout = AbortSignal.timeout(this.timeoutMs)
      const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout

      let response: Response
      try {
        response = await this.fetchImpl(url, { method, headers, body: body ?? null, signal })
      } catch (error) {
        if (options.signal?.aborted) throw options.signal.reason
        const timedOut = timeout.aborted
        if (canRetry && method === 'GET') {
          await sleep(backoff(attempt), options.signal)
          continue
        }
        throw new SigfoxConnectionError(
          timedOut
            ? `Sigfox API ${method} ${url} timed out after ${this.timeoutMs} ms`
            : `Sigfox API ${method} ${url} failed: ${(error as Error)?.message ?? error}`,
          method,
          url,
          timedOut,
          { cause: error },
        )
      }

      if (response.ok) return (await parseBody(response)) as T

      const retryable =
        response.status === 429 || (method === 'GET' && RETRYABLE_GET_STATUSES.has(response.status))
      if (canRetry && retryable) {
        await response.body?.cancel()
        await sleep(retryAfter(response) ?? backoff(attempt), options.signal)
        continue
      }
      throw new SigfoxApiError(response.status, method, url, await parseBody(response))
    }
  }

  private buildUrl(path: string, query?: Query): string {
    let url: URL
    if (/^https?:\/\//i.test(path)) {
      // Absolute URLs come from `paging.next`. Never send credentials to another host.
      url = new URL(path)
      if (url.origin !== new URL(this.baseUrl).origin) {
        throw new SigfoxError(`Refusing to call ${url.origin}: it is not the configured API host`)
      }
    } else {
      url = new URL(this.baseUrl + (path.startsWith('/') ? path : `/${path}`))
    }
    for (const [key, raw] of Object.entries(query ?? {})) {
      const values = Array.isArray(raw) ? raw : [raw]
      for (const value of values) {
        if (value === undefined || value === null) continue
        url.searchParams.append(
          key,
          value instanceof Date ? String(value.getTime()) : String(value),
        )
      }
    }
    return url.toString()
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function backoff(attempt: number): number {
  return Math.min(500 * 2 ** attempt, MAX_RETRY_DELAY_MS)
}

function retryAfter(response: Response): number | undefined {
  const header = response.headers.get('retry-after')
  if (!header) return undefined
  const seconds = Number(header)
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now()
  return Number.isFinite(ms) ? Math.min(Math.max(ms, 0), MAX_RETRY_DELAY_MS) : undefined
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
