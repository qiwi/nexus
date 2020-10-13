import readline from 'readline'

import { question } from '../../../main/ts/utils'

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
