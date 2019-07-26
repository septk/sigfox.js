import { IConfiguration } from '../types/config'

export const API_CONFIG: IConfiguration = {
  baseURL: 'https://api.sigfox.com/v2',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json-patch+json'
  }
}
