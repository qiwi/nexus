import { ICliOpts } from '../interfaces'
import { readFileToString } from './misc'
import { DeepPartial } from './types'

export const resolveConfig = (
  configOpts: ICliOpts,
  cliOpts: DeepPartial<ICliOpts>,
): ICliOpts => {
  return {
    nexus: {
      ...configOpts.nexus,
      ...cliOpts.nexus,
    },
    package: {
      ...configOpts.package,
      ...cliOpts.package,
    },
    yes: cliOpts.yes ?? configOpts.yes
  }
}

export const getConfig = (opts: DeepPartial<ICliOpts>): ICliOpts => {
  if (opts.config) {
    const config = JSON.parse(readFileToString(opts.config))
    return resolveConfig(
      config,
      opts,
    )
  }

  const { nexus, package: packageOpts } = opts

  if (!nexus || !nexus.password || !nexus.username || !nexus.url) {
    throw new Error('Nexus options are not given. Specify them in args or in config file')
  }

  if(!packageOpts || !packageOpts.repo || !packageOpts.group || !packageOpts.name || !packageOpts.range) {
    throw new Error('Package options are not given. Specify them in args or in config file')
  }

  return opts as ICliOpts
}
