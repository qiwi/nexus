import { TAssetInfo } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'
import mkdirp from 'mkdirp'
import { join } from 'path'
import { compare } from 'semver'

import { TNpmBatchOpts } from '../interfaces'
import { writeJson } from '../utils'

export const getDownloadPaths = (cwd: string): { infoOutputPath: string, downloadsPath: string } => {
  const infoOutputPath = join(cwd, `meta.json`)
  const downloadsPath = join(cwd, `downloads`)

  mkdirp.sync(downloadsPath)

  return {
    infoOutputPath,
    downloadsPath,
  }
}

export const extractResults = <T = TAssetInfo>(
  items: Array<PromiseSettledResult<T>>
): { fulfilledResults: T[], rejectedResults: any[] } => ({
  fulfilledResults: items
    .filter((item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> => item.status === 'fulfilled')
    .map(item => item.value),
  rejectedResults: items
    .filter((item: PromiseSettledResult<T>): item is PromiseRejectedResult => item.status === 'rejected')
    .map(item => item.reason)
})

export const prepareNpmBatchConfig = (assetInfos: TAssetInfo[], npmBatch: TNpmBatchOpts): TPublishConfig => ({
  registryUrl: npmBatch.registryUrl || '',
  auth: npmBatch.auth || {
    username: '',
    password: '',
    email: '',
  },
  batch: npmBatch.batch,
  action: 'publish',
  data: assetInfos
    .map(item => ({ ...item, access: npmBatch.access }))
    .sort((a, b) => compare(a.version, b.version))
})

export const writeDownloadResults = (assetInfos: Array<TAssetInfo>, infoOutputPath: string, npmBatch?: TNpmBatchOpts): void => {
  try {
    const results = npmBatch ? prepareNpmBatchConfig(assetInfos, npmBatch): assetInfos
    writeJson(results, infoOutputPath)
  } catch (e) {
    console.error(`Error during writing results to ${infoOutputPath}`, e)
  }
}

export const logResultMessage = (opts: { successfulCount: number, failedCount: number, infoOutputPath: string, downloadsPath: string }) => {
  const {
    successfulCount,
    failedCount,
    infoOutputPath,
    downloadsPath,
  } = opts

  console.log()
  console.log('Done.')
  console.log(`${successfulCount} successful, ${failedCount} failed downloads`)
  console.log(`Metadata is written to ${infoOutputPath}, assets are saved to ${downloadsPath}`)
}

export const enrichSettledResults = <T = any>(
  items: PromiseSettledResult<T>[],
  data: string[],
): PromiseSettledResult<T>[] => {
  return items.map((item, i) => ({
    ...item,
    reason: item.status === 'rejected'
      ? data[i] + ': ' + item.reason
      : undefined
  }))
}

export const printSettledErrorResults = (items: Array<string | undefined>[]) => {
  items.forEach(item => console.error(item || 'Unknown error'))
}
