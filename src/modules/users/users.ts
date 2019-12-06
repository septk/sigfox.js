import { Requester } from '../../core/helpers/requester'
import { ModuleBase } from '../../core/base/base-class-module'

export class Users extends ModuleBase {
  private static instance: Users

  constructor(requester: Requester) {
    super(requester)
  }

  public static getInstance(config: Requester): Users {
    if (!Users.instance) {
      Users.instance = new Users(config)
    }
    return Users.instance
  }
}
