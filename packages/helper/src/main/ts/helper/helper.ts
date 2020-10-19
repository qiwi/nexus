import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { satisfies } from 'semver'

import { IComponentInfo, TComponent } from '../interfaces'
import { apiGetAll, isDefined, nullCheckerFactory, TApiCaller } from '../utils'
import { withRateLimit } from '../utils/withRateLimit'
import { INexusHelper, TGetPackageVersionsOpts, TRateLimitOpts } from './interfaces'

export class NexusComponentsHelper implements INexusHelper {
  private searchApi: SearchApi
  private componentsApi: ComponentsApi

  constructor(
    searchApi: SearchApi,
    componentsApi: ComponentsApi,
    rateLimitOpts?: TRateLimitOpts,
    rateLimitStorageTtl?: number
  ) {
    this.searchApi = searchApi
    this.componentsApi = componentsApi
    return withRateLimit<NexusComponentsHelper>(
      this,
      rateLimitOpts,
      ['componentsApi.deleteComponent'],
      rateLimitStorageTtl
    )
  }

  async deleteComponentsByIds(
    ids: string[]
  ): Promise<any> {
    return Promise.all(ids.map(id => this.componentsApi.deleteComponent(id)))
  }

  async getPackageComponents(
    opts: TGetPackageVersionsOpts,
  ): Promise<TComponent[]> {
    const { repository, group, name, timeout, sortDirection, sortField } = opts
    const apiCaller: TApiCaller = (token) =>
      this.searchApi.search(
        token,
        sortField,
        sortDirection,
        timeout,
        undefined,
        repository,
        undefined,
        group,
        name,
      )

    return apiGetAll<TComponent>(apiCaller)
  }

  static filterComponentsByRange(components: TComponent[], range: string): Array<TComponent & IComponentInfo> {
    return components
      .filter(nullCheckerFactory<IComponentInfo>(v => v && isDefined(v.version) && isDefined(v.id)))
      .filter(item => satisfies(item.version, range))
  }
}
