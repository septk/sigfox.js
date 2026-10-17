import { describe, expect, it } from 'vitest'
import { Paginator } from '../src/index.js'
import { client, json, mockFetch } from './helpers.js'

const BASE = 'https://api.sigfox.com/v2'

function path(url: string | undefined) {
  const u = new URL(url ?? '')
  return u.pathname.replace('/v2', '') + u.search
}

describe('devices', () => {
  it.each([
    ['get', (s: ReturnType<typeof client>) => s.devices.get('1A2B'), '/devices/1A2B'],
    [
      'messagesMetric',
      (s: ReturnType<typeof client>) => s.devices.messagesMetric('1A2B'),
      '/devices/1A2B/messages/metric',
    ],
    [
      'modemCertificate',
      (s: ReturnType<typeof client>) => s.devices.modemCertificate('1A2B'),
      '/devices/1A2B/certificate/modem',
    ],
    [
      'productCertificate',
      (s: ReturnType<typeof client>) => s.devices.productCertificate('1A2B'),
      '/devices/1A2B/certificate/product',
    ],
    [
      'consumption (year)',
      (s: ReturnType<typeof client>) => s.devices.consumption('1A2B', { year: 2026 }),
      '/devices/1A2B/consumption/2026',
    ],
    [
      'consumption (month)',
      (s: ReturnType<typeof client>) => s.devices.consumption('1A2B', { year: 2026, month: 3 }),
      '/devices/1A2B/consumption/2026/3',
    ],
    [
      'unsubscribeJobStatus',
      (s: ReturnType<typeof client>) => s.devices.unsubscribeJobStatus('job-1'),
      '/devices/bulk/unsubscribe/job-1',
    ],
  ])('%s calls the right endpoint', async (_name, call, expected) => {
    const { fetch, calls } = mockFetch(() => json({ ok: true }))
    await expect(call(client(fetch))).resolves.toEqual({ ok: true })
    expect(calls).toHaveLength(1)
    expect(path(calls[0]?.url)).toBe(expected)
  })

  it('url-encodes ids', async () => {
    const { fetch, calls } = mockFetch(() => json({}))
    await client(fetch).devices.get('../users')
    expect(calls[0]?.url).toBe(`${BASE}/devices/..%2Fusers`)
  })

  it('list() passes filters and follows paging.next across pages', async () => {
    const { fetch, calls } = mockFetch(
      () =>
        json({
          data: [{ id: '1' }, { id: '2' }],
          paging: { next: `${BASE}/devices?groupIds=g1&limit=2&offset=2` },
        }),
      () => json({ data: [{ id: '3' }], paging: {} }),
    )
    const list = client(fetch).devices.list({ groupIds: ['g1'], limit: 2, deep: true })
    expect(list).toBeInstanceOf(Paginator)
    expect(calls).toHaveLength(0) // lazy

    const ids: string[] = []
    for await (const device of list) ids.push(device.id)

    expect(ids).toEqual(['1', '2', '3'])
    expect(path(calls[0]?.url)).toBe('/devices?groupIds=g1&limit=2&deep=true')
    expect(path(calls[1]?.url)).toBe('/devices?groupIds=g1&limit=2&offset=2')
  })

  it('toArray(max) stops fetching once it has enough', async () => {
    const { fetch, calls } = mockFetch(
      () =>
        json({ data: [{ id: '1' }, { id: '2' }], paging: { next: `${BASE}/devices?offset=2` } }),
      () =>
        json({ data: [{ id: '3' }, { id: '4' }], paging: { next: `${BASE}/devices?offset=4` } }),
    )
    const items = await client(fetch).devices.list().toArray(3)
    expect(items.map((d) => d.id)).toEqual(['1', '2', '3'])
    expect(calls).toHaveLength(2)
  })

  it('toArray() without max drains everything; toArray(0) makes no request', async () => {
    const { fetch, calls } = mockFetch(
      () => json({ data: [{ id: '1' }], paging: { next: `${BASE}/devices?offset=1` } }),
      () => json({ data: [{ id: '2' }] }),
    )
    const sigfox = client(fetch)
    expect(await sigfox.devices.list().toArray(0)).toEqual([])
    expect(calls).toHaveLength(0)
    expect((await sigfox.devices.list().toArray()).map((d) => d.id)).toEqual(['1', '2'])
  })

  it('tolerates pages without a data array', async () => {
    const { fetch } = mockFetch(() => json({}))
    expect(await client(fetch).devices.list().toArray()).toEqual([])
  })

  it('pages() yields whole pages', async () => {
    const { fetch } = mockFetch(
      () => json({ data: [{ id: '1' }], paging: { next: `${BASE}/devices?offset=1` } }),
      () => json({ data: [{ id: '2' }] }),
    )
    const sizes: number[] = []
    for await (const page of client(fetch).devices.list().pages()) sizes.push(page.data.length)
    expect(sizes).toEqual([1, 1])
  })

  it.each([
    ['messages', '/devices/D1/messages'],
    ['locations', '/devices/D1/locations'],
    ['undeliveredCallbacks', '/devices/D1/callbacks-not-delivered'],
  ] as const)('%s() sends the time window as ms timestamps', async (method, endpoint) => {
    const { fetch, calls } = mockFetch(() => json({ data: [{ time: 1 }] }))
    const since = new Date('2026-10-01T00:00:00Z')
    const page = await client(fetch)
      .devices[method]('D1', { since, before: 1_800_000_000_000, limit: 10 })
      .firstPage()

    expect(page.data).toEqual([{ time: 1 }])
    expect(path(calls[0]?.url)).toBe(
      `${endpoint}?since=${since.getTime()}&before=1800000000000&limit=10`,
    )
  })

  it('passes the caller signal to every page request', async () => {
    const controller = new AbortController()
    const signals: (AbortSignal | null | undefined)[] = []
    const { fetch } = mockFetch(
      (_c, init) => {
        signals.push(init.signal)
        return json({ data: [1], paging: { next: `${BASE}/devices/D/messages?offset=1` } })
      },
      (_c, init) => {
        signals.push(init.signal)
        controller.abort('enough')
        return json({ data: [2] })
      },
    )
    const items = await client(fetch)
      .devices.messages('D', {}, { signal: controller.signal })
      .toArray()
    expect(items).toHaveLength(2)
    expect(signals.every((s) => s instanceof AbortSignal)).toBe(true)
    expect(signals[1]?.aborted).toBe(true)
  })
})

describe('devices — deprecated v1 names', () => {
  it.each([
    ['getDeviceInfo', (s: ReturnType<typeof client>) => s.devices.getDeviceInfo('D'), '/devices/D'],
    [
      'getAllDevices',
      (s: ReturnType<typeof client>) => s.devices.getAllDevices(),
      '/devices?deep=false&sort=name&limit=100',
    ],
    [
      'getCallbacksNotDelivered',
      (s: ReturnType<typeof client>) => s.devices.getCallbacksNotDelivered('D'),
      '/devices/D/callbacks-not-delivered',
    ],
    [
      'getModemCert',
      (s: ReturnType<typeof client>) => s.devices.getModemCert('D'),
      '/devices/D/certificate/modem',
    ],
    [
      'getProductCert',
      (s: ReturnType<typeof client>) => s.devices.getProductCert('D'),
      '/devices/D/certificate/product',
    ],
    [
      'getDeviceConsYearly',
      (s: ReturnType<typeof client>) => s.devices.getDeviceConsYearly('D', 2026),
      '/devices/D/consumption/2026',
    ],
    [
      'getDeviceConsMonthly',
      (s: ReturnType<typeof client>) => s.devices.getDeviceConsMonthly('D', 2026, 12),
      '/devices/D/consumption/2026/12',
    ],
    [
      'getMessagesList',
      (s: ReturnType<typeof client>) => s.devices.getMessagesList('D'),
      '/devices/D/messages',
    ],
    [
      'getMessagesMetric',
      (s: ReturnType<typeof client>) => s.devices.getMessagesMetric('D'),
      '/devices/D/messages/metric',
    ],
    [
      'getLocations',
      (s: ReturnType<typeof client>) => s.devices.getLocations('D'),
      '/devices/D/locations',
    ],
    [
      'unsubscribeActions',
      (s: ReturnType<typeof client>) => s.devices.unsubscribeActions('J'),
      '/devices/bulk/unsubscribe/J',
    ],
  ])('%s still works', async (_name, call, expected) => {
    const { fetch, calls } = mockFetch(() => json({ data: [] }))
    await call(client(fetch))
    expect(path(calls[0]?.url)).toBe(expected)
  })
})
