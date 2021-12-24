import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { INexusHelper, NexusComponentsHelper } from '@qiwi/nexus-helper'
import { mkdirSync,readFileSync, writeFileSync } from 'fs'
import { sep } from 'path'
import { createInterface } from 'readline'

import { IBaseConfig } from '../interfaces'

export const question = (message: string): Promise<string> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(message, resolve)
  })
}

export const readFileToString = (path: string): string => readFileSync(path).toString()

export const writeJson = (obj: Record<string, any>, path: string): void => {
  const dirPath = path
    .split(sep)
    .slice(0, -1)
    .join(sep)

  mkdirSync(dirPath, { recursive: true})

  writeFileSync(path, JSON.stringify(obj, null, '\t')) // eslint-disable-line unicorn/no-null
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
}

const defaultRateLimit = {
  period: 1000,
  count: 3,
}

export const helperFactory = (config: IBaseConfig): INexusHelper => {
  const apiOptions = {
    basePath: config.url,
    baseOptions: {
      auth: {
        password: config.auth.password,
        username: config.auth.username,
      }
    },
  }

  const searchApi = new SearchApi(apiOptions)
  const componentsApi = new ComponentsApi(apiOptions)

  return new NexusComponentsHelper(
    searchApi,
    componentsApi,
    config.batch?.rateLimit || defaultRateLimit
  )
}

export { callWithRetry } from '@qiwi/nexus-utils'

export const getPackageFullName = (item: { group?: string, name: string }): string =>
  `${item.group && item.group !== 'null' ? '@' + item.group + '/' : ''}${item.name}`

export const getPackageVersionedFullName = (item: { group?: string, name: string, version: string }): string =>
  `${getPackageFullName(item)}@${item.version}`
