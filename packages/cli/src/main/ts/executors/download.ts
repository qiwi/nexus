import { INexusHelper, TAssetInfo } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'
import mkdirp from 'mkdirp'
import { join } from 'path'

import { TDownloadConfigData, TDownloadConfigDataStrict, TPackageAccess } from '../interfaces'
import { readFileToString, writeJson } from '../utils'

export const performDownload = async (data: TDownloadConfigDataStrict, helper: INexusHelper): Promise<void> => {
  const { repo, group, name, cwd, npmBatch, range, sortDirection, sortField } = data
  const opts = { repository: repo, group, name, range, sortField, sortDirection }
  const { downloadsPath, infoOutputPath } = getPathsWithTimestamp(cwd)

  writeJson(npmBatch ? prepareNpmBatchConfig([], npmBatch.access) : [], infoOutputPath)

  let token
  let i = 0
  let downloadedAssetsCount = 0
  let failedAssetsCount = 0

  do {
    // @ts-ignore
    const { items, continuationToken } = await helper.downloadPackageAssets(opts, downloadsPath, token)
    const { fulfilledResults, rejectedResults } = extractResults(items)

    downloadedAssetsCount += fulfilledResults.length
    failedAssetsCount += rejectedResults.length
    appendResults(fulfilledResults, infoOutputPath, npmBatch)
    printErrors(rejectedResults)

    token = continuationToken
    console.log(`Page #${i} 's been processed, ${fulfilledResults.length} successful, ${rejectedResults.length} failed download(s), next token is ${token}`)
    i++
  } while (token)

  console.log()
  console.log('Done.')
  console.log(`${downloadedAssetsCount} successful, ${failedAssetsCount} failed downloads`)
  console.log(`Metadata is written to ${infoOutputPath}, assets are saved to ${downloadsPath}`)
}

export const appendResults = (assetInfos: Array<TAssetInfo>, infoOutputPath: string, npmBatch?: TDownloadConfigData['npmBatch']): void => {
  try {
    const file = JSON.parse(readFileToString(infoOutputPath))

    if (npmBatch) {
      file.data.push(...assetInfos)
      writeJson(prepareNpmBatchConfig(file.data, npmBatch.access), infoOutputPath)
      return
    }
    file.push(...assetInfos)
    writeJson(file, infoOutputPath)
  } catch (e) {
    console.error(`Error during appending results to ${infoOutputPath}`, e)
  }
}

export const printErrors = (errors: any[]): void => {
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
