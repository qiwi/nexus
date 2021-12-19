import { NpmRegClientWrapper } from '@qiwi/npm-batch-client'
import { join } from 'path'

import { TCompareConfigData, TCompareRegistryOpts, TDownloadListItem } from '../interfaces'
import { writeJson } from '../utils'

const clientFactory = (opts: TCompareRegistryOpts) =>  new NpmRegClientWrapper(
  opts.url,
  {
    ...opts.auth,
    email: '',
  }
)

export const performCompare = async (config: TCompareConfigData): Promise<void> => {
  const {
    secondaryRegistry,
    primaryRegistry,
    packages,
    cwd,
  } = config

  const primaryRegClient = clientFactory(primaryRegistry)
  const secondaryRegClient = clientFactory(secondaryRegistry)

  const downloadListMissing: TDownloadListItem[] = []
  const downloadListExtra: TDownloadListItem[] = []

  for (const item of packages) {
    const name = item.group && item.group !== 'null' ? `@${item.group}/${item.name}` : item.name
    try {
      const [
        primaryPackument,
        secondaryPackument,
      ] = await Promise.all([
        primaryRegClient.getPackument(name),
        secondaryRegClient.getPackument(name)
      ])

      const primaryVersions = Object.keys(primaryPackument.versions)
      const secondaryVersions = Object.keys(secondaryPackument.versions)

      secondaryVersions
        .filter(item => !primaryVersions.includes(item))
        .forEach(version => downloadListMissing.push({ version, name: item.name, group: item.group }))

      primaryVersions
        .filter(item => !secondaryVersions.includes(item))
        .forEach(version => downloadListExtra.push({ version, name: item.name, group: item.group }))
    } catch (e) {
      console.error(`Could not get data packuments for ${name}:`, e)
    }
  }

  const missingResultsPath = join(cwd, 'missing.json')
  const extraResultsPath = join(cwd, 'extra.json')

  writeJson(downloadListMissing, missingResultsPath)
  writeJson(downloadListExtra, extraResultsPath)

  console.log(`Done.`)
  console.log(`${downloadListMissing.length} packages are missing, ${downloadListExtra.length} packages are extra in primary registry`)
  console.log(`Metadata is written to ${missingResultsPath} and ${extraResultsPath}`)
}
