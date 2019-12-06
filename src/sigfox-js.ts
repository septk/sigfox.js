import { ConfigParams } from './core/types/config-params'
import { Requester } from './core/helpers/requester'

import { Devices } from './modules/devices/devices'

/**
 * @class SigfoxApiWrapper
 *
 */
export default class SigfoxApi {
  public requester: Requester
  public devices: Devices

  /**
   * @constructor
   * @param {ConfigParams} auth ID Client Setup
   */
  constructor(auth: ConfigParams, requester: Requester) {
    this.requester = Requester.getInstance(auth)
    this.devices = Devices.getInstance(requester)
  }
}
