import { INexusHelper, TAsset, TComponent } from '@qiwi/nexus-helper'

import { defaultLimit } from '../../main/ts/utils'

export const components: any = Array.from(
  { length: 10 },
  (_, i) => ({
    repository: 'foo',
    group: 'bar',
    name: 'baz',
    id: i.toString(),
    version: `1.0.${i++}`
  })
)

export const assets: any = Array.from(
  { length: 5 },
  (_, i) => ({
    repository: 'foo',
    path: `@qiwi-foo-bar/baz-bat/-/baz-bat-1.${i}.0.tgz`,
    downloadUrl: `http://local/${i}`,
    name: 'baz',
    id: i.toString(),
    version: `1.${i}.0`,
  })
)

export const helperMockFactory = (
  components: TComponent[],
  assets: TAsset[],
  deleteMock: (ids: string[]) => any = () => { /* noop */ }
): INexusHelper => ({
  getPackageComponents() {
    return Promise.resolve({ items: components })
  },
  deleteComponentsByIds(ids: string[]) {
    return deleteMock(ids)
  },
  deleteComponentsByIdsSettled(ids: string[]) {
    return deleteMock(ids)
  },
  getPackageAssets() {
    return Promise.resolve({
      items: assets
    })
  },
  downloadPackageAsset() {
    return Promise.resolve()
  },
  downloadPackageAssets() {
    return Promise.resolve({
      items: [
        {
          status: 'fulfilled',
          value: {
            name: 'foo',
            version: '1.0.0',
            filePath: 'foo-1.0.0.tgz'
          }
        }
      ]
    })
  }
})

export const auth = {
  username: 'username',
  password: 'password',
}
export const url = 'localhost'
export const batch = {
  rateLimit: defaultLimit,
}
export const baseConfig = {
  url,
  batch,
  auth,
}
