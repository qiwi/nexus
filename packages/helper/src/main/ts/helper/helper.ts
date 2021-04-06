import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { AxiosResponse } from 'axios'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { satisfies } from 'semver'

import { IComponentInfo, TAssetInfo, TComponent, TPaginatedAsset, TPaginatedComponent } from '../interfaces'
import { callWithRetry, isDefined, nullCheckerFactory, withRateLimit } from '../utils'
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

  constructor(
    searchApi: SearchApi,
    componentsApi: ComponentsApi,
    rateLimitOpts?: TRateLimitOpts,
  ) {
    this.searchApi = withRateLimit(searchApi, rateLimitOpts, ['searchAssets', 'searchAndDownloadAssets'])
    this.componentsApi = withRateLimit(componentsApi, rateLimitOpts, ['deleteComponent'])
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
      items: await Promise.allSettled(
        items
          .filter(item => opts.range
            ? satisfies(NexusComponentsHelper.extractNameAndVersionFromPath(item.path + '').version, opts.range)
            : true
          )
          .map(({ downloadUrl, path }) => {
            if (!downloadUrl || !path) {
              return Promise.reject(new Error('downloadUrl or path is absent in Nexus API response'))
            }
            const { version, name } = NexusComponentsHelper.extractNameAndVersionFromPath(path)
            const filePath = join(cwd, path.replace(/\//g, '%2F'))
            return this.downloadPackageAsset({ ...opts, version }, filePath)
              .then(() => ({ version, name, filePath }))
              .catch(error => {
                error.message = `${error.message} for: ${opts.name}@${version}`
                return Promise.reject(error)
              })
          })
      ),
      continuationToken
    }
  }

  async downloadPackageAsset(
    opts: TGetPackageAssetsOpts,
    filePath: string,
    retryCount = 5
  ): Promise<void> {
    const fn = () => this.searchApi.searchAndDownloadAssets(
      opts.sortField,
      opts.sortDirection,
      undefined,
      undefined,
      opts.repository,
      'npm',
      opts.group,
      opts.name,
      opts.version,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { responseType: 'stream' },
    )
      .then((response: any) => {
        const writer = createWriteStream(filePath)
        response.data.pipe(writer)
        return new Promise<void>((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })
      })

    return callWithRetry<void>(fn, retryCount)
  }

  static extractNameAndVersionFromPath(path: string): Omit<TAssetInfo, 'filePath'> {
    const [, group, name, version] = /^(@[a-z-]+[a-z]+)?\/?([a-z-]+)\/-\/[a-z-]+-([\d.-]+).tgz$/.exec(path) || []
    return {
      name: `${group ? group + '/' : ''}${name}`,
      version
    }
  }

  static filterComponentsByRange(components: TComponent[], range: string): Array<TComponent & IComponentInfo> {
    return components
      .filter(nullCheckerFactory<IComponentInfo>(v => v && isDefined(v.version) && isDefined(v.id)))
      .filter(item => satisfies(item.version, range))
  }
}
