import type { HttpClient } from '../http.js'
import { type Page, Paginator } from '../pagination.js'
import type {
  BulkJobStatus,
  ConsumptionParams,
  Device,
  DeviceConsumption,
  DeviceListParams,
  DeviceLocation,
  DeviceMessage,
  MessagesMetric,
  ModemCertificate,
  ProductCertificate,
  TimeRangeParams,
  UndeliveredCallback,
} from '../types/devices.js'

/** Every call accepts an optional AbortSignal to cancel it. */
export interface CallOptions {
  signal?: AbortSignal
}

const enc = encodeURIComponent

/** `/devices` endpoints. Reach it through `client.devices`. */
export class Devices {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /** List devices, following pagination. `GET /devices` */
  list(params: DeviceListParams = {}, options: CallOptions = {}): Paginator<Device> {
    return new Paginator<Device>(this.http, '/devices', { ...params }, options.signal)
  }

  /** Get one device. `GET /devices/{id}` */
  get(deviceId: string, options: CallOptions = {}): Promise<Device> {
    return this.http.get(`/devices/${enc(deviceId)}`, options)
  }

  /** Messages of a device (3-day history on most contracts). `GET /devices/{id}/messages` */
  messages(
    deviceId: string,
    params: TimeRangeParams = {},
    options: CallOptions = {},
  ): Paginator<DeviceMessage> {
    return new Paginator(
      this.http,
      `/devices/${enc(deviceId)}/messages`,
      { ...params },
      options.signal,
    )
  }

  /** Message counts for the last day, week and month. `GET /devices/{id}/messages/metric` */
  messagesMetric(deviceId: string, options: CallOptions = {}): Promise<MessagesMetric> {
    return this.http.get(`/devices/${enc(deviceId)}/messages/metric`, options)
  }

  /** Computed locations of a device. `GET /devices/{id}/locations` */
  locations(
    deviceId: string,
    params: TimeRangeParams = {},
    options: CallOptions = {},
  ): Paginator<DeviceLocation> {
    return new Paginator(
      this.http,
      `/devices/${enc(deviceId)}/locations`,
      { ...params },
      options.signal,
    )
  }

  /**
   * Undelivered callbacks and errors, most recent first.
   * `GET /devices/{id}/callbacks-not-delivered`
   */
  undeliveredCallbacks(
    deviceId: string,
    params: TimeRangeParams = {},
    options: CallOptions = {},
  ): Paginator<UndeliveredCallback> {
    return new Paginator(
      this.http,
      `/devices/${enc(deviceId)}/callbacks-not-delivered`,
      { ...params },
      options.signal,
    )
  }

  /** Modem certificate of a device. `GET /devices/{id}/certificate/modem` */
  modemCertificate(deviceId: string, options: CallOptions = {}): Promise<ModemCertificate> {
    return this.http.get(`/devices/${enc(deviceId)}/certificate/modem`, options)
  }

  /** Product certificate of a registered device. `GET /devices/{id}/certificate/product` */
  productCertificate(deviceId: string, options: CallOptions = {}): Promise<ProductCertificate> {
    return this.http.get(`/devices/${enc(deviceId)}/certificate/product`, options)
  }

  /**
   * Consumption for a year, or for one month of it.
   * `GET /devices/{id}/consumption/{year}[/{month}]`
   */
  consumption(
    deviceId: string,
    { year, month }: ConsumptionParams,
    options: CallOptions = {},
  ): Promise<DeviceConsumption> {
    const suffix = month === undefined ? `${year}` : `${year}/${month}`
    return this.http.get(`/devices/${enc(deviceId)}/consumption/${suffix}`, options)
  }

  /** Status of an async bulk-unsubscribe job. `GET /devices/bulk/unsubscribe/{jobId}` */
  unsubscribeJobStatus(jobId: string, options: CallOptions = {}): Promise<BulkJobStatus> {
    return this.http.get(`/devices/bulk/unsubscribe/${enc(jobId)}`, options)
  }

  // ---------------------------------------------------------------------------------------
  // v1 names, kept so upgrading doesn't break every call site at once. Unlike v1 they throw
  // on failure instead of resolving with the status text. They will be removed in v3.
  // ---------------------------------------------------------------------------------------

  /** @deprecated Use {@link Devices.get}. */
  getDeviceInfo(deviceId: string): Promise<Device> {
    return this.get(deviceId)
  }

  /**
   * @deprecated Use {@link Devices.list}. This returns only the first page (v1 behaviour);
   * `list()` follows pagination.
   */
  getAllDevices(): Promise<Page<Device>> {
    return this.list({ deep: false, sort: 'name', limit: 100 }).firstPage()
  }

  /** @deprecated Use {@link Devices.undeliveredCallbacks}. Returns the first page only. */
  getCallbacksNotDelivered(deviceId: string): Promise<Page<UndeliveredCallback>> {
    return this.undeliveredCallbacks(deviceId).firstPage()
  }

  /** @deprecated Use {@link Devices.modemCertificate}. */
  getModemCert(deviceId: string): Promise<ModemCertificate> {
    return this.modemCertificate(deviceId)
  }

  /** @deprecated Use {@link Devices.productCertificate}. */
  getProductCert(deviceId: string): Promise<ProductCertificate> {
    return this.productCertificate(deviceId)
  }

  /** @deprecated Use `consumption(id, { year })`. */
  getDeviceConsYearly(deviceId: string, year: number): Promise<DeviceConsumption> {
    return this.consumption(deviceId, { year })
  }

  /** @deprecated Use `consumption(id, { year, month })`. */
  getDeviceConsMonthly(deviceId: string, year: number, month: number): Promise<DeviceConsumption> {
    return this.consumption(deviceId, { year, month })
  }

  /** @deprecated Use {@link Devices.messages}. Returns the first page only. */
  getMessagesList(deviceId: string): Promise<Page<DeviceMessage>> {
    return this.messages(deviceId).firstPage()
  }

  /** @deprecated Use {@link Devices.messagesMetric}. */
  getMessagesMetric(deviceId: string): Promise<MessagesMetric> {
    return this.messagesMetric(deviceId)
  }

  /** @deprecated Use {@link Devices.locations}. Returns the first page only. */
  getLocations(deviceId: string): Promise<Page<DeviceLocation>> {
    return this.locations(deviceId).firstPage()
  }

  /** @deprecated Use {@link Devices.unsubscribeJobStatus}. */
  unsubscribeActions(jobId: string): Promise<BulkJobStatus> {
    return this.unsubscribeJobStatus(jobId)
  }
}
