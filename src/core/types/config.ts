export interface IConfiguration {
  baseURL: 'https://api.sigfox.com/v2'
  headers: IHeaders
}

export interface IHeaders {
  Accept: string
  'Content-Type': string
}
