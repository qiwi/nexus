import { NexusComponentsHelper } from '@qiwi/nexus-helper'

export interface INexusOpts {
  url: string
  username: string
  password: string
  rateLimit: ConstructorParameters<typeof NexusComponentsHelper>[2]
}

export interface IPackageOpts {
  group?: string
  name: string
  range: string
  repo: string
}

export interface ICliOpts {
  nexus: INexusOpts
  package: IPackageOpts
  prompt?: boolean
  config?: string
}

export interface ICliOptsOptional {
  nexus?: Partial<INexusOpts>
  package?: Partial<IPackageOpts>
  prompt?: boolean
  config?: string
}
