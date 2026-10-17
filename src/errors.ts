/** Base class for every error thrown by this library. */
export class SigfoxError extends Error {
  override name = 'SigfoxError'
}

/**
 * The Sigfox API answered with a non-2xx status.
 *
 * `body` holds the parsed JSON error payload when there is one, otherwise the raw text.
 */
export class SigfoxApiError extends SigfoxError {
  override name = 'SigfoxApiError'

  constructor(
    readonly status: number,
    readonly method: string,
    readonly url: string,
    readonly body: unknown,
  ) {
    super(`Sigfox API ${method} ${url} failed with ${status}${describe(body)}`)
  }
}

/** The request never got a response: DNS, connection reset, timeout… */
export class SigfoxConnectionError extends SigfoxError {
  override name = 'SigfoxConnectionError'

  constructor(
    message: string,
    readonly method: string,
    readonly url: string,
    readonly timedOut: boolean,
    options?: { cause?: unknown },
  ) {
    super(message, options)
  }
}

function describe(body: unknown): string {
  if (typeof body === 'string' && body.trim()) return `: ${body.trim().slice(0, 200)}`
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return `: ${body.message}`
  }
  return ''
}
