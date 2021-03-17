import { NexusComponentsHelper } from '@qiwi/nexus-helper'
import readline from 'readline'

import { helperFactory,question } from '../../../main/ts/utils'
import { baseConfig } from '../utils'

describe('question', () => {
  it('returns user\'s answer', async () => {
    jest.spyOn(readline, 'createInterface')
      .mockImplementation(() => ({
        question(_: string, answerCb: (answer: string) => void) {
          setTimeout(() => answerCb('foo'), 500)
        },
      } as readline.Interface))

    const answer = await question('bar')
    expect(answer).toEqual('foo')
  })
})

describe('helperFactory', () => {
  it ('return instance', () => {
    const helper = helperFactory({ ...baseConfig, action: 'delete', data: {} })
    expect(helper).toBeInstanceOf(NexusComponentsHelper)
  })
})
