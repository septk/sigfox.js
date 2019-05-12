import { Requester } from '../helpers/requester'

export class ModuleBase {
  requester: Requester

  constructor(requester: Requester) {
    this.requester = requester
  }
}
