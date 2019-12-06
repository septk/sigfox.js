import { Requester } from '../../core/helpers/requester'
import { GlobalPredictions, Redundancy } from './types/predictions'
import { ModuleBase } from '../../core/base/base-class-module'

export class Coverages extends ModuleBase {
  private static instance: Coverages

  constructor(requester: Requester) {
    super(requester)
  }

  public static getInstance(config: Requester): Coverages {
    if (!Coverages.instance) {
      Coverages.instance = new Coverages(config)
    }
    return Coverages.instance
  }

  /**
   * Get coverage margins for a selected latitude and longitude, for each redundancy level.
   * HTTP GET /coverages/global/predictions?lat=55&lng=55&radius=300
   * @returns {{locationCovered}, margins[]}
   */
  public getCoverageMargins(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<GlobalPredictions> {
    const infoDevice = {
      url: `/coverages/global/predictions?lat=${latitude}&lng=${longitude}&radius=${radius}`
    }
    return this.requester.get<GlobalPredictions>(infoDevice)
  }

  /**
   * Get the coverage margins for multiple points, for each redundancy level.
   * HTTP POST /coverages/global/predictions
   * @returns {{locationCovered}, margins[]}
   */
  public postCoverageMargins(
    latitude: number,
    longitude: number,
    radius: number,
    groupId: string
  ): Promise<GlobalPredictions> {
    const infoDevice = {
      url: `/coverages/global/predictions`,
      data: {
        locations: [
          {
            lat: latitude,
            lng: longitude
          }
        ],
        radius,
        groupId
      }
    }
    return this.requester.post<GlobalPredictions>(infoDevice)
  }

  /**
   * Get operator coverage redundancy for a selected latitude and longitude, for specific device situation.
   * HTTP GET /coverages/operators/redundancy?lat=${latitude}&lng=${longitude}&deviceSituation=${deviceSituation}&deviceClassId=${deviceClassId}
   * @returns {{redundancy}}
   */
  public getOperatorRedundancy(
    latitude: number,
    longitude: number,
    deviceSituation: string,
    deviceClassId: number
  ): Promise<Redundancy> {
    const infoDevice = {
      url: `/coverages/operators/redundancy?lat=${latitude}&lng=${longitude}&deviceSituation=${deviceSituation}&deviceClassId=${deviceClassId}`
    }

    return this.requester.get<Redundancy>(infoDevice)
  }
}
