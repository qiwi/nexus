import { performCompare } from './executors/compare'
import { performDelete } from './executors/delete'
import { performDownload } from './executors/download'
import { performDownloadLatest } from './executors/download-latest'
import { performDownloadByList } from './executors/download-list'
import { IBaseConfig } from './interfaces'
import { getConfig, helperFactory } from './utils'

export const runExecutor = (
  rawConfig: IBaseConfig,
  configPath?: string
): Promise<void> => {
  const config = getConfig(rawConfig, configPath)

  switch (config.action) {
    case 'delete': {
      return performDelete(config.data, helperFactory(config))
    }
    case 'download': {
      return performDownload(config.data, helperFactory(config))
    }
    case 'compare': {
      return performCompare(config.data)
    }
    case 'download-by-list': {
      return performDownloadByList(config.data, helperFactory(config))
    }
    case 'download-latest': {
      return performDownloadLatest(config.data, helperFactory(config))
    }
  }
}
