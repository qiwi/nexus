export interface INexusOpts {
  url: string
  username: string
  password: string
}

export interface IPackageOpts {
  group: string
  name: string
  range: string
  repo: string
}

export interface IComponentInfo {
  id: string
  version: string
}

export interface ICliOpts {
  nexus: INexusOpts
  package: IPackageOpts
  yes?: boolean
  config?: string
}
