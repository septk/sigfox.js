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
})
