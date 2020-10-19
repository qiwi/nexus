import { DeepProxy } from '@qiwi/deep-proxy'
import { ratelimit } from 'push-it-to-the-limit'
import { IControlled } from 'push-it-to-the-limit/target/es5/interface'

import { TRateLimitOpts } from '../helper'
import { convertRateLimitOpts } from './converters'

export const applyMemoization = <R>(
  fn: (...args: any[]) => R,
  getKey: (...args: Parameters<typeof fn>) => string
): (...args: Parameters<typeof fn>) => R => {
  const cache: Record<string, R> = {}
  return (...args: Parameters<typeof fn>): R => {
    const key = getKey(...args)
    if (!cache[key]) {
      cache[key] = fn(...args)
    }
    return cache[key]
  }
}

export const rateLimitFactory = applyMemoization<IControlled>(
  (value: (...args: any[]) => any, opts: TRateLimitOpts) => {
    return ratelimit(value, convertRateLimitOpts(opts))
  },
  (value: (...args: any[]) => any) => value.name
)

export const withRateLimit = <T>(instance: T, opts?: TRateLimitOpts, limitedMethods?: string[]): T => {
  if (!limitedMethods || !opts) {
    return instance
  }

  return new DeepProxy(
    instance,
    ({ path, proxy, trapName, key, value, PROXY, DEFAULT }) => {
      if (trapName === 'get') {
        if (typeof value === 'function' && limitedMethods.includes([...path, key].join('.'))) {
          return rateLimitFactory(value.bind(proxy), opts)
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
  )
}
