import { SearchApi } from '@qiwi/nexus-client'
import { IComplexDelay } from 'push-it-to-the-limit'

import { TComponent } from '../interfaces'

export type TGetPackageVersionsOpts = {
  repository: string
  group?: string
  name: string
  sortDirection?: Parameters<SearchApi['search']>[2]
  sortField?: Parameters<SearchApi['search']>[1]
  timeout?: number
}

export interface INexusHelper {
  getPackageComponents(
    params: TGetPackageVersionsOpts,
  ): Promise<TComponent[]>

  deleteComponentsByIds(
    ids: string[],
  ): Promise<any>
}

export type TRateLimitOpts = IComplexDelay | IComplexDelay[]
