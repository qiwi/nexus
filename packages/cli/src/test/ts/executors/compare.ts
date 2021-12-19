import nock from 'nock'

import { performCompare } from '../../../main/ts/executors/compare'
import * as misc from '../../../main/ts/utils/misc'
import packumentA from '../../json/compare/packument-a.json'
import packumentB from '../../json/compare/packument-b.json'

const cwd = 'cwd'

describe('performCompare', () => {
  it('works correctly', async () => {
    const writeJsonMock = jest.spyOn(misc, 'writeJson')
      .mockImplementation(() => { /* noop */
      })
    jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */
      })

    const mockA = nock('http://localhost:4242')
      .get('/repository/foo/buildstamp')
      .reply(200, packumentA)

    const mockB = nock('http://localhost:4243')
      .get('/repository/foo/buildstamp')
      .reply(200, packumentB)


    await performCompare(
      {
        cwd,
        primaryRegistry: {
          url: 'http://localhost:4242/repository/foo',
          auth: {
            username: 'foo',
            password: 'foo',
          },
        },
        secondaryRegistry: {
          url: 'http://localhost:4243/repository/foo',
          auth: {
            username: 'baz',
            password: 'baz',
          },
        },
        packages: [
          {
            name: 'buildstamp',
            group: 'null',
          }
        ]
      },
    )

    expect(mockA.isDone()).toEqual(true)
    expect(mockB.isDone()).toEqual(true)

    expect(writeJsonMock).toHaveBeenNthCalledWith(
      1,
      [
        {
          group: 'null',
          name: 'buildstamp',
          version: '1.0.1',
        },
      ],
      'cwd/missing.json'
    )
    expect(writeJsonMock).toHaveBeenNthCalledWith(
      2,
      [
        {
          group: 'null',
          name: 'buildstamp',
          version: '1.0.2',
        },
        {
          group: 'null',
          name: 'buildstamp',
          version: '1.2.2',
        },
        {
          group: 'null',
          name: 'buildstamp',
          version: '1.3.0',
        },
      ],
      'cwd/extra.json'
    )
  })
})
