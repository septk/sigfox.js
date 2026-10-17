/*
 * Response shapes for the /devices endpoints of the Sigfox API v2.
 *
 * Most fields are optional on purpose: the API omits fields depending on `fields`, `deep`,
 * the device state and the caller's permissions. Timestamps are milliseconds since epoch.
 */

/** A reference to another resource, as returned when `deep=false`. */
export interface ResourceRef {
  id: string
  name?: string
  [key: string]: unknown
}

export interface LatLng {
  lat: number
  lng: number
}

export interface DeviceToken {
  /** 0 = valid, 1 = invalid, 2 = not used / not yet activated. */
  state: number
  detailMessage?: string
  /** Token end date, ms since epoch. */
  end?: number
  freeMessages?: number
  freeMessagesSent?: number
}

export interface Device {
  /** Device id, hexadecimal. */
  id: string
  name: string
  satelliteCapable?: boolean
  repeater?: boolean
  messageModulo?: number
  deviceType?: ResourceRef
  contract?: ResourceRef
  group?: ResourceRef
  modemCertificate?: ResourceRef
  productCertificate?: ResourceRef
  prototype?: boolean
  location?: LatLng
  lastComputedLocation?: LatLng & { radius?: number; sourceCode?: number }
  pac?: string
  sequenceNumber?: number
  trashSequenceNumber?: number
  /** Last communication, ms since epoch. */
  lastCom?: number
  /** Link quality indicator: 0 limit, 1 average, 2 good, 3 excellent, 4 NA. */
  lqi?: number
  activationTime?: number
  creationTime?: number
  /** 0 OK, 1 dead, 2 off contract, 3 disabled, 4 warn, 5 deleted, 6 suspended, 7 not activable. */
  state?: number
  /** 0 no, 1 ok, 2 warning, 3 KO, 4 NA, 5 not seen. */
  comState?: number
  token?: DeviceToken
  unsubscriptionTime?: number
  createdBy?: string
  lastEditionTime?: number
  lastEditedBy?: string
  automaticRenewal?: boolean
  automaticRenewalStatus?: number
  activable?: boolean
  [key: string]: unknown
}

export interface RadioConfiguration {
  id: number
  outputPower?: number
  balancedLinkBudget?: boolean
}

export interface ModemCertificate {
  id: string
  manufacturer?: ResourceRef
  name?: string
  key?: string
  version?: string
  description?: string
  status?: number
  radioConfigurations?: RadioConfiguration[]
  inputSensitivity?: number
  modes?: number[]
  repeaterFunction?: boolean
  [key: string]: unknown
}

export interface ProductCertificate {
  id: string
  name?: string
  key?: string
  version?: string
  description?: string
  status?: number
  manufacturer?: ResourceRef
  [key: string]: unknown
}

export interface DeviceMessage {
  device?: ResourceRef
  /** Message timestamp, ms since epoch. */
  time: number
  /** Payload, hex string. */
  data?: string
  ackRequired?: boolean
  lqi?: number
  lqiRepeaters?: number
  seqNumber?: number
  nbFrames?: number
  computedLocation?: Array<LatLng & { radius?: number; sourceCode?: number }>
  rinfos?: Array<Record<string, unknown>>
  downlinkAnswerStatus?: Record<string, unknown>
  [key: string]: unknown
}

export interface MessagesMetric {
  lastDay: number
  lastWeek: number
  lastMonth: number
}

export interface DeviceLocation {
  time: number
  valid?: boolean
  lat?: number
  lng?: number
  radius?: number
  sourceCode?: number
  placeIds?: string[]
  [key: string]: unknown
}

export interface UndeliveredCallback {
  device?: string
  deviceType?: string
  time?: number
  data?: string
  snr?: string
  status?: string
  message?: string
  callback?: Record<string, unknown>
  parameters?: Record<string, unknown>
  [key: string]: unknown
}

export interface DeviceConsumption {
  id: string
  deviceConsumptions?: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface BulkJobStatus {
  jobDone: boolean
  status?: Record<string, unknown>
  [key: string]: unknown
}

/** Filters for `devices.list()`. */
export interface DeviceListParams {
  /** Search by exact device id. */
  id?: string
  /** Only devices in these groups. */
  groupIds?: string[]
  deviceTypeId?: string
  operatorId?: string
  /** Expand referenced resources instead of returning ids only. */
  deep?: boolean
  /** e.g. `name`, `-name`, `id`, `-lastCom`. */
  sort?: string
  /** Comma-separated list of extra fields to return. */
  fields?: string
  /** Page size (the API caps it, usually at 100). */
  limit?: number
}

/** Time-window filters shared by the message, location and callback lists. */
export interface TimeRangeParams {
  /** Only items at or after this instant (Date or ms since epoch). */
  since?: Date | number
  /** Only items strictly before this instant (Date or ms since epoch). */
  before?: Date | number
  /** Page size. */
  limit?: number
}

export interface ConsumptionParams {
  year: number
  /** 1–12. Omit for the whole year. */
  month?: number
}
