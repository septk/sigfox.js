export interface Device {
  id: string
  name: string
  lastCom: number
  state: number
  comState: number
  location: Location
  deviceType: DeviceType
  group: DeviceType
  lqi: number
  activationTyime: number
  token: TokenStruct
  contract: DeviceType
  creationTime: number
  modemCertificate: DeviceType
  prototype: boolean
  automaticRenewal: boolean
  automaticRenewalStatus: number
  createdBy: string
  lastEditionTime: number
  lastEditedBy: string
  activable: boolean
}

export interface Location {
  lat: number
  lng: number
}

export interface DeviceType {
  id: string
}

export interface TokenStruct {
  state: number
  detailMessage: string
  end: number
}
