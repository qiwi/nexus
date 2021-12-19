import { IBaseConfig, TCompareConfig, TDeleteConfig, TDownloadConfig, TDownloadConfigStrict } from '../interfaces'
import { DeepPartial, readFileToString } from './misc'
import { validateCompareConfig, validateConfig, validateDeleteConfig, validateDownloadConfig } from './validators'

export const defaultLimit = {
  period: 1000,
  count: 10
}

const normalizeStringifiedNullable = (value: any) => value === 'null' ? null : value // eslint-disable-line unicorn/no-null

export const resolveConfig = (
  configOpts: DeepPartial<IBaseConfig>,
  cliOpts: DeepPartial<IBaseConfig>,
): DeepPartial<IBaseConfig> => {
  return {
    url: cliOpts.url || configOpts.url,
    auth: {
      ...configOpts.auth,
      ...cliOpts.auth,
    },
    batch: {
      rateLimit: cliOpts.batch?.rateLimit || configOpts.batch?.rateLimit || defaultLimit
    },
    action: cliOpts.action || configOpts.action,
    data: {
      ...configOpts.data,
      ...cliOpts.data,
    }
  }
}

export const resolveDownloadConfig = (config: TDownloadConfig): TDownloadConfigStrict => {
  return {
    ...config,
    data: {
      ...config.data,
      group: normalizeStringifiedNullable(config.data.group),
      cwd: config.data.cwd || process.cwd()
    }
  }
}

export const resolveDeleteConfig = (config: TDeleteConfig): TDeleteConfig => {
  return {
    ...config,
    data: {
      ...config.data,
      group: normalizeStringifiedNullable(config.data.group)
    }
  }
}

export const getConfig = (opts: IBaseConfig, configPath?: string): TDownloadConfigStrict | TDeleteConfig | TCompareConfig => {
  const config = validateConfig(
    configPath
      ? resolveConfig(JSON.parse(readFileToString(configPath)), opts as any) as any
      : opts
  )

  if (config.action === 'delete') {
    return resolveDeleteConfig(validateDeleteConfig(config))
  }

  if (config.action === 'download') {
    return resolveDownloadConfig(validateDownloadConfig(config))
  }

  if (config.action === 'compare') {
    return validateCompareConfig(config)
  }

  throw new Error('Unsupported action in config')
}
