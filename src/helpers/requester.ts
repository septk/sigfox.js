import axios, { AxiosInstance } from 'axios'
import { API_CONFIG } from '../config/constants'
import { RequesterInfo } from '../types/requester/requester'

export class Requester {
  rest: AxiosInstance
  config: object

  constructor(config: object) {
    this.rest = axios.create({ baseURL: API_CONFIG.baseURL })
    this.config = config
  }

  public async get<T>(info: RequesterInfo): Promise<T> {
    return this.rest
      .get<T>(API_CONFIG.baseURL + info.url, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  public async post<T>(info: RequesterInfo): Promise<T> {
    return this.rest
      .post<T>(API_CONFIG.baseURL + info.url, info.data, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }
}
