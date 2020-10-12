import { apiGetAll } from '../../../main/ts/utils'

describe('apiGetAll', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    })
  })

  it('invokes api caller several times until gets an error', async () => {
    let numberOfCalls = 5
    const func = jest.fn().mockImplementation(() => {
      const promise =
        numberOfCalls > 0
          ? Promise.resolve({
              data: {
                continuationToken: 'foo',
                items: [numberOfCalls],
              },
            })
          : Promise.reject(new Error('bar'))
      numberOfCalls--
      return promise
    })
    const res = await apiGetAll(func)
    expect(func).toHaveBeenCalledTimes(6)
    expect(res).toBeInstanceOf(Array)
    expect(res).toEqual([5, 4, 3, 2, 1])
  })

  it('invokes api caller several times until gets invalid token', async () => {
    let numberOfCalls = 5
    const func = jest.fn().mockImplementation(() => {
      const promise = Promise.resolve({
        data: {
          continuationToken: numberOfCalls > 0 && 'foo',
          items: [numberOfCalls],
        },
      })
      numberOfCalls--
      return promise
    })
    const res = await apiGetAll(func)
    expect(func).toHaveBeenCalledTimes(6)
    expect(res).toBeInstanceOf(Array)
    expect(res).toEqual([5, 4, 3, 2, 1, 0])
  })
})
