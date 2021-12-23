import { INexusHelper, NexusComponentsHelper, TAsset, TDownloadAssetByListItem,TGetPackageAssetsOpts } from '@qiwi/nexus-helper'
import { satisfies } from 'semver'

import {
  enrichSettledResults,
  extractResults,
  getDownloadPaths,
  logResultMessage,
  printSettledErrorResults,
  writeDownloadResults
} from '../common/download'
import { TDownloadConfigDataStrict } from '../interfaces'
import { callWithRetry, getPackageVersionedFullName } from '../utils'

const getAssets = async (
  opts: TGetPackageAssetsOpts,
  token: string | undefined,
  downloadedAssetsMap: Record<string, string>,
  helper: INexusHelper
) => {
  const downloadedAssetsArrayOfCurPage: any[] = []
  const { items, continuationToken } = await helper.getPackageAssets(opts, token)

  if (!items) {
    return Promise.reject(new Error('Got empty items'))
  }

  for (const item of items) {
    if (!item.path) {
      console.error(`Got asset without path ${item.id}`)
    } else {
      if (downloadedAssetsMap[item.path] || downloadedAssetsArrayOfCurPage.find(it => it.name === item.path)) {
        console.error(`Got double for ${item.path}, current: ${token} saved: ${downloadedAssetsMap[item.path] || token}`)
      } else {
        downloadedAssetsArrayOfCurPage.push({ name: item.path, token })
      }
    }
  }

  const filteredItems =  items
    .filter(item => opts.range
      ? item.path
        ? satisfies(NexusComponentsHelper.extractNameAndVersionFromPath(item.path).version, opts.range)
        : false
      : true
    )

  downloadedAssetsArrayOfCurPage.forEach(item => {
    downloadedAssetsMap[item.name] = item.token
  })

  return { items: filteredItems, continuationToken }
}

export const performDownload = async (data: TDownloadConfigDataStrict, helper: INexusHelper): Promise<void> => {
  const { repo, group, name, cwd, npmBatch, range, sortDirection, sortField, retryCount } = data
  const opts = { repository: repo, group, name, range, sortField, sortDirection }
  const { downloadsPath, infoOutputPath } = getDownloadPaths(cwd)

  let token: string | undefined
  let failedAssetsCount = 0
  const downloadedAssetsMap: Record<string, string> = {}

  const links: TAsset[] = []

  do {
    const { items, continuationToken } = await callWithRetry(
      () => getAssets(opts, token, downloadedAssetsMap, helper),
      retryCount || 5,
    )

    links.push(...items)

    token = continuationToken
  } while (token)

  const assets = links.map(asset => {
    if (!asset.path) {
      console.error(`Got asset without path ${asset.id}`)
      failedAssetsCount++
      return // eslint-disable-line array-callback-return
    }
    const { name, version, group: assetGroup } = NexusComponentsHelper.extractNameAndVersionFromPath(asset.path)

    if (group === null && assetGroup) {
      return // eslint-disable-line array-callback-return
    }

    if (!version && !name) {
      console.error(`Could not extract nexus name and version from ${name}`)
      failedAssetsCount++
      return // eslint-disable-line array-callback-return
    }

    return { group: assetGroup, name, version, repository: repo }
  }).filter(Boolean) as TDownloadAssetByListItem[]

  console.log(`Got data about ${assets.length} assets`)

  const results = await helper.downloadPackageAssetsByList(assets, downloadsPath)
  const { fulfilledResults, rejectedResults } = extractResults(enrichSettledResults(results, assets.map(getPackageVersionedFullName)))

  printSettledErrorResults(rejectedResults)

  writeDownloadResults(fulfilledResults, infoOutputPath, npmBatch)

  logResultMessage({
    successfulCount: fulfilledResults.length,
    failedCount: failedAssetsCount + rejectedResults.length,
    infoOutputPath,
    downloadsPath,
  })
}
