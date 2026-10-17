import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import SigfoxDefault, { SigfoxApi, SigfoxClient, SigfoxError, VERSION } from '../src/index.js'

describe('SigfoxClient', () => {
  it('is the default export, with the v1 name kept as an alias', () => {
    expect(SigfoxDefault).toBe(SigfoxClient)
    expect(SigfoxApi).toBe(SigfoxClient)
  })

  it.each([[{ username: '', password: 'p' }], [{ username: 'u', password: '' }], [undefined]])(
    'rejects missing credentials %#',
    (options) => {
      // biome-ignore lint/suspicious/noExplicitAny: testing bad input on purpose
      expect(() => new SigfoxClient(options as any)).toThrow(SigfoxError)
    },
  )

  it('uses the global fetch by default and errors clearly when there is none', () => {
    expect(() => new SigfoxClient({ username: 'u', password: 'p' })).not.toThrow()

    vi.stubGlobal('fetch', undefined)
    try {
      expect(() => new SigfoxClient({ username: 'u', password: 'p' })).toThrow(/No fetch/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('VERSION matches package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    expect(VERSION).toBe(pkg.version)
  })
})
