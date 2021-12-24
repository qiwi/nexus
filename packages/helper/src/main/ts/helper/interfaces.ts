import { SearchApi } from '@qiwi/nexus-client'
import { AxiosResponse } from 'axios'
import { IComplexDelay } from 'push-it-to-the-limit'

import { TAssetInfo, TPaginatedAsset, TPaginatedComponent } from '../interfaces'

export type TGetPackageVersionsOpts = {
  repository: string
  group?: string
  name: string
  version?: string
  sortDirection?: Parameters<SearchApi['search']>[2]
  sortField?: Parameters<SearchApi['search']>[1]
  timeout?: number
}

export type TDownloadAssetByListItem = {
  repository: string
  group?: string
  name: string
  version: string
}

export type TGetPackageAssetsOpts = Partial<TGetPackageVersionsOpts> & { repository: string, range?: string }

export type TPaginatedSettledResult<T> = {
  items: PromiseSettledResult<T>[]
  continuationToken?: string
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
    params: TGetPackageAssetsOpts,
    token?: string
  ): Promise<TPaginatedAsset>

  downloadPackageAssets(
    params: TGetPackageAssetsOpts,
    cwd: string,
    token?: string
  ): Promise<TPaginatedSettledResult<TAssetInfo>>

  downloadPackageAsset(
    opts: TGetPackageAssetsOpts,
    filePath: string,
    retryCount?: number,
  ): Promise<void>

  downloadPackageAssetsByList(
    opts: TDownloadAssetByListItem[],
    cwd: string
  ): Promise<PromiseSettledResult<TAssetInfo>[]>
}

export type TRateLimitOpts = IComplexDelay | IComplexDelay[]
