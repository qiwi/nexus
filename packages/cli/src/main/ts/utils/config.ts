import { ICliOpts, ICliOptsOptional } from '../interfaces'
import { readFileToString } from './misc'

export const defaultLimit = {
  period: 1000,
  count: 10
}

export const resolveConfig = (
  configOpts: ICliOpts,
  cliOpts: ICliOptsOptional,
): ICliOpts => {
  return {
    nexus: {
      ...configOpts.nexus,
      ...cliOpts.nexus,
      rateLimit: cliOpts?.nexus?.rateLimit || configOpts?.nexus?.rateLimit || defaultLimit
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

  nexus.rateLimit = nexus.rateLimit || defaultLimit

  return config
}