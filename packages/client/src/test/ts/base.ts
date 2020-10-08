import { BaseAPI } from '../../main/ts/base'

describe('exported entities are defined', () => {
  it('BaseAPI is defined', () => {
    expect(BaseAPI).toBeDefined()
    expect(typeof BaseAPI).toEqual('function')
  })
})
