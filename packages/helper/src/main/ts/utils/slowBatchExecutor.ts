export type TSlowBatchExecutorOpts<T> = {
  executor: (...args: any[]) => Promise<any>
  params: any[]
  start?: number
  step?: number
  timeout?: number
  result?: T[]
  endFlag?: boolean
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const slowBatchExecutor = async <T = any>({
  executor,
  params,
  start = 0,
  step = 25,
  timeout = 1000,
  result = [],
  endFlag = false,
}: TSlowBatchExecutorOpts<T>): Promise<T[]> => {
  if (endFlag) {
    return result
  }

  const data = await Promise.all(
    params.slice(start, step + start).map((data) => executor(data)),
  )

  await sleep(timeout)

  return slowBatchExecutor({
    executor,
    params,
    start: start + step,
    step,
    timeout,
    result: result.concat(data),
    endFlag: start > params.length,
  })
}
