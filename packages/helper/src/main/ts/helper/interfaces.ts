import { SearchApi } from '@qiwi/nexus-client'
import { AxiosResponse } from 'axios'
import { IComplexDelay } from 'push-it-to-the-limit'

import { TPaginatedAsset, TPaginatedComponent } from '../interfaces'

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
    token?: string
  ): Promise<TPaginatedComponent>

  deleteComponentsByIds(
    ids: string[],
  ): Promise<void>

  deleteComponentsByIdsSettled(
    ids: string[],
  ): Promise<PromiseSettledResult<AxiosResponse<void>>[]>

  getPackageAssets(
    params: TGetPackageVersionsOpts,
    token?: string
  ): Promise<TPaginatedAsset>
}

export type TRateLimitOpts = IComplexDelay | IComplexDelay[]
