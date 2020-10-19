import { convertRateLimitOpts } from '../../../main/ts/utils'

describe('convertRateLimitOpts', () => {
  const delay = {
    count: 1,
    period: 100
  }
  const limit = {
    ...delay,
    ttl: 0,
    rest: delay.count
  }

  it('converts IComplexDelay to ILimit', () => {
    expect(convertRateLimitOpts(delay)).toEqual(limit)
  })

  it('converts IComplexDelay[] to ILimitStack', () => {
    expect(convertRateLimitOpts(new Array(2).fill(delay)))
      .toEqual(new Array(2).fill(limit))
  })
})
