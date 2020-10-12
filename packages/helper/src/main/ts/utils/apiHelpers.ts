import { AxiosResponse } from 'axios'

import { TPaginatedResult } from '../interfaces'

export type TApiCaller = (token?: string) => Promise<AxiosResponse<TPaginatedResult>>

export const apiGetAll = async <T = any>(
  apiCaller: TApiCaller,
  res: any[] = [],
  token?: string
): Promise<T[]> => {
  try {
    const resp = await apiCaller(token)
    const { continuationToken, items } = resp.data
    if (!items) {
      return res
    }
    if (continuationToken) {
      return apiGetAll<T>(apiCaller, res.concat(items), continuationToken)
    }
    return res.concat(items)
  } catch (e) {
    console.error(`[apiGetAll]: ${e.message}`)
  }
  return res
}
