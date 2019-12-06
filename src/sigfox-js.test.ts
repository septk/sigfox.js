import SigfoxApi from './sigfox-js'
import { ConfigParams } from './core/types/config-params'
import { Requester } from './core/helpers/requester'

/**
 * SigfoxApi test
 */

describe('SigfoxApi test', () => {
  let sigfox: SigfoxApi
  const auth: ConfigParams = { username: 'username', password: 'password' }

  beforeEach(() => {
    sigfox = new SigfoxApi(auth, Requester.getInstance())
  })

  it('builds', () => {
    expect(sigfox).toBeTruthy()
  })
})
