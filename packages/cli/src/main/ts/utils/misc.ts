import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { INexusHelper, NexusComponentsHelper } from '@qiwi/nexus-helper'
import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
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

export const writeJson = (obj: Record<string, any>, path: string): void =>
  writeFileSync(path, JSON.stringify(obj, null, '\t')) // eslint-disable-line unicorn/no-null

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
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
    axios.create({
      auth: config.auth
    }),
    config.batch?.rateLimit
  )
}
