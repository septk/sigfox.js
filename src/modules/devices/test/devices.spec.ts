import { Requester } from '../../../core/helpers/requester'
import { Devices } from '../devices'

describe('Devices Test', () => {
  let devicesModule: Devices

  beforeEach(() => {
    devicesModule = Devices.getInstance(Requester.getInstance())
  })

  it('builds', () => {
    expect(devicesModule).toBeTruthy()
  })
})
