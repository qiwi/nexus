import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import nock from 'nock'

import { NexusComponentsHelper } from '../../../main/ts/helper'
import component from './resources/component.json'

describe('NexusContentsHelper', () => {
  const basePath = 'http://localhost/service/rest'
  const componentsApi = new ComponentsApi({ basePath })
  const searchApi = new SearchApi({ basePath })
  const helper = new NexusComponentsHelper(searchApi, componentsApi)

  it('deletes components', async () => {
    const ids = ['1', '2', '3']
    const mocks = ids.map((id) =>
      nock(basePath).delete(`/v1/components/${id}`).reply(200),
    )

    await helper.deleteComponentsByIds(ids)

    expect(mocks.some((mock) => !mock.isDone())).toEqual(false)
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
})
