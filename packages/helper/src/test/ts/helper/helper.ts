import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import nock from 'nock'
import * as PITTL from 'push-it-to-the-limit'

import { TComponent } from '../../../main/ts'
import { NexusComponentsHelper } from '../../../main/ts/helper'
import component from './resources/component.json'

describe('NexusContentsHelper', () => {
  const basePath = 'http://localhost/service/rest'
  const componentsApi = new ComponentsApi({ basePath })
  const searchApi = new SearchApi({ basePath })
  const wrapperOpts = {
    period: 200,
    count: 4,
  }
  const helper = new NexusComponentsHelper(searchApi, componentsApi, wrapperOpts)
  const ids: string[] = Array.from(
    { length: 12 },
    (_, i) => i.toString()
  )

  it('deletes components with throttling', async () => {
    const mocks = ids.map((id) =>
      nock(basePath).delete(`/v1/components/${id}`).reply(200),
    )
    const startTime = Date.now()
    await helper.deleteComponentsByIds(ids)
    const endTime = Date.now() - startTime

    expect(mocks.some((mock) => !mock.isDone())).toEqual(false)
    expect(endTime).toBeGreaterThanOrEqual(400)
  })

  it('deletes components without throttling', async () => {
    const rateLimitSpy = jest.spyOn(PITTL, 'ratelimit')
    const helper = new NexusComponentsHelper(searchApi, componentsApi)

    const mocks = ids.map((id) =>
      nock(basePath).delete(`/v1/components/${id}`).reply(200),
    )
    await helper.deleteComponentsByIds(ids)
    expect(mocks.some((mock) => !mock.isDone())).toEqual(false)
    expect(rateLimitSpy).not.toHaveBeenCalled()
  })

  it('returns package components', async () => {
    const searchUrl = '/v1/search'
    const items = new Array(2).fill(component)
    const continuationToken = 'foo'
    const params = {
      repository: 'foo',
      group: 'bar',
      name: 'baz',
    }
    nock(basePath).get(searchUrl).query(params).once().reply(200, {
      items,
      continuationToken,
    })
    nock(basePath)
      .get(searchUrl)
      .query({ ...params, continuationToken })
      .twice()
      .reply(200, {
        items,
        continuationToken,
      })
    nock(basePath)
      .get(searchUrl)
      .query({ ...params, continuationToken })
      .once()
      .reply(200, { items })
    const data = await helper.getPackageComponents(params)
    expect(data).toEqual([...items, ...items, ...items, ...items])
  })

  it('filters components by range without corrupted ones', () => {
    const components: TComponent[] = new Array(10)
      .fill(component)
      .map((item, i) => ({ ...item, id: i, version: `1.0.${i}` }))
    delete components[1].version
    delete components[3].id

    const filteredComponents = NexusComponentsHelper.filterComponentsByRange(components, '<1.0.5')
    expect(filteredComponents.map(item => item.id))
      .toEqual([0, 2, 4])
  })

  it('continues deleting on errors with skipErrors flag', async () => {
    ids.forEach((id) => {
      if ((+id) % 4 === 0) {
        nock(basePath).delete(`/v1/components/${id}`)
          .replyWithError('Your circuit is dead, there is something wrong')
      } else {
        nock(basePath).delete(`/v1/components/${id}`)
          .reply(200)
      }
    })
    const data = await helper.deleteComponentsByIds(ids, true)
    expect(Array.isArray(data)).toEqual(true)
    expect(data.length).toEqual(ids.length)
    expect(data.filter((res: any) => res.status === 'fulfilled')).toHaveLength(9)
    expect(data.filter((res: any) => res.status === 'rejected')).toHaveLength(3)
  })
})
