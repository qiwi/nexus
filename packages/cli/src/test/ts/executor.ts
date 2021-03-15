import { INexusHelper, TAsset, TComponent } from '@qiwi/nexus-helper'

import { execute, processDeletionResults } from '../../main/ts'
import * as misc from '../../main/ts/utils/misc'

const packageOpts = {
  repo: 'foo',
  group: 'bar',
  name: 'baz',
  range: '<1.0.3'
}

beforeEach(() => jest.resetAllMocks())

const helperMockFactory = (
  components: TComponent[],
  assets: TAsset[],
  deleteMock: (ids: string[]) => any
): INexusHelper => ({
  getPackageComponents() {
    return Promise.resolve({ items: components })
  },
  deleteComponentsByIds(ids: string[]) {
    return deleteMock(ids)
  },
  deleteComponentsByIdsSettled(ids: string[]) {
    return deleteMock(ids)
  },
  getPackageAssets() {
    return Promise.resolve({
      items: assets
    })
  }
})

describe('execute', () => {
  const components: any = Array.from(
    { length: 10 },
    (_, i) => ({
      repository: 'foo',
      group: 'bar',
      name: 'baz',
      id: i.toString(),
      version: `1.0.${i++}`
    })
  )
  const assets: any = Array.from(
    { length: 5 },
    (_, i) => ({
      repository: 'foo',
      downloadUrl: `http://local/${i}`,
      name: 'baz',
      id: i.toString(),
      version: `1.0.${i++}`
    })
  )

  it('asks for a permission and deletes components when it is allowed', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(components, assets, deleteIdsMock)
    const questionSpy = jest.spyOn(misc, 'question')
      .mockImplementation(() => Promise.resolve('yes'))

    await execute(packageOpts, helperMock)

    expect(questionSpy).toHaveBeenCalled()
    expect(deleteIdsMock).toHaveBeenCalledWith(['0', '1', '2'])
  })

  it('asks for a permission and does not delete components when it is not allowed', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(components, assets, deleteIdsMock)
    const questionSpy = jest.spyOn(misc, 'question')
      .mockImplementation(() => Promise.resolve('no'))

    await execute(packageOpts, helperMock)

    expect(questionSpy).toHaveBeenCalled()
    expect(deleteIdsMock).not.toHaveBeenCalled()
  })


  it('ignores components without id and version', async () => {
    const corruptedComponents = [
      ...components,
      {},
      { version: '0.9.9', id: '99' },
      { version: '0.9.8' },
      { id: '101' },
    ]
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(corruptedComponents, assets, deleteIdsMock)
    await execute(packageOpts, helperMock, false)
    expect(deleteIdsMock).toHaveBeenCalledWith(['0', '1', '2', '99'])
  })

  it('does not ask for permission with --no-prompt option', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(components, assets, deleteIdsMock)

    await execute(packageOpts, helperMock, false)

    expect(deleteIdsMock).toHaveBeenCalledWith(['0', '1', '2'])
  })

  it('does not continue when components are not found', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory([], assets, deleteIdsMock)
    const questionSpy = jest.spyOn(misc, 'question')

    const logSpy = jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    await execute(packageOpts, helperMock, false)
    expect(questionSpy).not.toHaveBeenCalled()
    expect(deleteIdsMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalled()
  })
})

describe('processDeletionResults', () => {
  it('prints "Done" only when at least 1 deletion was successful', () => {
    const logSpy = jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    const responses = [
      { status: 'rejected', reason: 'foo' },
      { status: 'rejected', reason: 'bar' },
      { status: 'fulfilled', value: 'baz' },
    ]
    const ids = ['1', '2', '3']
    processDeletionResults(responses, ids)
    expect(logSpy).toHaveBeenCalledWith('Done.')
  })

  it('does not print "Done" when all deletions were failed and ', () => {
    const logSpy = jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    const responses = [
      { status: 'rejected', reason: new Error('foo') },
      { status: 'rejected', reason: 'bar' },
      { status: 'rejected', value: 'baz' },
    ]
    const ids = ['1', '2', '3']
    processDeletionResults(responses, ids)
    expect(logSpy).not.toHaveBeenCalledWith('Done.')
  })
})
