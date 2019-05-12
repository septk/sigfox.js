import { RootObject, ModemCertificate } from '../types/devices/getAllDevices'
import { Requester } from '../helpers/requester'

export class Devices {
  requester: Requester

  constructor(requester: Requester) {
    this.requester = requester
  }

  /**
   * The endpoint to get Device Info.
   * HTTP GET /devices/${deviceId}
   * @returns {device}
   */
  public async getDeviceInfo<RootObject>(deviceId: string): Promise<RootObject> {
    const infoDevice = {
      url: `/devices/${deviceId}`
    }

    return this.requester.get<RootObject>(infoDevice)
  }

  /**
   * The endpoint to get info from all devices.
   * HTTP GET /devices/?deep=false&sort=name&limit=100&offset=0
   * To Do - query + params customizable
   * @returns [Devices]
   */
  public getAllDevices(): Promise<RootObject> {
    const infoDevice = {
      url: `/devices/?deep=false&sort=name&limit=100&offset=0`
    }

    return this.requester.get<RootObject>(infoDevice)
  }

  /**
   * Retrieve a list of undelivered callbacks and errors for a given device, in reverse chronological order (most recent message first).
   * HTTP GET /devices/${deviceId}/callbacks-not-delivered
   * @returns [Callbacks - Errors]
   */
  public getCallbacksNotDelivered(deviceId: string) {
    const infoDevice = {
      url: `/devices/${deviceId}/callbacks-not-delivered`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Retrieve the modem certificate associated with a device.
   * HTTP GET /devices/${deviceId}/certificate/modem
   * @returns {ModemCertificate}
   */
  public getModemCert(deviceId: string): Promise<ModemCertificate> {
    const infoDevice = {
      url: `/devices/${deviceId}/certificate/modem`
    }

    return this.requester.get<ModemCertificate>(infoDevice)
  }

  /**
   * Retrieve the product certificate associated with a device already registered.
   * HTTP GET /devices/${deviceId}/certificate/product
   * @returns {ProductCertificate}
   */
  public getProductCert(deviceId: string) {
    const infoDevice = {
      url: `/devices/${deviceId}/certificate/product`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Retrieve a device's consumption for a given year.
   * HTTP GET /devices/${deviceId}/consumption/${year}
   * @returns {id, deviceConsumptions}
   */
  public getDeviceConsYearly(deviceId: string, year: number) {
    const infoDevice = {
      url: `/devices/${deviceId}/consumption/${year}`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Retrieve a device's consumption for a given month during a given year.
   * HTTP GET /devices/${deviceId}/consumption/${year}/${month}
   * @returns {id, deviceConsumptions}
   */
  public getDeviceConsMonthly(deviceId: string, year: number, month: number) {
    const infoDevice = {
      url: `/devices/${deviceId}/consumption/${year}/${month}`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Retrieve a list of messages for a given device according to request filters, with a 3-day history.
   * HTTP GET /devices/${deviceId}/messages
   * @returns {infoMessages}
   */
  public getMessagesList(deviceId: string) {
    const infoDevice = {
      url: `/devices/${deviceId}/messages`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Return the number of messages for a given device, for the last day, last week and last month.
   * HTTP GET /devices/${deviceId}/messages/metric
   * @returns {lastDay, lastWeek, lastMonth}
   */
  public getMessagesMetric(deviceId: string) {
    const infoDevice = {
      url: `/devices/${deviceId}/messages/metric`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Retrieve a list of location data of a device according to request filters.
   * HTTP GET /devices/${deviceId}/locations
   * @returns {data}
   */
  public getLocations(deviceId: string) {
    const infoDevice = {
      url: `/devices/${deviceId}/locations`
    }

    return this.requester.get(infoDevice)
  }

  /**
   * Retrieve the async job status for an unsubscribe devices action.
   * HTTP GET /devices/bulk/unsubscribe/${jobId}
   * @returns {jobDone, states}
   */
  public unsubscribeActions(jobId: string) {
    const infoDevice = {
      url: `/devices/bulk/unsubscribe/${jobId}`
    }

    return this.requester.get(infoDevice)
  }
}
