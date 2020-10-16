import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'

import { TComponent } from '../interfaces'
import { apiGetAll, TApiCaller } from '../utils'
import {
  INexusHelper,
  TGetPackageVersionsOpts,
} from './interfaces'
import { IWrapperOpts } from 'push-it-to-the-limit/target/es5/interface'
import { DeepProxy } from '@qiwi/deep-proxy'
import { ratelimit } from 'push-it-to-the-limit'

export class NexusComponentsHelper implements INexusHelper {
  private searchApi: SearchApi
  private componentsApi: ComponentsApi

  constructor(
    searchApi: SearchApi,
    componentsApi: ComponentsApi,
    componentsWrapperOpts: IWrapperOpts
  ) {
    this.searchApi = searchApi
    this.componentsApi = NexusComponentsHelper.applyMethodCallLimit(
      componentsApi,
      'deleteComponent',
      componentsApi.deleteComponent.bind(componentsApi),
      componentsWrapperOpts
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

  static applyMethodCallLimit<T = any>(
    entity: T,
    methodName: string,
    methodBody: Parameters<typeof ratelimit>[0],
    opts: IWrapperOpts
  ): DeepProxy<T> {
    const limitedMethod = ratelimit(methodBody, opts)
    return new DeepProxy<T>(
      entity,
      // @ts-ignore
      ({ trapName, key, DEFAULT }) => {
        if (trapName === 'get') {
          if (key === methodName) {
            return limitedMethod
          }
        }
        return DEFAULT
      }
    )
  }
}
