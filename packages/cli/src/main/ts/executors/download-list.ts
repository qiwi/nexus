import { INexusHelper } from '@qiwi/nexus-helper'

import {
  enrichSettledResults,
  extractResults,
  getDownloadPaths,
  logResultMessage, printSettledErrorResults,
  writeDownloadResults
} from '../common/download'
import { TDownloadByListConfigData } from '../interfaces'
import { getPackageVersionedFullName } from '../utils'

export const performDownloadByList = async (data: TDownloadByListConfigData, helper: INexusHelper): Promise<void> => {
  const { packages, repo, npmBatch, cwd  } = data
  const { infoOutputPath, downloadsPath } = getDownloadPaths(cwd)

  const list = packages.map(item => ({ ...item, repository: repo }))

  const result = await helper.downloadPackageAssetsByList(list, cwd)
  const { fulfilledResults, rejectedResults} = extractResults(enrichSettledResults(result, packages.map(getPackageVersionedFullName)))

  printSettledErrorResults(rejectedResults)

  writeDownloadResults(fulfilledResults, infoOutputPath, npmBatch)

  logResultMessage({
    successfulCount: fulfilledResults.length,
    failedCount: rejectedResults.length,
    infoOutputPath,
    downloadsPath,
  })
}
