import { NexusComponentsHelper, TGetPackageAssetsOpts } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'
import { TNpmRegClientAuth } from '@qiwi/npm-batch-client'

export interface IPackageOpts {
  group?: string
  name: string
  version?: string
  range: string
  repo: string
}

export type TAction = 'delete' | 'download' | 'compare' | 'download-by-list' | 'download-latest'

export interface IBaseConfig<TA = TAction, T = any> {
  url: string
  auth: {
    username: string
    password: string
  }
  action: TA
  batch?: {
    rateLimit?: ConstructorParameters<typeof NexusComponentsHelper>[2]
  },
  data: T,
}

export type TBaseConfigOptionalApi<TA = TAction, T = any> =
  Pick<IBaseConfig<TA, T>, 'data' | 'action'> & Partial<Pick<IBaseConfig<TA, T>, 'url' | 'auth' | 'batch'>>

export type TDeleteConfigData = IPackageOpts & { prompt?: boolean }

export type TDeleteConfig = IBaseConfig<'delete', TDeleteConfigData>

export type TCompareRegistryOpts = Pick<IBaseConfig, 'url' | 'auth'>

export type TDownloadListItem = Required<Pick<TGetPackageAssetsOpts, 'name' | 'version'>> & Pick<TGetPackageAssetsOpts, 'group'>

export type TPackageAccess = 'public' | 'restricted'

export type TNpmBatchOpts = {
  access: TPackageAccess
  batch?: TPublishConfig['batch']
  registryUrl?: TPublishConfig['registryUrl']
  auth?: TPublishConfig['auth']
}

export type TDownloadByListConfigData = {
  repo: string
  cwd: string
  packages: TDownloadListItem[]
  npmBatch?: TNpmBatchOpts
}

export type TDownloadByListConfig = IBaseConfig<'download-by-list', TDownloadByListConfigData>

export type TCompareConfigData = {
  primaryRegistry: TCompareRegistryOpts
  secondaryRegistry: TCompareRegistryOpts
  packages: Array<Pick<IPackageOpts, 'name' | 'group'>>
  cwd: string
  downloadConfig?: Omit<TDownloadByListConfig, 'data' | 'action'> & {
    data: Pick<TDownloadByListConfig['data'], 'repo' | 'cwd' | 'npmBatch'>
  }
}

export type TCompareConfig = TBaseConfigOptionalApi<'compare', TCompareConfigData>

export type TDownloadLatestConfigData = {
  packages: Array<Pick<IPackageOpts, 'name' | 'group'>>
  registry: {
    url: string
    auth: TNpmRegClientAuth
  }
  repo: string
  cwd: string
  npmBatch?: TNpmBatchOpts
}

export type TDownloadLatestConfig = IBaseConfig<'download-latest', TDownloadLatestConfigData>

export type TDownloadConfigMetaData = {
  retryCount?: number
  range?: string
  cwd: string
  npmBatch?: TNpmBatchOpts
  sortField?: TGetPackageAssetsOpts['sortField'],
  sortDirection?: TGetPackageAssetsOpts['sortDirection'],
}

export type TDownloadConfigData = Partial<IPackageOpts> & Pick<IPackageOpts, 'repo'> & Partial<TDownloadConfigMetaData>

export type TDownloadConfigDataStrict = Partial<IPackageOpts> & Pick<IPackageOpts, 'repo'> & TDownloadConfigMetaData

export type TDownloadConfig = IBaseConfig<'download', TDownloadConfigData>

export type TDownloadConfigStrict = IBaseConfig<'download', TDownloadConfigDataStrict>
