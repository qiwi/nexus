import { TProxyHandler } from '@qiwi/deep-proxy'
import { deepProxyHandlerFactory } from '../../../main/ts/utils'

describe('deepProxyHandlerFactory', () => {
  const DEFAULT = Symbol('DEFAULT')
  const PROXY = Symbol('PROXY')
  const delay = {
    count: 4,
    period: 100,
  }
  const handler: TProxyHandler = deepProxyHandlerFactory(delay, ['foo.bar.baz'])

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

  it('returns limited function and creates it only once', () => {
    const params = {
      proxy: {},
      trapName: 'get',
      PROXY,
      DEFAULT,
      path: ['foo', 'bar'],
      value: () => { /* noop */ },
      key: 'baz',
    }
    // @ts-ignore
    const func = handler(params)
    expect(func).toBeInstanceOf(Function)
    // @ts-ignore
    const func2 = handler(params)
    expect(func2).toEqual(func)
  })
})
