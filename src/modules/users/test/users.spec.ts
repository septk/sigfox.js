import { Users } from '../users'
import { Requester } from '../../../core/helpers/requester'

describe('Users Test', () => {
  it('should be users', () => {
    const users = new Users({} as Requester)
    expect(users).toBeTruthy()
  })
})
