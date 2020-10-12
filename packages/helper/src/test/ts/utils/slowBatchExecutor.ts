import { slowBatchExecutor } from '../../../main/ts/utils'

const executor = (i: number) => Promise.resolve(i * 10)

describe('slowBatchExecutor', () => {
  it('calls executor with all params and collects results', async () => {
    const params = Array.from({ length: 10 }, (_, i) => ++i)
    const result = await slowBatchExecutor<number>({
      executor,
      params,
      step: 2,
      timeout: 0,
    })
    expect(result).toEqual(params.map((i) => i * 10))
  })
})
