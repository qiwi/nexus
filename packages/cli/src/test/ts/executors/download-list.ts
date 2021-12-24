import rimraf from 'rimraf'

import { performDownloadByList } from '../../../main/ts/executors/download-list'
import * as misc from '../../../main/ts/utils/misc'
import { assets, components, helperMockFactory } from '../utils'

const cwd = 'cwd-download-list'

describe('performDownloadList', function () {
  afterEach(() => {
    rimraf.sync(cwd)
    jest.clearAllMocks()
  })

  it('writes data', async () => {
    const writeJsonMock = jest.spyOn(misc, 'writeJson')
      .mockImplementation(() => { /* noop */ })
    jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    const helper = helperMockFactory(components, assets)

    await performDownloadByList(
      {
        cwd,
        repo: 'repo',
        packages: [],
      },
      helper
    )

    expect(writeJsonMock).toHaveBeenCalledWith(
      [],
      `${cwd}/meta.json`,
    )
  })
})
