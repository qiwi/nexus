import { join } from 'path'
import rimraf from 'rimraf'

import { performDownload } from '../../../main/ts/executors/download'
import * as misc from '../../../main/ts/utils/misc'
import { assets, components, helperMockFactory } from '../utils'

const cwd = 'cwd'

const assetInfos = Array.from({ length: assets.length }, (_, i) => ({
  access: 'public',
  filePath: join(cwd, 'downloads', `@qiwi-foo-bar%2Fbaz-bat@1.${i}.0.tgz`),
  name: '@qiwi-foo-bar/baz-bat',
  version: `1.${i}.0`,
}))

describe('performDownload', () => {
  afterEach(() => {
    rimraf.sync(cwd)
    jest.clearAllMocks()
  })

  it('calls proper methods of helper and write meta to file', async () => {
    const writeJsonMock = jest.spyOn(misc, 'writeJson')
      .mockImplementation(() => { /* noop */ })
    jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    const helper = helperMockFactory(components, assets)

    await performDownload(
      {
        name: 'name',
        cwd,
        repo: 'repo',
      },
      helper
    )

    expect(writeJsonMock).toHaveBeenCalledWith(
      assetInfos.map(item => ({ ...item, access: undefined })),
      "cwd/meta.json",
    )
  })

  it('prints npm batch config', async () => {
    jest.spyOn(misc, 'readFileToString')
      .mockImplementation(() => '{"data":[]}')
    const writeJsonMock = jest.spyOn(misc, 'writeJson')
      .mockImplementation(() => { /* noop */ })
    jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    const helper = helperMockFactory(components, assets)

    await performDownload(
      {
        name: 'name',
        cwd,
        repo: 'repo',
        npmBatch: {
          access: 'public'
        }
      },
      helper
    )
    expect(writeJsonMock).toHaveBeenCalledWith(
      {
        registryUrl: '',
        auth: {
          username: '',
          password: '',
          email: '',
        },
        action: 'publish',
        data: assetInfos,
      },
      'cwd/meta.json'
    )
  })

  it('prints errors', async () => {
    jest.spyOn(misc, 'writeJson')
      .mockImplementation(() => { /* noop */ })
    jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */})
    const errorSpy = jest.spyOn(console, 'error')
      .mockImplementation(() => { /* noop */})
    const helperMock = helperMockFactory(components, assets)
    const helper = {
      ...helperMock,
      downloadPackageAssetsByList: async (opts: any) => {
        const data = await helperMock.downloadPackageAssetsByList(opts, cwd)
        return data.map((item) => {
          if (item.status === 'fulfilled' && item.value.version === '1.1.0') {
            return {
              status: 'rejected' as PromiseRejectedResult['status'],
              reason: 'foo',
            }
          }
          return item
        })
      }
    }

    await performDownload(
      {
        name: 'name',
        cwd,
        repo: 'repo',
        npmBatch: {
          access: 'public'
        }
      },
      helper,
    )
    expect(errorSpy).toHaveBeenCalledWith('@qiwi-foo-bar/baz-bat@1.1.0: foo')
  })
})
