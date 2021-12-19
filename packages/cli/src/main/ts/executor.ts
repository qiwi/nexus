import { performCompare } from './executors/compare'
import { performDelete } from './executors/delete'
import { performDownload } from './executors/download'
import { IBaseConfig } from './interfaces'
import { getConfig, helperFactory } from './utils'

export const runExecutor = (
  rawConfig: IBaseConfig,
  configPath?: string
): Promise<void> => {
  const config = getConfig(rawConfig, configPath)
  const helper = helperFactory(config)

  switch (config.action) {
    case 'delete': {
      return performDelete(config.data, helper)
    }
    case 'download': {
      return performDownload(config.data, helper)
    }
    case 'compare': {
      return performCompare(config.data)
    }
  }
}
