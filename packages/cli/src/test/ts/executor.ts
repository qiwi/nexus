import { INexusHelper, TComponent } from '@qiwi/nexus-helper'

import { execute } from '../../main/ts/executor'
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
  deleteMock: (ids: string[]) => void
): INexusHelper => ({
  getPackageComponents(): Promise<TComponent[]> {
    return Promise.resolve(components)
  },
  async deleteComponentsByIds(ids: string[]) {
    deleteMock(ids)
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

  it('asks for a permission and deletes components when it is allowed', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(components, deleteIdsMock)
    const questionSpy = jest.spyOn(misc, 'question')
      .mockImplementation(() => Promise.resolve('yes'))

    await execute(packageOpts, helperMock)

    expect(questionSpy).toHaveBeenCalledWith(
      expect.stringContaining(`foo bar baz 0 1.0.0\n\tfoo bar baz 1 1.0.1\n\tfoo bar baz 2 1.0.2`)
    )
    expect(deleteIdsMock).toHaveBeenCalledWith(['0', '1', '2'])
  })

  it('asks for a permission and does not delete components when it is not allowed', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(components, deleteIdsMock)
    const questionSpy = jest.spyOn(misc, 'question')
      .mockImplementation(() => Promise.resolve('no'))

    await execute(packageOpts, helperMock)

    expect(questionSpy).toHaveBeenCalledWith(
      expect.stringContaining(`foo bar baz 0 1.0.0\n\tfoo bar baz 1 1.0.1\n\tfoo bar baz 2 1.0.2`)
    )
    expect(deleteIdsMock).not.toHaveBeenCalled()
  })


  it('ignores components without id and version', async () => {
    const corruptedComponents = components.concat([
      {},
      { version: '0.9.9', id: '99' },
      { version: '0.9.8' },
      { id: '101' },
    ])
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(corruptedComponents, deleteIdsMock)
    await execute(packageOpts, helperMock, false)
    expect(deleteIdsMock).toHaveBeenCalledWith(['0', '1', '2', '99'])
  })

  it('does not ask for permission with --no-prompt option', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory(components, deleteIdsMock)

    await execute(packageOpts, helperMock, false)

    expect(deleteIdsMock).toHaveBeenCalledWith(['0', '1', '2'])
  })

  it('does not continue when components are not found', async () => {
    const deleteIdsMock = jest.fn()
    const helperMock = helperMockFactory([], deleteIdsMock)
    const questionSpy = jest.spyOn(misc, 'question')

    const logSpy = jest.spyOn(console, 'log')
      .mockImplementation(() => { /* noop */ })
    await execute(packageOpts, helperMock, false)
    expect(questionSpy).not.toHaveBeenCalled()
    expect(deleteIdsMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalled()
  })
})
