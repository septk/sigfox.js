import { Coverages } from '../coverages'
import { Requester } from '../../../core/helpers/requester'

describe('Coverages Test', () => {
  let coveragesModule: Coverages

  beforeEach(() => {
    coveragesModule = Coverages.getInstance(Requester.getInstance())
  })

  it('builds', () => {
    expect(coveragesModule).toBeTruthy()
  })
})
