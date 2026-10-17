declare const __SIGFOX_VERSION__: string

/**
 * Library version, sent in the User-Agent header. Injected at build time from package.json,
 * whose version semantic-release sets right before publishing.
 */
export const VERSION: string = __SIGFOX_VERSION__
