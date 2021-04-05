import { callWithRetry } from '../../main/ts'

describe('callWithRetry', () => {
  it('calls target fn until it succeeds', async () => {
    let count = 0
    const fn = jest.fn(() => {
      if (count === 3) {
        return Promise.resolve(42)
      }
      count++
      return Promise.reject(new Error('foo'))
    })

    expect(await callWithRetry(fn, 5)).toEqual(42)
    expect(fn).toBeCalledTimes(4)
  })

  it('rejects when target fn fails more than given retryCount', async () => {
    const error = new Error('foo')
    const fn = jest.fn(() => Promise.reject(error))

    await expect(callWithRetry(fn, 5)).rejects.toEqual(error)
    expect(fn).toBeCalledTimes(6)
  })
})
