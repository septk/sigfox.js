import axios, { AxiosInstance } from 'axios'

import { RootObject, ModemCertificate } from '../types/devices/getAllDevices'
import { API_CONFIG } from '../config/constants'

export class Devices {
  rest: AxiosInstance
  config: object

  constructor(config: object) {
    this.rest = axios.create({ baseURL: API_CONFIG.baseURL })
    this.config = config
  }

  /**
   * The endpoint to get Device Info.
   * HTTP GET /devices/${deviceId}
   * @returns {device}
   */
  public getDeviceInfo(deviceId: string): Promise<RootObject> {
    return this.rest
      .get<RootObject>(API_CONFIG.baseURL + `/devices/${deviceId}`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * The endpoint to get info from all devices.
   * HTTP GET /devices/?deep=false&sort=name&limit=100&offset=0
   * To Do - query + params customizable
   * @returns [Devices]
   */
  public getAllDevices(): Promise<RootObject> {
    return this.rest
      .get<RootObject>(
        API_CONFIG.baseURL + `/devices/?deep=false&sort=name&limit=100&offset=0`,
        this.config
      )
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve a list of undelivered callbacks and errors for a given device, in reverse chronological order (most recent message first).
   * HTTP GET /devices/${deviceId}/callbacks-not-delivered
   * @returns [Callbacks - Errors]
   */
  public getCallbacksNotDelivered(deviceId: string) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/callbacks-not-delivered`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve the modem certificate associated with a device.
   * HTTP GET /devices/${deviceId}/certificate/modem
   * @returns {ModemCertificate}
   */
  public getModemCert(deviceId: string): Promise<ModemCertificate> {
    return this.rest
      .get<ModemCertificate>(
        API_CONFIG.baseURL + `/devices/${deviceId}/certificate/modem`,
        this.config
      )
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve the product certificate associated with a device already registered.
   * HTTP GET /devices/${deviceId}/certificate/product
   * @returns {ProductCertificate}
   */
  public getProductCert(deviceId: string) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/certificate/product`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve a device's consumption for a given year.
   * HTTP GET /devices/${deviceId}/consumption/${year}
   * @returns {id, deviceConsumptions}
   */
  public getDeviceConsYearly(deviceId: string, year: number) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/consumption/${year}`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve a device's consumption for a given month during a given year.
   * HTTP GET /devices/${deviceId}/consumption/${year}/${month}
   * @returns {id, deviceConsumptions}
   */
  public getDeviceConsMonthly(deviceId: string, year: number, month: number) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/consumption/${year}/${month}`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve a list of messages for a given device according to request filters, with a 3-day history.
   * HTTP GET /devices/${deviceId}/messages
   * @returns {infoMessages}
   */
  public getMessagesList(deviceId: string) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/messages`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Return the number of messages for a given device, for the last day, last week and last month.
   * HTTP GET /devices/${deviceId}/messages/metric
   * @returns {lastDay, lastWeek, lastMonth}
   */
  public getMessagesMetric(deviceId: string) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/messages/metric`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve a list of location data of a device according to request filters.
   * HTTP GET /devices/${deviceId}/locations
   * @returns {data}
   */
  public getLocations(deviceId: string) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/${deviceId}/locations`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }

  /**
   * Retrieve the async job status for an unsubscribe devices action.
   * HTTP GET /devices/bulk/unsubscribe/${jobId}
   * @returns {jobDone, states}
   */
  public unsubscribeActions(jobId: string) {
    return this.rest
      .get(API_CONFIG.baseURL + `/devices/bulk/unsubscribe/${jobId}`, this.config)
      .then(response => response.data)
      .catch(error => error.response.statusText)
  }
}
