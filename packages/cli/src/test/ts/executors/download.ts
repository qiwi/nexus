import rimraf from 'rimraf'

import { performDownload } from '../../../main/ts/executors/download'
import * as misc from '../../../main/ts/utils/misc'
import { assets, components, helperMockFactory } from '../utils'

const assetInfo = {
  name: 'foo',
  version: '1.0.0',
  filePath: 'foo-1.0.0.tgz'
}

const cwd = 'cwd'

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
    const logMock = jest.spyOn(console, 'log')
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

    expect(logMock).toHaveBeenCalledWith('Page #0 \'s been processed, 1 successful, 0 failed download(s), next token is undefined')
    expect(writeJsonMock).toHaveBeenNthCalledWith(
      1,
      [],
      "cwd/meta.json", // eslint-disable-line sonarjs/no-duplicate-string
    )
    expect(writeJsonMock).toHaveBeenNthCalledWith(
      2,
      [assetInfo],
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
        data: [
          {
            ...assetInfo,
            access: 'public',
          }
        ]
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
      downloadPackageAssets() {
        return Promise.resolve({
          items: [
            {
              status: 'fulfilled',
              value: assetInfo,
            },
            {
              status: 'rejected',
              reason: {
                message: 'foo',
              }
            }
          ]
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
      helper as any
    )
    expect(errorSpy).toHaveBeenCalledWith('1 asset(s) is(are) not downloaded due to errors:')
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })
})
