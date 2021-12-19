import { check } from 'blork'

import { IBaseConfig, TCompareConfig, TDeleteConfig, TDownloadConfig } from '../interfaces'
import { DeepPartial } from './misc'

export const validateConfig = (config: DeepPartial<IBaseConfig>): IBaseConfig => {
  const { url, auth, action, batch } = config
  check(action, 'config.action: "download" | "delete" | "compare"')

  if (action !== 'compare') {
    check(url, 'config.url: string')
    check(auth, 'config.auth: { "username": str, "password": str }')
    check(batch, 'config.batch: { "skipErrors": bool? }')
  }

  return config as IBaseConfig
}

export const validateDeleteConfig = (config: IBaseConfig): TDeleteConfig => {
  check(config.data.group, 'config.data.group: str | "null" | undefined')
  check(config.data.name, 'config.data.name: str')
  check(config.data.version, 'config.data.version: str?')
  check(config.data.prompt, 'config.data.prompt: bool?')
  check(config.data.repo, 'config.data.repo: str')

  return config as TDeleteConfig
}

export const validateDownloadConfig = (config: IBaseConfig): TDownloadConfig => {
  check(config.data.group, 'config.data.group: str | "null" | undefined')
  check(config.data.name, 'config.data.name: str?')
  check(config.data.version, 'config.data.version: str?')
  check(config.data.cwd, 'config.data.cwd: str?')
  check(config.data.repo, 'config.data.repo: str')
  check(config.data.range, 'config.data.range: str?')
  check(config.data.sortField, 'config.data.sortField: "group" | "name" | "version" | "repository" | undefined')
  check(config.data.sortDirection, 'config.data.sortDirection: "asc" | "desc" | undefined')

  if (config.data.npmBatch) {
    check(config.data.npmBatch.access, 'config.data.npmBatch.access: "public" | "restricted"')
  }

  return config as TDownloadConfig
}

export const validateCompareConfig = (config: IBaseConfig): TCompareConfig => {
  check(config.data.cwd, 'config.data.cwd: str')

  check(config.data.packages, 'config.data.packages: arr+')
  config.data.packages.forEach((item: any, i: number) =>
    check(item,`config.data.packages[${i}]: { "name": str, "group": str | "null" | undefined }`)
  )
  check(config.data.primaryRegistry.repo, 'config.data.primaryRegistry.repo: str')
  check(config.data.primaryRegistry.url, 'config.data.primaryRegistry.url: string')
  check(config.data.primaryRegistry.auth, 'config.data.primaryRegistry.auth: { "username": str, "password": str }')

  check(config.data.secondaryRegistry.repo, 'config.data.primaryRegistry.repo: str')
  check(config.data.secondaryRegistry.url, 'config.data.primaryRegistry.url: string')
  check(config.data.secondaryRegistry.auth, 'config.data.primaryRegistry.auth: { "username": str, "password": str }')

  return config as TCompareConfig
}
