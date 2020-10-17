import { ICliOpts, ICliOptsOptional } from '../interfaces'
import { readFileToString } from './misc'

export const defaultLimit = {
  delay: {
    period: 1000,
    count: 10
  }
}

export const resolveConfig = (
  configOpts: ICliOpts,
  cliOpts: ICliOptsOptional,
): ICliOpts => {
  return {
    nexus: {
      ...configOpts.nexus,
      ...cliOpts.nexus,
      limit: cliOpts?.nexus?.limit || configOpts.nexus.limit || defaultLimit
    },
    package: {
      ...configOpts.package,
      ...cliOpts.package,
    },
    yes: cliOpts.yes ?? configOpts.yes,
  }
}

export const getConfig = (opts: ICliOptsOptional): ICliOpts => {
  const fileConfig = opts.config ? JSON.parse(readFileToString(opts.config)) : {}
  const config = resolveConfig(
    fileConfig,
    opts,
  )

  const { nexus, package: packageOpts } = config

  if (!nexus || !nexus.password || !nexus.username || !nexus.url) {
    throw new Error('Nexus options are not given. Specify them in args or in config file')
  }

  if (!packageOpts || !packageOpts.repo || !packageOpts.group || !packageOpts.name || !packageOpts.range) {
    throw new Error('Package options are not given. Specify them in args or in config file')
  }

  nexus.limit = nexus.limit || defaultLimit

  return config
}
