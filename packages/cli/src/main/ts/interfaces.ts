import { NexusComponentsHelper, TGetPackageAssetsOpts } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'

export interface IPackageOpts {
  group?: string
  name: string
  version?: string
  range: string
  repo: string
}

export type TAction = 'delete' | 'download'

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

export type TDeleteConfigData = IPackageOpts & { prompt?: boolean }

export type TDeleteConfig = IBaseConfig<'delete', TDeleteConfigData>

export type TPackageAccess = 'public' | 'restricted'

export type TNpmBatchOpts = {
  access: TPackageAccess
  batch?: TPublishConfig['batch']
  registryUrl?: TPublishConfig['registryUrl']
  auth?: TPublishConfig['auth']
}

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
