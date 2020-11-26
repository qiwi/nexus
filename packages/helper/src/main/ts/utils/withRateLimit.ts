import { DeepProxy, TProxyHandler } from '@qiwi/deep-proxy'
import { ILimiter, Limiter, ratelimit } from 'push-it-to-the-limit'

import { TRateLimitOpts } from '../helper'

export const deepProxyHandlerFactory = (limitedMethods: string[], limiter: ILimiter): TProxyHandler => {
  return ({ path, proxy, trapName, key, value, PROXY, DEFAULT }) => {
    if (trapName === 'get') {
      if (typeof value === 'function' && limitedMethods.includes([...path, key].join('.'))) {
        return ratelimit(value, { delay: 0, limiter, context: proxy })
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
  limitedMethods?: string[]
): T => {
  if (!limitedMethods || !opts) {
    return instance
  }

  const limiter = new Limiter(Array.isArray(opts) ? opts : [opts])

  return new DeepProxy(
    instance,
    deepProxyHandlerFactory(limitedMethods, limiter)
  )
}
