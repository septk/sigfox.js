import SigfoxApi from '../src/sigfox-js'

/**
 * SigfoxApi test
 */
describe('SigfoxApi test', () => {
  it('SigfoxApi is instantiable', () => {
    expect(new SigfoxApi()).toBeInstanceOf(SigfoxApi)
  })
})
