import { INexusHelper, NexusComponentsHelper, TAsset, TAssetInfo, TGetPackageAssetsOpts } from '@qiwi/nexus-helper'
import { TPublishConfig } from '@qiwi/npm-batch-cli-api'
import mkdirp from 'mkdirp'
import { join } from 'path'
import { satisfies } from 'semver'

import { TDownloadConfigDataStrict, TNpmBatchOpts } from '../interfaces'
import { callWithRetry, readFileToString, writeJson } from '../utils'

export const performDownload = async (data: TDownloadConfigDataStrict, helper: INexusHelper): Promise<void> => {
  const { repo, group, name, cwd, npmBatch, range, sortDirection, sortField, retryCount } = data
  const opts = { repository: repo, group, name, range, sortField, sortDirection }
  const { downloadsPath, infoOutputPath } = getPaths(cwd)

  writeJson(npmBatch ? prepareNpmBatchConfig([], npmBatch) : [], infoOutputPath)

  let token: string | undefined
  let downloadedAssetsCount = 0
  let failedAssetsCount = 0
  const downloadedAssetsMap: Record<string, string> = {}

  const getAssets = async (opts: TGetPackageAssetsOpts, token: string | undefined) => {
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

  const links: TAsset[] = []

  do {
    const { items, continuationToken } = await callWithRetry(
      () => getAssets(opts, token),
      retryCount || 5,
    )

    links.push(...items)

    token = continuationToken
  } while (token)

  console.log(`Got data about ${links.length} assets`)

  const results: TAssetInfo[] = []

  for (const asset of links) {
    if (!asset.path) {
      console.error(`Got asset without path ${asset.id}`)
      continue
    }

    const { name, version } = NexusComponentsHelper.extractNameAndVersionFromPath(asset.path)
    const filePath = join(cwd, 'downloads', `${name.replace('/', '%2F')}@${version}`)

    if (!group && !name) {
      console.log(`Could not extract nexus name and group from ${name}`)
      failedAssetsCount++
      continue
    }

    process.stdout.write(`${name}@${version}...`)
    await helper.downloadPackageAsset({ group, name, version, repository: repo }, filePath)
      .then(() => {
        console.log('Downloaded!')
        results.push({ version, name, filePath })
        downloadedAssetsCount++
      })
      .catch(error => {
        console.log(error)
        console.error(`${name}@${version} ${error}`)
        failedAssetsCount++
      })
  }

  appendResults(results, infoOutputPath, npmBatch)

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

export const extractResults = <T = TAssetInfo>(
  items: PromiseSettledResult<T>[]
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
  data: assetInfos.map(item => ({ ...item, access: npmBatch.access }))
})
