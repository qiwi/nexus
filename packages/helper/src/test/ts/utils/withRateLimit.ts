import { createDeepProxy, TProxyHandler } from '@qiwi/deep-proxy'
import { Limiter } from 'push-it-to-the-limit'

import { deepProxyHandlerFactory } from '../../../main/ts/utils'

describe('deepProxyHandlerFactory', () => {
  const DEFAULT = Symbol('DEFAULT')
  const PROXY = createDeepProxy
  const delay = {
    count: 4,
    period: 100,
  }
  const limiter = new Limiter([delay])
  const handler: TProxyHandler = deepProxyHandlerFactory(['foo.bar.baz'], limiter)

  it('returns a function', () => {
    expect(handler).toBeInstanceOf(Function)
  })

  it('returns DEFAULT for set trap', () => {
    // @ts-ignore
    expect(handler({
      proxy: {},
      trapName: 'set',
      PROXY,
      DEFAULT,
      path: [],
      value: '',
    })).toEqual(DEFAULT)
  })

  it('returns PROXY for object, which match limited method path', () => {
    // @ts-ignore
    expect(handler({
      proxy: {},
      trapName: 'get',
      PROXY,
      DEFAULT,
      path: ['foo', 'bar'],
      value: {},
    })).toEqual(PROXY)
  })

  it('returns DEFAULT for object, which does not match limited method path', () => {
    // @ts-ignore
    expect(handler({
      proxy: {},
      trapName: 'get',
      PROXY,
      DEFAULT,
      path: ['foo', 'bat'],
      value: {},
    })).toEqual(DEFAULT)
  })
})
