import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { AxiosInstance, AxiosResponse } from 'axios'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { satisfies } from 'semver'

import { IComponentInfo, TAssetInfo, TComponent, TPaginatedAsset, TPaginatedComponent } from '../interfaces'
import { isDefined, nullCheckerFactory , withRateLimit } from '../utils'
import {
  INexusHelper,
  TGetPackageAssetsOpts,
  TGetPackageVersionsOpts,
  TPaginatedSettledResult,
  TRateLimitOpts
} from './interfaces'

export class NexusComponentsHelper implements INexusHelper {
  private searchApi: SearchApi
  private componentsApi: ComponentsApi
  private httpClient: AxiosInstance

  constructor(
    searchApi: SearchApi,
    componentsApi: ComponentsApi,
    httpClient: AxiosInstance,
    rateLimitOpts?: TRateLimitOpts,
  ) {
    this.searchApi = searchApi
    this.componentsApi = componentsApi
    this.httpClient = httpClient
    return withRateLimit<NexusComponentsHelper>(
      this,
      rateLimitOpts,
      ['componentsApi.deleteComponent', 'searchApi.searchAssets', 'downloadPackageAsset']
    )
  }

  async deleteComponentsByIds(
    ids: string[],
  ): Promise<void> {
    const actions = ids.map(id => this.componentsApi.deleteComponent(id))
    await Promise.all(actions)
  }

  deleteComponentsByIdsSettled(
    ids: string[],
  ): Promise<PromiseSettledResult<AxiosResponse<void>>[]> {
    return Promise.allSettled(ids.map(id => this.componentsApi.deleteComponent(id)))
  }

  async getPackageComponents(
    opts: TGetPackageVersionsOpts,
    token?: string,
  ): Promise<TPaginatedComponent> {
    const { repository, group, name, timeout, sortDirection, sortField, version } = opts
    return this.searchApi.search(
      token,
      sortField,
      sortDirection,
      timeout,
      undefined,
      repository,
      undefined,
      group,
      name,
      version,
    ).then(response => response.data)
  }

  async getPackageAssets(
    opts: TGetPackageAssetsOpts,
    token?: string
  ): Promise<TPaginatedAsset> {
    const { repository, group, name, timeout, sortDirection, sortField, version } = opts
    return this.searchApi.searchAssets(
      token,
      sortField,
      sortDirection,
      timeout,
      undefined,
      repository,
      undefined,
      group,
      name,
      version,
    ).then(response => response.data)
  }

  async downloadPackageAssets(
    opts: TGetPackageAssetsOpts,
    cwd: string,
    token?: string
  ): Promise<TPaginatedSettledResult<TAssetInfo>> {
    const { items, continuationToken } = await this.getPackageAssets(opts, token)

    if (!items) {
      return {
        items: [] as TPaginatedSettledResult<TAssetInfo>['items'],
      }
    }

    return {
      items: await Promise.allSettled(items.map(({ downloadUrl, path }) => {
        if (!downloadUrl || !path) {
          return Promise.reject(new Error('downloadUrl or path is absent in Nexus API response'))
        }
        return this.downloadPackageAsset(downloadUrl, path, cwd)
      })),
      continuationToken
    }
  }

  async downloadPackageAsset(url: string, path: string, cwd: string): Promise<TAssetInfo> {
    const filePath = join(cwd, path.replace(/\//g, '%2F'))
    const writer = createWriteStream(filePath)
    return this.httpClient.get(url, { responseType: 'stream' })
      .then(response => {
        response.data.pipe(writer)
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })
      })
      .then(() => ({
        ...NexusComponentsHelper.extractNameAndVersionFromPath(path),
        filePath
      }))
      .catch(error => {
        error.message = `${error.message} url: ${url}`
        return Promise.reject(error)
      })
  }

  static extractNameAndVersionFromPath(path: string): Omit<TAssetInfo, 'filePath'> {
    const [name, rest] = path.split('/-/')
    return {
      name,
      version: rest.split('-').slice(-1)[0].replace('.tgz', '')
    }
  }

  static filterComponentsByRange(components: TComponent[], range: string): Array<TComponent & IComponentInfo> {
    return components
      .filter(nullCheckerFactory<IComponentInfo>(v => v && isDefined(v.version) && isDefined(v.id)))
      .filter(item => satisfies(item.version, range))
  }
}
