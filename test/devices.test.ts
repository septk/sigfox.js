import * as nock from 'nock'

import { API_CONFIG } from '../src/config/constants'
import { Devices } from '../src/modules/devices'

describe('Devices Test', () => {
  it('should be a class', () => {
    const devices = new Devices({} as any)
    expect(devices instanceof Devices).toBeTruthy()
  })

  describe('getDeviceInfo() call', () => {
    it('should return device obj', async () => {
      nock(API_CONFIG.baseURL)
        .get(`/devices/9E1F98`)
        .reply(200)
      const devices = new Devices({} as any)
      const result = await devices.getDeviceInfo('9E1F98')
      expect(result).toMatchSnapshot()
    })

    it('should return error', async () => {
      const devices = new Devices({} as any)
      try {
        nock(API_CONFIG.baseURL)
          .get(`/devices/9E1F98`)
          .reply(404)
        await devices.getDeviceInfo('9E1F98')
      } catch (error) {
        expect(error).toMatchSnapshot()
      }
    })
  })
})
