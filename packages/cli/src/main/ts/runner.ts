import { ComponentsApi, SearchApi } from "@qiwi/nexus-client/target/es5/api"
import { NexusComponentsHelper } from '@qiwi/nexus-helper'

import { execute } from './executor'
import { ICliOpts } from './interfaces'
import { getConfig } from './utils'

export const run = (opts: ICliOpts): Promise<void> => {
  const config = getConfig(opts)
  const { nexus } = config

  const apiOptions = {
    basePath: nexus.url,
    baseOptions: {
      auth: {
        password: nexus.password,
        username: nexus.username,
      }
    },
  }

  const searchApi = new SearchApi(apiOptions)
  const componentsApi = new ComponentsApi(apiOptions)
  const helper = new NexusComponentsHelper(searchApi, componentsApi)

  return execute(config.package, helper, config.yes)
}
