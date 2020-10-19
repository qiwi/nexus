import { IComplexDelay, ILimit, ILimitStack } from 'push-it-to-the-limit/target/es5/interface'

import { TRateLimitOpts } from '../helper'

const complexDelayToLimit = (delay: IComplexDelay): ILimit => ({
  ...delay,
  rest: delay.count,
  ttl: 0
})

export const convertRateLimitOpts = (opts: TRateLimitOpts): ILimit | ILimitStack => {
  if (Array.isArray(opts)) {
    return opts.map(complexDelayToLimit)
  }
  return complexDelayToLimit(opts)
}
