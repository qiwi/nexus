import { INexusHelper } from '@qiwi/nexus-helper'
import { NpmRegClientBatchWrapper, NpmRegClientWrapper, Packument } from '@qiwi/npm-batch-client'
import { rcompare } from 'semver'

import {
  enrichSettledResults,
  extractResults,
  getDownloadPaths,
  logResultMessage, printSettledErrorResults,
  writeDownloadResults
} from '../common/download'
import { TDownloadLatestConfigData } from '../interfaces'
import { getPackageFullName } from '../utils'

const getLatestVersion = (versions: string[]): string => {
  return versions.sort(rcompare)[0]
}

export const performDownloadLatest = async (data: TDownloadLatestConfigData, helper: INexusHelper): Promise<void> => {
  const { packages, cwd, repo, npmBatch, registry } = data
  const { downloadsPath, infoOutputPath } = getDownloadPaths(cwd)

  const regClient = new NpmRegClientWrapper(
    registry.url,
    {
      ...registry.auth,
      alwaysAuth: true,
    }
  )

  const regBatchClient = new NpmRegClientBatchWrapper(regClient)
  const packageFullNames = packages.map(getPackageFullName)

  const results = await regBatchClient.getPackument(packageFullNames, true)
  const enrichedData = enrichSettledResults(results, packageFullNames)
  const { fulfilledResults, rejectedResults } = extractResults<Packument>(enrichedData)

  printSettledErrorResults(rejectedResults)

  console.log(`Got packuments of ${fulfilledResults.length} packages, ${rejectedResults.length} packages failed`)

  const list = fulfilledResults.map((item, i) => ({
    repository: repo,
    name: packages[i].name,
    group: packages[i].group,
    version: getLatestVersion(Object.keys(item.versions)),
  }))

  const downloadResults = await helper.downloadPackageAssetsByList(list, downloadsPath)
  const downloadExtractedResults = extractResults(downloadResults)

  writeDownloadResults(downloadExtractedResults.fulfilledResults, infoOutputPath, npmBatch)

  logResultMessage({
    successfulCount: downloadExtractedResults.fulfilledResults.length,
    failedCount: downloadExtractedResults.rejectedResults.length + rejectedResults.length,
    infoOutputPath,
    downloadsPath,
  })
}
