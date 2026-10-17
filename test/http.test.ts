import { afterEach, describe, expect, it, vi } from 'vitest'
import { SigfoxApiError, SigfoxConnectionError, SigfoxError } from '../src/index.js'
import { client, json, mockFetch } from './helpers.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('request basics', () => {
  it('sends Basic auth, Accept and User-Agent, and no Content-Type on GET', async () => {
    const { fetch, calls } = mockFetch(() => json({ id: 'A1', name: 'x' }))
    await client(fetch).devices.get('A1')

    const [call] = calls
    expect(call?.method).toBe('GET')
    expect(call?.url).toBe('https://api.sigfox.com/v2/devices/A1')
    expect(call?.headers.Authorization).toBe(`Basic ${Buffer.from('user:pass').toString('base64')}`)
    expect(call?.headers.Accept).toBe('application/json')
    expect(call?.headers['User-Agent']).toMatch(/^sigfox-js\/\d+\.\d+\.\d+/)
    expect(call?.headers['Content-Type']).toBeUndefined()
    expect(call?.body).toBeNull()
  })

  it('serialises query params: arrays repeated, Dates as ms, nullish skipped', async () => {
    const { fetch, calls } = mockFetch(() => json({ data: [] }))
    const since = new Date('2026-01-01T00:00:00Z')
    await client(fetch).request('GET', 'devices', {
      query: { groupIds: ['g1', 'g2'], since, before: 5, deep: false, skip: undefined, no: null },
    })

    const url = new URL(calls[0]?.url ?? '')
    expect(url.pathname).toBe('/v2/devices')
    expect(url.searchParams.getAll('groupIds')).toEqual(['g1', 'g2'])
    expect(url.searchParams.get('since')).toBe(String(since.getTime()))
    expect(url.searchParams.get('before')).toBe('5')
    expect(url.searchParams.get('deep')).toBe('false')
    expect(url.searchParams.has('skip')).toBe(false)
    expect(url.searchParams.has('no')).toBe(false)
  })

  it('sends JSON bodies with a Content-Type', async () => {
    const { fetch, calls } = mockFetch(() => json({ id: 'new' }, 201))
    const result = await client(fetch).request('POST', '/device-types', { body: { name: 'dt' } })

    expect(result).toEqual({ id: 'new' })
    expect(calls[0]?.headers['Content-Type']).toBe('application/json')
    expect(calls[0]?.body).toBe('{"name":"dt"}')
  })

  it('honours a custom baseUrl, with or without trailing slash', async () => {
    const { fetch, calls } = mockFetch(() => json({}))
    await client(fetch, { baseUrl: 'https://example.test/v2///' }).devices.get('A1')
    expect(calls[0]?.url).toBe('https://example.test/v2/devices/A1')
  })

  it('returns undefined for empty bodies and raw text for non-JSON bodies', async () => {
    const { fetch } = mockFetch(
      () => new Response(null, { status: 204 }),
      () => new Response('plain', { status: 200 }),
    )
    const sigfox = client(fetch)
    await expect(sigfox.request('DELETE', '/x')).resolves.toBeUndefined()
    await expect(sigfox.request('GET', '/y')).resolves.toBe('plain')
  })
})

describe('errors', () => {
  it('throws SigfoxApiError with status and parsed body (does not resolve, unlike v1)', async () => {
    const { fetch } = mockFetch(() => json({ message: 'Device not found' }, 404))
    const error = await client(fetch)
      .devices.get('NOPE')
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(SigfoxApiError)
    expect(error).toBeInstanceOf(SigfoxError)
    expect(error).toMatchObject({
      name: 'SigfoxApiError',
      status: 404,
      method: 'GET',
      url: 'https://api.sigfox.com/v2/devices/NOPE',
      body: { message: 'Device not found' },
    })
    expect((error as Error).message).toContain('404: Device not found')
  })

  it('keeps text error bodies and builds a message without a body', async () => {
    const { fetch } = mockFetch(
      () => new Response('Unauthorized', { status: 401 }),
      () => new Response(null, { status: 403 }),
      () => json({ unexpected: true }, 400),
    )
    const sigfox = client(fetch)
    await expect(sigfox.devices.get('A')).rejects.toMatchObject({
      status: 401,
      body: 'Unauthorized',
    })
    await expect(sigfox.devices.get('A')).rejects.toThrow(/failed with 403$/)
    await expect(sigfox.devices.get('A')).rejects.toThrow(/failed with 400$/)
  })

  it('wraps network failures in SigfoxConnectionError with the cause', async () => {
    const boom = new TypeError('fetch failed')
    const { fetch, calls } = mockFetch(() => {
      throw boom
    })
    const error = await client(fetch, { maxRetries: 0 })
      .devices.get('A')
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(SigfoxConnectionError)
    expect(error).toMatchObject({ timedOut: false, method: 'GET', cause: boom })
    expect((error as Error).message).toContain('fetch failed')
    expect(calls).toHaveLength(1)
  })

  it('handles non-Error rejections from fetch', async () => {
    const { fetch } = mockFetch(() => Promise.reject('weird'))
    await expect(client(fetch, { maxRetries: 0 }).devices.get('A')).rejects.toThrow(/failed: weird/)
  })

  it('reports timeouts', async () => {
    const { fetch } = mockFetch(
      (_call, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    const error = await client(fetch, { timeoutMs: 10, maxRetries: 0 })
      .devices.get('A')
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(SigfoxConnectionError)
    expect(error).toMatchObject({ timedOut: true })
    expect((error as Error).message).toContain('timed out after 10 ms')
  })

  it('rethrows the caller abort reason untouched and does not retry', async () => {
    const controller = new AbortController()
    const { fetch, calls } = mockFetch(
      (_call, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    const promise = client(fetch).devices.get('A', { signal: controller.signal })
    const reason = new Error('user cancelled')
    controller.abort(reason)

    await expect(promise).rejects.toBe(reason)
    expect(calls).toHaveLength(1)
  })

  it('refuses to follow absolute URLs on another host (credentials stay home)', async () => {
    const { fetch, calls } = mockFetch(() => json({}))
    await expect(client(fetch).request('GET', 'https://evil.test/steal')).rejects.toThrow(
      /not the configured API host/,
    )
    expect(calls).toHaveLength(0)
  })
})

describe('retries', () => {
  it('retries a 429, honouring Retry-After in seconds', async () => {
    vi.useFakeTimers()
    const { fetch, calls } = mockFetch(
      () => json({ message: 'slow down' }, 429, { 'retry-after': '2' }),
      () => json({ id: 'A' }),
    )
    const promise = client(fetch).devices.get('A')

    await vi.advanceTimersByTimeAsync(1_999)
    expect(calls).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    await expect(promise).resolves.toEqual({ id: 'A' })
    expect(calls).toHaveLength(2)
  })

  it('accepts Retry-After as an HTTP date and caps it', async () => {
    vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') })
    const { fetch, calls } = mockFetch(
      () => json({}, 429, { 'retry-after': 'Thu, 01 Jan 2026 00:00:03 GMT' }),
      () => json({}, 429, { 'retry-after': '99999' }),
      () => json({}, 429, { 'retry-after': 'garbage' }),
      () => json({ ok: true }),
    )
    const promise = client(fetch, { maxRetries: 3 }).request('POST', '/x', { body: {} })

    await vi.advanceTimersByTimeAsync(3_000)
    expect(calls).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(calls).toHaveLength(3)
    await vi.advanceTimersByTimeAsync(2_000) // garbage header → exponential backoff (2 s)
    await expect(promise).resolves.toEqual({ ok: true })
  })

  it('retries 5xx and connection errors on GET with exponential backoff', async () => {
    vi.useFakeTimers()
    const { fetch, calls } = mockFetch(
      () => json({}, 503),
      () => {
        throw new TypeError('socket hang up')
      },
      () => json({ id: 'A' }),
    )
    const promise = client(fetch).devices.get('A')

    await vi.advanceTimersByTimeAsync(500)
    expect(calls).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(1_000)
    await expect(promise).resolves.toEqual({ id: 'A' })
  })

  it('does not retry 5xx or connection errors on non-GET requests', async () => {
    const { fetch, calls } = mockFetch(
      () => json({}, 503),
      () => {
        throw new TypeError('reset')
      },
    )
    const sigfox = client(fetch)
    await expect(sigfox.request('POST', '/x', { body: {} })).rejects.toMatchObject({ status: 503 })
    await expect(sigfox.request('PUT', '/x', { body: {} })).rejects.toBeInstanceOf(
      SigfoxConnectionError,
    )
    expect(calls).toHaveLength(2)
  })

  it('gives up after maxRetries and throws the last error', async () => {
    vi.useFakeTimers()
    const { fetch, calls } = mockFetch(() => json({ message: 'busy' }, 429, { 'retry-after': '0' }))
    const promise = client(fetch, { maxRetries: 2 }).devices.get('A')
    const assertion = expect(promise).rejects.toMatchObject({ status: 429 })
    await vi.runAllTimersAsync()
    await assertion
    expect(calls).toHaveLength(3)
  })

  it('stops waiting when the caller aborts during a backoff', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const { fetch, calls } = mockFetch(() => json({}, 503))
    const promise = client(fetch).devices.get('A', { signal: controller.signal })
    const assertion = expect(promise).rejects.toBe('stop')

    await vi.advanceTimersByTimeAsync(100)
    controller.abort('stop')
    await assertion
    expect(calls).toHaveLength(1)
  })

  it('does not even sleep if the signal is already aborted after a retryable response', async () => {
    const controller = new AbortController()
    const { fetch } = mockFetch(() => {
      controller.abort('already')
      return json({}, 503)
    })
    await expect(client(fetch).devices.get('A', { signal: controller.signal })).rejects.toBe(
      'already',
    )
  })
})
