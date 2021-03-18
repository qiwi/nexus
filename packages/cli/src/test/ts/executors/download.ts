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
  afterEach(() => rimraf.sync(cwd))

  it('calls proper methods of helper and write meta to file', async () => {
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

    expect(logMock).toHaveBeenCalledWith('Assets page #0 has been processed, downloaded 1 asset(s)')
    expect(writeJsonMock).toHaveBeenCalledWith(
      [assetInfo],
      expect.stringMatching('^cwd/nexus-cli-downloads')
    )
  })

  it('prints npm batch config', async () => {
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
        data: [
          {
            ...assetInfo,
            access: 'public',
          }
        ]
      },
      expect.stringMatching('^cwd/nexus-cli-downloads')
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
