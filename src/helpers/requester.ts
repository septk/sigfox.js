import axios, { AxiosInstance } from 'axios'
import { API_CONFIG } from '../config/constants'

export class Requester {
  rest: AxiosInstance
  config: object

  constructor(config: object) {
    this.rest = axios.create({ baseURL: API_CONFIG.baseURL })
    this.config = config
  }

  public async get<T>(info: any): Promise<T> {
    return this.rest
      .get<any>(API_CONFIG.baseURL + info.url, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }
}
