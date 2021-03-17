import { INexusHelper } from '@qiwi/nexus-helper'

import { runExecutor } from '../../main/ts/executor'
import * as deleteExecutor from '../../main/ts/executors/delete'
import * as downloadExecutor from '../../main/ts/executors/download'
import * as config from '../../main/ts/utils/config'
import * as misc from '../../main/ts/utils/misc'

describe('runExecutor', () => {
  it ('calls performDelete', async () => {
    const helperFactoryMock = jest.spyOn(misc, 'helperFactory')
      .mockImplementation(() => ({}) as INexusHelper)
    const getConfigMock = jest.spyOn(config, 'getConfig')
      .mockImplementation(() => ({ action: 'delete'}) as any)
    const deleteExecutorMock = jest.spyOn(deleteExecutor, 'performDelete')
      .mockImplementation(() => Promise.resolve())

    await runExecutor({} as any)

    expect(helperFactoryMock).toBeCalled()
    expect(getConfigMock).toBeCalled()
    expect(deleteExecutorMock).toBeCalled()
  })

  it ('calls performDelete', async () => {
    const helperFactoryMock = jest.spyOn(misc, 'helperFactory')
      .mockImplementation(() => ({}) as INexusHelper)
    const getConfigMock = jest.spyOn(config, 'getConfig')
      .mockImplementation(() => ({ action: 'download' }) as any)
    const downloadExecutorMock = jest.spyOn(downloadExecutor, 'performDownload')
      .mockImplementation(() => Promise.resolve())

    await runExecutor({} as any)

    expect(helperFactoryMock).toBeCalled()
    expect(getConfigMock).toBeCalled()
    expect(downloadExecutorMock).toBeCalled()
  })
})
