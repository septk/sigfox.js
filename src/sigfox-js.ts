import axios, { AxiosInstance } from 'axios'

import { ConfigParams } from './types/config-params'
import { Device } from './types/device'
import { API_CONFIG } from './config/constants'

/**
 * @class SigfoxApiWrapper
 *
 */

export default class SigfoxApi {
  public rest: AxiosInstance
  public customParams: object

  /**
   * @constructor
   * @param {ConfigParams} customParams ID Client Setup
   */
  constructor(ConfigParams: ConfigParams) {
    this.rest = axios.create({ baseURL: API_CONFIG.baseURL })
    this.customParams = {
      auth: ConfigParams,
      API_CONFIG
    }
  }

  /**
   * The endpoint to get Device Info.
   * @returns {device}
   */
  public getDeviceInfo(deviceId: string) {
    return this.rest
      .get<Device>(API_CONFIG.baseURL + `/devices/${deviceId}`, this.customParams)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }
}
