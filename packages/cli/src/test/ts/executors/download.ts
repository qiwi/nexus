import { join } from 'path'
import rimraf from 'rimraf'

import { performDownload } from '../../../main/ts/executors/download'
import * as misc from '../../../main/ts/utils/misc'
import { assets, components, helperMockFactory } from '../utils'

const cwd = 'cwd'

const assetInfos = Array.from({ length: assets.length }, (_, i) => ({
  access: 'public',
  filePath: join(cwd, 'downloads', `@qiwi-foo-bar%2Fbaz-bat@1.${i}.0`),
  name: '@qiwi-foo-bar/baz-bat',
  version: `1.${i}.0`,
}))

describe('performDownload', () => {
  afterEach(() => {
    rimraf.sync(cwd)
    jest.clearAllMocks()
  })

  it('calls proper methods of helper and write meta to file', async () => {
    const readJsonMock = jest.spyOn(misc, 'readFileToString')
      .mockImplementation(() => '[]')
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

    expect(writeJsonMock).toHaveBeenNthCalledWith(
      1,
      [],
      "cwd/meta.json", // eslint-disable-line sonarjs/no-duplicate-string
    )
    expect(writeJsonMock).toHaveBeenNthCalledWith(
      2,
      assetInfos.map(item => ({ ...item, access: undefined })),
      "cwd/meta.json",
    )
    expect(readJsonMock).toHaveBeenCalled()
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
    expect(writeJsonMock).toHaveBeenNthCalledWith(
      1,
      {
        registryUrl: '',
        auth: {
          username: '',
          password: '',
          email: '',
        },
        action: 'publish',
        data: [],
      },
      'cwd/meta.json'
    )
    expect(writeJsonMock).toHaveBeenNthCalledWith(
      2,
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
    const helper = {
      ...helperMockFactory(components, assets),
      downloadPackageAsset: jest.fn()
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.reject(new Error('foo')))
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.resolve())
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
      helper as any
    )
    expect(errorSpy).toHaveBeenCalledWith('@qiwi-foo-bar/baz-bat@1.1.0 Error: foo')
  })
})
