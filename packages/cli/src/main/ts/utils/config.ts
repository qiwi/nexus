import {
  IBaseConfig,
  TCompareConfig,
  TDeleteConfig,
  TDownloadByListConfig,
  TDownloadConfig,
  TDownloadConfigStrict, TDownloadLatestConfig
} from '../interfaces'
import { DeepPartial, readFileToString } from './misc'
import {
  validateCompareConfig,
  validateConfig,
  validateDeleteConfig,
  validateDownloadConfig, validateDownloadLatestConfig,
  validateDownloadListConfig
} from './validators'

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

export const resolveCompareConfig = (config: TCompareConfig): TCompareConfig => {
  return {
    ...config,
    data: {
      ...config.data,
      packages: config.data.packages.map(item => ({ ...item, group: normalizeStringifiedNullable(item.group) })),
    }
  }
}

export const resolveDownloadByListConfig = (config: TDownloadByListConfig): TDownloadByListConfig => { // eslint-disable-line sonarjs/no-identical-functions
  return {
    ...config,
    data: {
      ...config.data,
      packages: config.data.packages.map(item => ({ ...item, group: normalizeStringifiedNullable(item.group) })),
    }
  }
}

export const resolveDownloadLatestConfig = (config: TDownloadLatestConfig): TDownloadLatestConfig => { // eslint-disable-line sonarjs/no-identical-functions
  return {
    ...config,
    data: {
      ...config.data,
      packages: config.data.packages.map(item => ({ ...item, group: normalizeStringifiedNullable(item.group) })),
    }
  }
}

export const getConfig = (
  opts: IBaseConfig,
  configPath?: string,
): TDownloadConfigStrict | TDeleteConfig | TCompareConfig | TDownloadByListConfig | TDownloadLatestConfig => {
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
    return resolveCompareConfig(validateCompareConfig(config))
  }

  if (config.action === 'download-by-list') {
    return resolveDownloadByListConfig(validateDownloadListConfig(config))
  }

  if (config.action === 'download-latest') {
    return resolveDownloadLatestConfig(validateDownloadLatestConfig(config))
  }

  throw new Error('Unsupported action in config')
}
