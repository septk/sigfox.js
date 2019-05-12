import { ConfigParams } from './types/config-params'
import { API_CONFIG } from './config/constants'
import { Devices } from './modules/devices'
import { Requester } from './helpers/requester'

/**
 * @class SigfoxApiWrapper
 *
 */

export default class SigfoxApi {
  public customParams: object
  public devices: Devices
  public requester: Requester
  /**
   * @constructor
   * @param {ConfigParams} customParams ID Client Setup
   */
  constructor(ConfigParams: ConfigParams) {
    this.customParams = {
      auth: ConfigParams,
      API_CONFIG
    }
    this.requester = new Requester(this.customParams)
    this.devices = new Devices(this.requester)
  }
}
