export const callWithRetry = async <T = any>(
  fn: () => Promise<T>,
  retryCount = 5,
): Promise<T> => {
  return fn().catch(e => {
    console.error(`GOT ERROR: ${e}, retryCount ${retryCount}`)
    if (retryCount === 0) {
      return Promise.reject(e)
    }
    return callWithRetry(fn, retryCount - 1)
  })
}
