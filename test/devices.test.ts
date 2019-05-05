import * as nock from 'nock'

import { API_CONFIG } from '../src/config/constants'
import { Devices } from '../src/modules/devices'

describe('Devices Test', () => {
  it('should be a class', () => {
    const devices = new Devices({} as any)
    expect(devices instanceof Devices).toBeTruthy()
  })
})
