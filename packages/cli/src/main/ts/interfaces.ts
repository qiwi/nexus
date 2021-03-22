import { NexusComponentsHelper, TGetPackageAssetsOpts } from '@qiwi/nexus-helper'

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
    rateLimit?: ConstructorParameters<typeof NexusComponentsHelper>[3]
  },
  data: T,
}

export type TDeleteConfigData = IPackageOpts & { prompt?: boolean }

export type TDeleteConfig = IBaseConfig<'delete', TDeleteConfigData>

export type TPackageAccess = 'public' | 'restricted'

export type TDownloadConfigMetaData = {
  range?: string
  cwd: string
  npmBatch?: {
    access: TPackageAccess
  }
  sortField?: TGetPackageAssetsOpts['sortField'],
  sortDirection?: TGetPackageAssetsOpts['sortDirection'],
}

export type TDownloadConfigData = Partial<IPackageOpts> & Pick<IPackageOpts, 'repo'> & Partial<TDownloadConfigMetaData>

export type TDownloadConfigDataStrict = Partial<IPackageOpts> & Pick<IPackageOpts, 'repo'> & TDownloadConfigMetaData

export type TDownloadConfig = IBaseConfig<'download', TDownloadConfigData>

export type TDownloadConfigStrict = IBaseConfig<'download', TDownloadConfigDataStrict>
