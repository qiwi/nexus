import { DeepProxy, TProxyHandler } from '@qiwi/deep-proxy'
import { IControlled, ratelimit } from 'push-it-to-the-limit'

import { TRateLimitOpts } from '../helper'
import { convertRateLimitOpts } from './converters'

export const applyMemoization = <R>(
  fn: (...args: any[]) => R,
  getKey: (...args: Parameters<typeof fn>) => any
): (...args: Parameters<typeof fn>) => R => {
  const cache = new WeakMap<typeof fn, R>()
  return (...args: Parameters<typeof fn>): R => {
    const key = getKey(...args)
    if (!cache.get(key)) {
      cache.set(key, fn(...args))
    }
    return cache.get(key) as R
  }
}

export const rateLimitFactory = applyMemoization(
  (value: (...args: any[]) => any, opts: TRateLimitOpts, context: any): IControlled => {
    return ratelimit(value, { delay: 0, limit: convertRateLimitOpts(opts), context })
  },
  (value: (...args: any[]) => any) => value
)

export const deepProxyHandlerFactory = (opts: TRateLimitOpts, limitedMethods: string[]): TProxyHandler =>
  ({ path, proxy, trapName, key, value, PROXY, DEFAULT }) => {
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

export const withRateLimit = <T>(instance: T, opts?: TRateLimitOpts, limitedMethods?: string[]): T => {
  if (!limitedMethods || !opts) {
    return instance
  }

  return new DeepProxy(
    instance,
    deepProxyHandlerFactory(opts, limitedMethods)
  )
}
