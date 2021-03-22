import { INexusHelper, TAssetInfo } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'
import mkdirp from 'mkdirp'
import { join } from 'path'

import { TDownloadConfigData, TDownloadConfigDataStrict, TPackageAccess } from '../interfaces'
import { writeJson } from '../utils'

export const performDownload = async (data: TDownloadConfigDataStrict, helper: INexusHelper): Promise<void> => {
  const { repo, group, name, cwd, npmBatch, range } = data
  const opts = {
    repository: repo,
    group,
    name,
    range,
  }
  const { downloadsPath, infoOutputPath } = getPathsWithTimestamp(cwd)

  let token
  let i = 0
  const assetInfos = []
  const errors = []

  do {
    // @ts-ignore
    const { items, continuationToken } = await helper.downloadPackageAssets(opts, downloadsPath, token)
    const { fulfilledResults, rejectedResults } = extractResults(items)

    assetInfos.push(...fulfilledResults)
    errors.push(...rejectedResults)

    token = continuationToken
    console.log(`Assets page #${i} has been processed, downloaded ${fulfilledResults.length} asset(s)`)
    i++
  } while (token)

  processResults(assetInfos, errors, infoOutputPath, downloadsPath, npmBatch)
}

export const processResults = (
  assetInfos: Array<TAssetInfo>,
  errors: any[],
  infoOutputPath: string,
  downloadsPath: string,
  npmBatch?: TDownloadConfigData['npmBatch']
): void => {
  writeJson(
    npmBatch ? prepareNpmBatchConfig(assetInfos, npmBatch.access) : assetInfos,
    infoOutputPath
  )

  console.log('Done.')
  if (assetInfos.length > 0) {
    console.log(`${assetInfos.length} asset(s) is(are) downloaded to ${downloadsPath}, metadata is written to ${infoOutputPath}`)
  }
  if (errors.length > 0) {
    console.error(`${errors.length} asset(s) is(are) not downloaded due to errors:`)
    errors.forEach(error => console.error(error.message || error))
  }
}

export const getPathsWithTimestamp = (cwd: string): { infoOutputPath: string, downloadsPath: string } => {
  const date = new Date()
  const infoOutputPath = join(cwd, `nexus-cli-downloads-meta-${date.toISOString()}.json`)
  const downloadsPath = join(cwd, `nexus-cli-downloads-${date.toISOString()}`)

  mkdirp.sync(downloadsPath)

  return {
    infoOutputPath, downloadsPath
  }
}

export const extractResults = (
  items: PromiseSettledResult<TAssetInfo>[]
): { fulfilledResults: TAssetInfo[], rejectedResults: any[] } => ({
  fulfilledResults: items
    .filter((item: PromiseSettledResult<TAssetInfo>): item is PromiseFulfilledResult<TAssetInfo> => item.status === 'fulfilled')
    .map(item => item.value),
  rejectedResults: items
    .filter((item: PromiseSettledResult<TAssetInfo>): item is PromiseRejectedResult => item.status === 'rejected')
    .map(item => item.reason)
})

export const prepareNpmBatchConfig = (assetInfos: TAssetInfo[], access: TPackageAccess): TPublishConfig => ({
  registryUrl: '',
  auth: {
    username: '',
    password: '',
    email: '',
  },
  action: 'publish',
  data: assetInfos.map(item => ({ ...item, access }))
})
