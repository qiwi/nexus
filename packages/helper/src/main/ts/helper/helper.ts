import { DeepProxy } from '@qiwi/deep-proxy'
import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { ratelimit } from 'push-it-to-the-limit'
import { IControlled,IWrapperOpts } from 'push-it-to-the-limit/target/es5/interface'
import { satisfies } from 'semver'

import { IComponentInfo, TComponent } from '../interfaces'
import { apiGetAll, TApiCaller } from '../utils'
import { isDefined, nullCheckerFactory } from '../utils/types'
import { INexusHelper, TGetPackageVersionsOpts } from './interfaces'

type TMethodCallLimit = {
  key: string
  value: Parameters<typeof ratelimit>[0]
  rateLimitOpts: IWrapperOpts
}

export class NexusComponentsHelper implements INexusHelper {
  private searchApi: SearchApi
  private componentsApi: ComponentsApi

  constructor(
    searchApi: SearchApi,
    componentsApi: ComponentsApi,
    componentsWrapperOpts?: IWrapperOpts
  ) {
    this.searchApi = searchApi
    this.componentsApi = componentsWrapperOpts
      ?
      NexusComponentsHelper.applyCallRateLimits(
        componentsApi,
        [{
          key: 'deleteComponent',
          value: componentsApi.deleteComponent.bind(componentsApi),
          rateLimitOpts: componentsWrapperOpts
        }]
      )
      : componentsApi
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

  static applyCallRateLimits<T = any>(
    entity: T,
    list: TMethodCallLimit[]
  ): T {
    const dict = list.reduce((acc, cur) => {
      acc[cur.key] = ratelimit(cur.value, cur.rateLimitOpts)
      return acc
    }, {} as Record<string, IControlled>)
    return new DeepProxy<T>(
      entity,
      // @ts-ignore
      ({ trapName, key, DEFAULT, value }) => {
        if (trapName === 'get' && typeof value === 'function') {
          const limitedMethod = dict[key]
          if (limitedMethod) {
            return limitedMethod
          }
        }
        return DEFAULT
      }
    )
  }

  static filterComponentsByRange(components: TComponent[], range: string): IComponentInfo[] {
    return components
      .filter(nullCheckerFactory<IComponentInfo>(v => v && isDefined(v.version) && isDefined(v.id)))
      .filter(item => satisfies(item.version, range))
  }
}
