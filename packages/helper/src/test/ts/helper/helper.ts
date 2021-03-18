import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import axios from 'axios'
import { existsSync,mkdirSync } from 'fs'
import nock from 'nock'
import { join } from 'path'
import * as PITTL from 'push-it-to-the-limit'
import rimraf from 'rimraf'

import { NexusComponentsHelper, TComponent } from '../../../main/ts'
import asset from './resources/asset.json'
import component from './resources/component.json'

describe('NexusContentsHelper', () => {
  const basePath = 'http://localhost/service/rest'
  const assetsBasePath = 'http://localhost'
  const assetsSearchUri = '/v1/search/assets'
  const componentsApi = new ComponentsApi({ basePath })
  const searchApi = new SearchApi({ basePath })
  const wrapperOpts = {
    period: 200,
    count: 4,
  }
  const helper = new NexusComponentsHelper(searchApi, componentsApi, axios, wrapperOpts)
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
    const helper = new NexusComponentsHelper(searchApi, componentsApi, axios)

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
        items
      })

    const page = await helper.getPackageComponents(params)
    expect(page).toEqual({ items, continuationToken })
    const nextPage = await helper.getPackageComponents(params, continuationToken)
    expect(nextPage).toEqual({ items })
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

  it('deleteComponentsByIds deletes components', async () => {
    const mocks = [
      nock(basePath).delete('/v1/components/foo')
        .reply(200),
      nock(basePath).delete('/v1/components/bar')
        .reply(200),
      nock(basePath).delete('/v1/components/baz')
        .reply(200),
    ]
    await helper.deleteComponentsByIds(['foo', 'bar', 'baz'])
    expect(mocks.every(mock => mock.isDone()))
  })

  it('deleteComponentsByIdsSettled continues deleting on errors', async () => {
    ids.forEach((id) => {
      if ((+id) % 4 === 0) {
        nock(basePath).delete(`/v1/components/${id}`)
          .replyWithError('Your circuit is dead, there is something wrong')
      } else {
        nock(basePath).delete(`/v1/components/${id}`)
          .reply(200)
      }
    })
    const data = await helper.deleteComponentsByIdsSettled(ids)
    expect(Array.isArray(data)).toEqual(true)
    expect(data.length).toEqual(ids.length)
    expect(data.filter((res: any) => res.status === 'fulfilled')).toHaveLength(9)
    expect(data.filter((res: any) => res.status === 'rejected')).toHaveLength(3)
  })

  it('gets assets', async () => {
    const params = {
      group: 'foo',
      repository: 'foo',
      name: 'baz',
    }
    const items = new Array(2).fill(asset)
    const continuationToken = 'foo'
    const mocks = [
      nock(basePath)
        .get(assetsSearchUri)
        .query(params)
        .once()
        .reply(200, { items, continuationToken }),
      nock(basePath)
        .get(assetsSearchUri)
        .query({ ...params, continuationToken })
        .once()
        .reply(200, { items } ),
    ]
    const firstCallResult = await helper.getPackageAssets(params)
    expect(firstCallResult.items).toEqual(items)
    const secondCallResult = await helper.getPackageAssets(params, firstCallResult.continuationToken)
    expect(secondCallResult.items).toEqual(items)
    expect(mocks.every(mock => mock.isDone())).toEqual(true)
  })

  it('downloads asset', async () => {
    const tempDirPath = 'temp-helper-test'
    mkdirSync(tempDirPath)

    const mock = nock(assetsBasePath)
      .get('/repository/npm/@types/react/-/react-16.9.41.tgz')
      .reply(200, 'foo')
    const data = await helper.downloadPackageAsset(asset.downloadUrl, asset.path, tempDirPath)
    expect(data).toEqual({
      name: '@types/react', // eslint-disable-line sonarjs/no-duplicate-string
      version: '16.9.41',
      filePath: join(tempDirPath, '@types%2Freact%2F-%2Freact-16.9.41.tgz')
    })
    expect(mock.isDone()).toEqual(true)
    expect(existsSync(data.filePath)).toEqual(true)

    rimraf.sync(tempDirPath)
  })

  describe('downloadPackageAssets', () => {
    const tempDirPath = 'temp-helper-test'

    beforeAll(() => rimraf.sync(tempDirPath))

    beforeEach(() => mkdirSync(tempDirPath))

    afterEach(() => rimraf.sync(tempDirPath))

    it ('returns empty items', async () => {
      const params = {
        group: 'foo',
        repository: 'foo',
        name: 'baz',
      }
      const mock = nock(basePath)
          .get(assetsSearchUri)
          .query(params)
          .once()
          .reply(200, {})
      const data = await helper.downloadPackageAssets(params, '')
      expect(data).toEqual({ items: []})
      expect(mock.isDone()).toEqual(true)
    })

    it('returns list of settled promises and creates files', async () => {
      const params = {
        group: 'types',
        repository: 'npm',
        name: 'react',
      }
      const name = '@types/react'
      const token = 'foo'
      const page1 = [
        { ...asset, downloadUrl: 'http://localhost/repository/npm/@types/react/-/react-15.9.41.tgz', path: '@types/react/-/react-15.9.41.tgz' },
        { ...asset, downloadUrl: 'http://localhost/repository/npm/@types/react/-/react-14.9.41.tgz', path: undefined }
      ]
      const page2 = [
        { ...asset, downloadUrl: undefined, path: '@types/react/-/react-13.9.41.tgz' },
        { ...asset, downloadUrl: 'http://localhost/repository/npm/@types/react/-/react-12.9.41.tgz', path: '@types/react/-/react-12.9.41.tgz' }
      ]
      // asset link mocks
      const downloadAssetsMock = [
        nock(assetsBasePath)
          .get('/repository/npm/@types/react/-/react-15.9.41.tgz')
          .once()
          .reply(200, 'foo'),
        nock(assetsBasePath)
          .get('/repository/npm/@types/react/-/react-12.9.41.tgz')
          .once()
          .reply(200, 'foo'),
      ]
      // package asset mockы
      const getAssetsMock = [
        nock(basePath)
          .get(assetsSearchUri)
          .query(params)
          .once()
          .reply(200, { items: page1, continuationToken: token }),
        nock(basePath)
          .get(assetsSearchUri)
          .query({ ...params, continuationToken: token })
          .once()
          .reply(200, { items: page2 } ),
      ]

      const page1Results = await helper.downloadPackageAssets(params, tempDirPath)
      const page1FulfilledResults = page1Results.items.filter(item => item.status === 'fulfilled')
        .map((item: any) => item.value)

      expect(page1FulfilledResults).toEqual([{
        name,
        version: '15.9.41',
        filePath: join(tempDirPath, '@types%2Freact%2F-%2Freact-15.9.41.tgz')
      }])
      expect(page1Results.items.filter(item => item.status === 'rejected').map((item: any) => item.reason.message)).toEqual([
        'downloadUrl or path is absent in Nexus API response'
      ])

      const page2Results = await helper.downloadPackageAssets(params, tempDirPath, page1Results.continuationToken)
      const page2FulfilledResults = page2Results.items.filter(item => item.status === 'fulfilled')
        .map((item: any) => item.value)

      expect(page2FulfilledResults).toEqual([{
        name,
        version: '12.9.41',
        filePath: join(tempDirPath, '@types%2Freact%2F-%2Freact-12.9.41.tgz')
      }])
      expect(page2Results.items.filter(item => item.status === 'rejected').map((item: any) => item.reason.message)).toEqual([
        'downloadUrl or path is absent in Nexus API response'
      ])

      page1FulfilledResults.filter(item => item.status === 'fulfilled').forEach((item: any) =>
        expect(existsSync(item.filePath)).toEqual(true))
      page2FulfilledResults.filter(item => item.status === 'fulfilled').forEach((item: any) =>
        expect(existsSync(item.filePath)).toEqual(true))
      expect(getAssetsMock.every(mock => mock.isDone()))
      expect(downloadAssetsMock.every(mock => mock.isDone()))
    })

    it('downloads assets with throttling', async () => {
      const params = {
        group: 'types',
        repository: 'npm',
        name: 'react',
      }
      const downloadMock = nock(assetsBasePath)
        .get('/repository/npm/@types/react/-/react-16.9.41.tgz')
        .times(10)
        .reply(200, 'foo')
      const getMock = nock(basePath)
        .get(assetsSearchUri)
        .query(params)
        .once()
        .reply(200, { items: new Array(10).fill(asset) })
      const helper = new NexusComponentsHelper(
        searchApi,
        componentsApi,
        axios,
        {
          period: 1000,
          count: 3
        }
      )

      const startTime = Date.now()
      await helper.downloadPackageAssets(params, tempDirPath)
      const endTime = Date.now() - startTime

      expect(downloadMock.isDone()).toEqual(true)
      expect(getMock.isDone()).toEqual(true)
      expect(endTime).toBeGreaterThan(3000)
    })
  })

  describe('extractNameAndVersionFromPath', () => {
    const testCases = [
      { filePath: '@qiwi/foo-bar-baz/-/foo-bar-baz-0.11.0.tgz', result: { name: '@qiwi/foo-bar-baz', version: '0.11.0' } },
      { filePath: 'foo-bar-baz/-/foo-bar-baz-0.70.0.tgz', result: { name: 'foo-bar-baz', version: '0.70.0' } },
      { filePath: '@types/react/-/react-16.9.41.tgz', result: { name: '@types/react', version: '16.9.41' } },
    ]

    testCases.forEach(({ filePath, result }) =>
      it(filePath, () => expect(NexusComponentsHelper.extractNameAndVersionFromPath(filePath)).toEqual(result))
    )
  })
})
