export interface Location {
  lat: number
  lng: number
}

export interface DeviceType {
  id: string
}

export interface Group {
  id: string
}

export interface Token {
  state: number
  detailMessage: string
  end: any
}

export interface Contract {
  id: string
}

export interface ModemCertificate {
  id: string
}

export interface Datum {
  id: string
  name: string
  lastCom: any
  state: number
  comState: number
  location: Location
  deviceType: DeviceType
  group: Group
  lqi: number
  activationTime: any
  token: Token
  contract: Contract
  creationTime: any
  modemCertificate: ModemCertificate
  prototype: boolean
  automaticRenewal: boolean
  automaticRenewalStatus: number
  createdBy: string
  lastEditionTime: any
  lastEditedBy: string
  activable: boolean
}

export interface Paging {}

export interface RootObject {
  data: Datum[]
  paging: Paging
}
