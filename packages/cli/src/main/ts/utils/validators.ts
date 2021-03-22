import { check } from 'blork'

import { IBaseConfig, TDeleteConfig, TDownloadConfig } from '../interfaces'
import { DeepPartial } from './misc'

export const validateConfig = (config: DeepPartial<IBaseConfig>): IBaseConfig => {
  const { url, auth, action, batch } = config

  check(url, 'config.url: string')
  check(auth, 'config.auth: { "username": str, "password": str }')
  check(action, 'config.action: "download" | "delete"')
  check(batch, 'config.batch: { "skipErrors": bool? }')

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

  if (config.data.npmBatch) {
    check(config.data.npmBatch.access, 'config.data.npmBatch.access: "public" | "restricted"')
  }

  return config as TDownloadConfig
}
