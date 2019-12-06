import { IConfiguration } from './config'

export interface ConfigParams {
  username: string
  password: string
}

export interface CustomParams {
  auth: ConfigParams
  apiConfig: IConfiguration
}
