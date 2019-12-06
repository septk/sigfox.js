import { ConfigParams } from '../../core/types/config-params'
import { Devices } from '../devices/devices'
import { Requester } from '../../core/helpers/requester'

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
