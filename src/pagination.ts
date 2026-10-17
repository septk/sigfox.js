import type { HttpClient, Query } from './http.js'

/** One page of a Sigfox list endpoint, exactly as the API returns it. */
export interface Page<T> {
  data: T[]
  paging?: {
    /** Absolute URL of the next page. Absent on the last page. */
    next?: string
  }
}

/**
 * A lazily-fetched, paginated list. Nothing is requested until you iterate it.
 *
 * ```ts
 * for await (const device of sigfox.devices.list()) { … }   // every item, page by page
 * const all = await sigfox.devices.list().toArray()          // everything in memory
 * const first = await sigfox.devices.list().firstPage()       // a single request
 * ```
 */
export class Paginator<T> implements AsyncIterable<T> {
  /** @internal */
  constructor(
    private readonly http: HttpClient,
    private readonly path: string,
    private readonly query: Query = {},
    private readonly signal?: AbortSignal,
  ) {}

  /** Fetch only the first page. */
  firstPage(): Promise<Page<T>> {
    return this.http.get<Page<T>>(this.path, { query: this.query, signal: this.signal })
  }

  /** Iterate page by page, following `paging.next` until the API stops returning one. */
  async *pages(): AsyncGenerator<Page<T>, void, undefined> {
    let page = await this.firstPage()
    while (true) {
      yield page
      const next = page.paging?.next
      if (!next) return
      page = await this.http.get<Page<T>>(next, { signal: this.signal })
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, undefined> {
    for await (const page of this.pages()) {
      yield* page.data ?? []
    }
  }

  /**
   * Collect items into an array. Pass `max` to stop early; without it every page is fetched,
   * which can be thousands of requests on a large account.
   */
  async toArray(max = Number.POSITIVE_INFINITY): Promise<T[]> {
    const items: T[] = []
    if (max <= 0) return items
    for await (const item of this) {
      items.push(item)
      if (items.length >= max) break
    }
    return items
  }
}
