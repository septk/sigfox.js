import { ConfigParams } from './types/config-params'
import { API_CONFIG } from './config/constants'
import { Devices } from './modules/devices'

/**
 * @class SigfoxApiWrapper
 *
 */

export default class SigfoxApi {
  public customParams: object
  public devices: Devices

  /**
   * @constructor
   * @param {ConfigParams} customParams ID Client Setup
   */
  constructor(ConfigParams: ConfigParams) {
    this.customParams = {
      auth: ConfigParams,
      API_CONFIG
    }
    this.devices = new Devices(this.customParams)
  }
}
