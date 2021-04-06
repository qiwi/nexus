import { INexusHelper, TAssetInfo, TPaginatedSettledResult } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'
import mkdirp from 'mkdirp'
import { join } from 'path'

import { TDownloadConfigDataStrict, TNpmBatchOpts } from '../interfaces'
import { callWithRetry, readFileToString, writeJson } from '../utils'

export const performDownload = async (data: TDownloadConfigDataStrict, helper: INexusHelper): Promise<void> => {
  const { repo, group, name, cwd, npmBatch, range, sortDirection, sortField, retryCount } = data
  const opts = { repository: repo, group, name, range, sortField, sortDirection }
  const { downloadsPath, infoOutputPath } = getPaths(cwd)

  writeJson(npmBatch ? prepareNpmBatchConfig([], npmBatch) : [], infoOutputPath)

  let token: string | undefined
  let i = 0
  let downloadedAssetsCount = 0
  let failedAssetsCount = 0
  const acc: Record<any, boolean> = {}

  do {
    const { items, continuationToken } = await callWithRetry<TPaginatedSettledResult<TAssetInfo>>(
      () => helper.downloadPackageAssets(opts, downloadsPath, token),
      retryCount || 4
    )
    const { fulfilledResults, rejectedResults } = extractResults(items)

    downloadedAssetsCount += fulfilledResults.length
    failedAssetsCount += rejectedResults.length
    appendResults(fulfilledResults, infoOutputPath, npmBatch)

    // Sometimes Nexus Rest API response contains duplicates
    // TODO: remove after bugfix
    fulfilledResults?.forEach(item => {
      if (acc[item.version || '']) {
        writeJson((helper as any).acc, 'test-double-found-error.json')
        throw new Error('Found duplicate')
      }
      acc[item.version || ''] = true
    })

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

export const appendResults = (assetInfos: Array<TAssetInfo>, infoOutputPath: string, npmBatch?: TNpmBatchOpts): void => {
  try {
    const file = JSON.parse(readFileToString(infoOutputPath))

    if (npmBatch) {
      file.data.push(...assetInfos)
      writeJson(prepareNpmBatchConfig(file.data, npmBatch), infoOutputPath)
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

export const getPaths = (cwd: string): { infoOutputPath: string, downloadsPath: string } => {
  const infoOutputPath = join(cwd, `meta.json`)
  const downloadsPath = join(cwd, `downloads`)

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

export const prepareNpmBatchConfig = (assetInfos: TAssetInfo[], npmBatch: TNpmBatchOpts): TPublishConfig => ({
  registryUrl: npmBatch.registryUrl || '',
  auth: npmBatch.auth || {
    username: '',
    password: '',
    email: '',
  },
  batch: npmBatch.batch,
  action: 'publish',
  data: assetInfos.map(item => ({ ...item, access: npmBatch.access }))
})
