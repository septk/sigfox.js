import * as nock from 'nock'

import SigfoxApi from '../src/sigfox-js'
import { ConfigParams } from '../src/types/config-params'
/**
 * SigfoxApi test
 */
describe('SigfoxApi test', () => {
  it('should be a class', () => {
    const sigfox = new SigfoxApi({} as ConfigParams)
    expect(sigfox instanceof SigfoxApi).toBeTruthy()
  })

  describe('constructor', () => {
    it('SigfoxApiWrapper is instantiable with a config', () => {
      expect(new SigfoxApi({} as ConfigParams)).toBeInstanceOf(SigfoxApi)
    })
  })

  describe('getDeviceInfo() call', () => {
    it('should return device obj', async () => {
      nock('https://api.sigfox.com/v2')
        .get(`/devices/9E1F98`)
        .reply(200)
      const sigfox = new SigfoxApi({} as ConfigParams)
      const result = await sigfox.getDeviceInfo('9E1F98')
      expect(result).toMatchSnapshot()
    })

    it('should return error', async () => {
      const sigfox = new SigfoxApi({} as ConfigParams)
      nock('https://api.sigfox.com/v2')
        .get(`/devices/9E1F98`)
        .reply(400, { message: 'error' })
      try {
        await sigfox.getDeviceInfo('9E1F98')
      } catch (error) {
        expect(error).toMatchSnapshot()
      }
    })
  })
})
