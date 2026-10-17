import { vi } from 'vitest'
import { SigfoxClient, type SigfoxClientOptions } from '../src/index.js'

export interface Call {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null
}

type Responder = (call: Call, init: RequestInit) => Response | Promise<Response>

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

/** A fake fetch that records every call and answers with the queued responders, in order. */
export function mockFetch(...responders: Responder[]) {
  const calls: Call[] = []
  const fn = vi.fn(async (input: string | URL | Request, init: RequestInit = {}) => {
    const call: Call = {
      url: String(input),
      method: init.method ?? 'GET',
      headers: { ...(init.headers as Record<string, string>) },
      body: (init.body as string | null) ?? null,
    }
    calls.push(call)
    const responder = responders.length > 1 ? responders.shift() : responders[0]
    if (!responder) throw new Error('mockFetch: no responder left')
    return responder(call, init)
  })
  return { fetch: fn as unknown as typeof fetch, calls }
}

export function client(fetchImpl: typeof fetch, options: Partial<SigfoxClientOptions> = {}) {
  return new SigfoxClient({ username: 'user', password: 'pass', fetch: fetchImpl, ...options })
}
