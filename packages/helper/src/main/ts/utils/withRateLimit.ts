import { DeepProxy, TProxyHandler } from '@qiwi/deep-proxy'
import factory from '@qiwi/primitive-storage'
import { IControlled, ratelimit } from 'push-it-to-the-limit'

import { TRateLimitOpts } from '../helper'
import { convertRateLimitOpts } from './converters'

export const applyMemoization = <R>(
  fn: (...args: any[]) => R,
  getKey: (...args: Parameters<typeof fn>) => any,
  storageTtl?: number
): (...args: Parameters<typeof fn>) => R => {
  const storage = factory({ defaultTtl: storageTtl || 60000 })
  return (...args: Parameters<typeof fn>): R => {
    const key = getKey(...args)
    if (!storage.get(key)) {
      storage.set(key, fn(...args))
    }
    return storage.get(key) as R
  }
}


export const deepProxyHandlerFactory = (opts: TRateLimitOpts, limitedMethods: string[], storageTtl?: number): TProxyHandler => {
  const rateLimitFactory = applyMemoization(
    (value: (...args: any[]) => any, opts: TRateLimitOpts, context: any): IControlled => {
      return ratelimit(value, { delay: 0, limit: convertRateLimitOpts(opts), context })
    },
    (value: (...args: any[]) => any) => value,
    storageTtl
  )

  return ({ path, proxy, trapName, key, value, PROXY, DEFAULT }) => {
    if (trapName === 'get') {
      if (typeof value === 'function' && limitedMethods.includes([...path, key].join('.'))) {
        return rateLimitFactory(value, opts, proxy)
      }
      if (
        typeof value === 'object' &&
        value !== null &&
        limitedMethods.find(limit => limit.startsWith(path.join('.')))
      ) {
        return PROXY
      }
    }
    return DEFAULT
  }

}

export const withRateLimit = <T>(
  instance: T,
  opts?: TRateLimitOpts,
  limitedMethods?: string[],
  storageTtl?: number
): T => {
  if (!limitedMethods || !opts) {
    return instance
  }

  return new DeepProxy(
    instance,
    deepProxyHandlerFactory(opts, limitedMethods, storageTtl)
  )
}
