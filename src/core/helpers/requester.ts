import { RequesterInfo } from '../types/requester/requester'
import { API_CONFIG } from '../config/constants'

export class Requester {
  private static instance: Requester

  config: object

  constructor(config: object) {
    this.config = config
  }

  public static getInstance(config?: object): Requester {
    if (!Requester.instance) {
      Requester.instance = new Requester({ config })
    }
    return Requester.instance
  }

  public async post<T>(info: RequesterInfo): Promise<T> {
    return this.doFetch<T>(API_CONFIG.baseURL + info.url, 'POST', info.data)
  }

  public async put<T>(info: RequesterInfo): Promise<T> {
    return this.doFetch<T>(API_CONFIG.baseURL + info.url, 'PUT', info.data)
  }

  public get<T>(info: RequesterInfo): Promise<T> {
    return this.doFetch<T>(API_CONFIG.baseURL + info.url, 'GET')
  }

  public delete<T>(info: RequesterInfo): Promise<T> {
    return this.doFetch<T>(API_CONFIG.baseURL + info.url, 'DELETE')
  }

  private async doFetch<T>(url: string, method: string, body?: any): Promise<T> {
    const objToSend = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? body : {}
    }

    return fetch(API_CONFIG.baseURL + url, objToSend)
      .then(response => response.json())
      .catch(error => error.error)
  }
}
