import { NexusComponentsHelper } from '@qiwi/nexus-helper'

import { ICliOpts, run } from '../../main/ts'
import * as executor from '../../main/ts/executor'
import { defaultLimit } from '../../main/ts/utils'
import * as config from '../../main/ts/utils/config'

const opts: ICliOpts = {
  nexus: {
    username: 'foo',
    password: 'bar',
    url: 'baz',
    rateLimit: defaultLimit
  },
  package: {
    repo: 'foo',
    group: 'bar',
    name: 'baz',
    range: '<1.0.3'
  }
}

beforeAll(() => jest.resetAllMocks())

describe('run', () => {
  it('calls getConfig and execute', async () => {
    const resolvedOpts: ICliOpts = {
      ...opts,
      nexus: {
        ...opts.nexus,
        url: 'baz2'
      }
    }
    const getConfigSpy = jest.spyOn(config, 'getConfig')
      .mockImplementation(() => resolvedOpts)
    const executeSpy = jest.spyOn(executor, 'execute')
      .mockImplementation(async () => { /* noop */ })

    await run(opts)

    expect(getConfigSpy).toHaveBeenCalledWith(opts)
    expect(executeSpy).toHaveBeenCalledWith(
      resolvedOpts.package,
      expect.any(NexusComponentsHelper),
      resolvedOpts.prompt,
      resolvedOpts.proceedOnErrors
    )
  })
})
