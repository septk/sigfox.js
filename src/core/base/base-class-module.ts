import { Requester } from '../helpers/requester'

export abstract class ModuleBase {
  requester!: Requester

  protected constructor(public requesterService: Requester) {
    Requester.getInstance()
    this.requesterService = requesterService
  }
}
