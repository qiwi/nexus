export const callWithRetry = async <T = any>(
  fn: () => Promise<T>,
  retryCount = 5
): Promise<T> => {
  return fn().catch(e => {
    if (retryCount === 0) {
      return Promise.reject(e)
    }
    return callWithRetry(fn, retryCount - 1)
  })
}
