import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { AxiosResponse } from 'axios'
import { satisfies } from 'semver'

import { IComponentInfo, TComponent, TPaginatedAsset, TPaginatedComponent } from '../interfaces'
import { isDefined, nullCheckerFactory , withRateLimit } from '../utils'
import { INexusHelper, TGetPackageVersionsOpts, TRateLimitOpts } from './interfaces'

export class NexusComponentsHelper implements INexusHelper {
  private searchApi: SearchApi
  private componentsApi: ComponentsApi

  constructor(
    searchApi: SearchApi,
    componentsApi: ComponentsApi,
    rateLimitOpts?: TRateLimitOpts,
  ) {
    this.searchApi = searchApi
    this.componentsApi = componentsApi
    return withRateLimit<NexusComponentsHelper>(
      this,
      rateLimitOpts,
      ['componentsApi.deleteComponent']
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
    const { repository, group, name, timeout, sortDirection, sortField } = opts
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
    ).then(response => response.data)
  }

  async getPackageAssets(
    opts: TGetPackageVersionsOpts,
    token?: string
  ): Promise<TPaginatedAsset> {
    const { repository, group, name, timeout, sortDirection, sortField } = opts
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
    ).then(response => response.data)
  }

  static filterComponentsByRange(components: TComponent[], range: string): Array<TComponent & IComponentInfo> {
    return components
      .filter(nullCheckerFactory<IComponentInfo>(v => v && isDefined(v.version) && isDefined(v.id)))
      .filter(item => satisfies(item.version, range))
  }
}
