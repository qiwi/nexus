import nock from 'nock'
import { join } from 'path'
import rimraf from 'rimraf'

import { performDownloadLatest } from '../../../main/ts/executors/download-latest'
import * as misc from '../../../main/ts/utils/misc'
import packumentA from '../../json/compare/packument-a.json'
import packumentB from '../../json/compare/packument-b.json'
import { assets, components, helperMockFactory } from '../utils'

const cwd = 'cwd-download-latest'
const registryUrl = 'http://localhostt'

describe('performDownloadLatest', function () {
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
    const packages = [
      {
        name: 'foo',
      },
      {
        name: 'bar',
        group: 'baz',
      }
    ]

    const mockFoo = nock(registryUrl)
      .get('/foo')
      .reply(200, packumentA)
    const mockBar = nock(registryUrl)
      .get('/@baz%2Fbar')
      .reply(200, packumentB)

    await performDownloadLatest(
      {
        cwd,
        repo: 'repo',
        registry: {
          url: registryUrl,
          auth: {
            username: 'username',
            password: 'password',
            email: 'username@mail.com'
          }
        },
        packages,
      },
      helper
    )

    expect(mockFoo.isDone()).toBe(true)
    expect(mockBar.isDone()).toBe(true)

    expect(writeJsonMock).toHaveBeenCalledWith(
      [
        {
          name: 'foo',
          version: '1.4.3',
          filePath: join(cwd, 'downloads', 'foo@1.4.3.tgz')
        },
        {
          name: '@baz/bar',
          version: '1.4.3',
          filePath: join(cwd, 'downloads', '@baz%2Fbar@1.4.3.tgz')
        }
      ],
      `${cwd}/meta.json`,
    )
  })
})
