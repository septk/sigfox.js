export interface Manufacturer {
  id: string
}

export interface RadioConfiguration {
  id: number
  outputPower: number
  balancedLinkBudget: boolean
}

export interface ModemCertificate {
  id: string
  manufacturer: Manufacturer
  name: string
  key: string
  version: string
  description: string
  status: number
  radioConfigurations: RadioConfiguration[]
  inputSensitivity: number
  modes: number[]
  repeaterFunction: boolean
}
