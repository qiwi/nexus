import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'

import { TComponent } from '../interfaces'
import { apiGetAll, slowBatchExecutor, TApiCaller } from '../utils'
import {
  INexusHelper,
  TDeletePackagesByIdsOpts,
  TGetPackageVersionsOpts,
} from './interfaces'

export class NexusComponentsHelper implements INexusHelper {
  constructor(
    private searchApi: SearchApi,
    private componentsApi: ComponentsApi,
  ) {}

  async deleteComponentsByIds(
    ids: string[],
    opts?: TDeletePackagesByIdsOpts,
  ): Promise<void> {
    await slowBatchExecutor<void>({
      executor: (id) => this.componentsApi.deleteComponent(id),
      params: ids,
      step: opts?.chunkSize,
      timeout: opts?.pause,
    })
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
}
