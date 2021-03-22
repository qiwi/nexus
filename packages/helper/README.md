# @qiwi/nexus-helper
Helper for managing Nexus NPM repository contents
## Installation
```shell script
yarn add @qiwi/nexus-helper
```
or
```shell script
npm i @qiwi/nexus-helper
```
## Usage
You should create and pass `ContentsApi`, `SearchApi` from `@qiwi/nexus-client` and `AxiosInstance` from `axios` to `NexusContentsHelper`'s constructor.
```typescript
import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { NexusComponentsHelper } from '@qiwi/nexus-helper'
import axios from 'axios'

const basePath = 'http://localhost/service/rest'
const componentsApi = new ComponentsApi({ basePath })
const searchApi = new SearchApi({ basePath })
const rateLimitOpts = {
  period: 1000,
  count: 2,
}
const helper = new NexusComponentsHelper(searchApi, componentsApi, axios, rateLimitOpts)
```
`rateLimitOpts` is optional, it represents rate limit of `delete` method of Nexus Components API
#### Get package components
```typescript
const components = await helper.getPackageComponents({
  repository: 'npm',
  group: 'qiwi',
  name: 'substrate'
})
/*
{
    "items": [
        {
            "id": "12345678901234567890123456789012345678901234567890123456",
            "repository": "npm-proxy",
            "format": "npm",
            "group": "qiwi",
            "name": "substrate",
            "version": "1.18.35",
            "assets": [
                 {
                    "downloadUrl": "https://some.url/repository/npm/@qiwi/substrate/-/substrate-1.18.35.tgz",
                    "filePath": "@qiwi/substrate/-/substrate-1.18.35.tgz",
                    "id": "qwertyuiopasdfghjklzxcvbnmqwertyuioasdfghjklzxcvzxcvbnmb",
                    "repository": "npm-proxy",
                    "format": "npm",
                    "checksum": {
                        "sha1": "abcdef1234567890abcdef1234567890abcdef13"
                    }
                },
                ...
            ]
        },
        ...,
        {
            "id": "12345678901234567890123456789012345678901234567890123457",
            "repository": "npm-proxy",
            "format": "npm",
            "group": "qiwi",
            "name": "substrate",
            "version": "1.18.33",
            "assets": [
                {
                    "downloadUrl": "https://some.url/repository/npm/@qiwi/substrate/-/substrate-1.18.33.tgz",
                    "filePath": "@qiwi/substrate/-/substrate-1.18.33.tgz",
                    "id": "qwertyuiopasdfghjklzxcvbnmqwertyuioasdfghjklzxcvzxcvbnma",
                    "repository": "npm-proxy",
                    "format": "npm",
                    "checksum": {
                        "sha1": "abcdef1234567890abcdef1234567890abcdef12"
                    }
                },
                ...
            ]
        }
    ],
    "continuationToken": "token"
}
*/
```
`continuationToken` is used for pagination, pass it as the second argument to get more components:
```javascript
const { items, continuationToken } = await helper.getPackageComponents({
  repository: 'npm',
  group: 'qiwi',
  name: 'substrate'
})
const components = [...items]
let token = continuationToken
while (token) {
  const data = await helper.getPackageComponents(
    {
        repository: 'npm',
        group: 'qiwi',
        name: 'substrate'
    },
    token
  )
  components.push(...data.items)
  token = data.continuationToken
}
```
#### Delete components by their ids
Nexus identifies components by their ids, see [Nexus Components API docs](https://help.sonatype.com/repomanager3/rest-and-integration-api/components-api)
```typescript
const componentsToBeDeleted = NexusComponentsHelper.filterComponentsByRange(
    components,
    '>1.0.0'
)
await helper.deletePackagesByIds(componentsToBeDeleted.map(item => item.id))
```
If error occurs, deleting will be stopped. If you want to delete all components despite on errors, use `deletePackagesByIdsSettled`.
```typescript
await helper.deletePackagesByIdsSettled(componentsToBeDeleted.map(item => item.id))
```
#### Get package assets info
This method uses the same pagination as `getPackageComponents`
```typescript
const { items, continuationToken } = await helper.getPackageAssets({
  repository: 'npm',
  group: 'qiwi',
  name: 'substrate'
})
/*
{
    "items": [
        {
            "downloadUrl": "https://some.url.com/repository/npm/@qiwi/substrate/-/substrate-0.11.0.tgz",
            "filePath": "@qiwi/substrate/-/substrate-0.11.0.tgz",
            "id": "asdfghjklqwertyuiozxcvbnmasdfghjklqwertyuiozxcvbnmasdfghjasd",
            "repository": "npm",
            "format": "npm",
            "checksum": {
                "sha1": "1234567890123456789012345678901234567890"
            }
        },
        ...
     ],
     "continuationToken": "token"
 */
```
#### Download package asset
Saves the asset to the path specified as the third argument
```javascript
const data = await helper.downloadPackageAsset(
  'https://some.url.com/repository/npm/@qiwi/substrate/-/substrate-0.11.0.tgz',
  '@qiwi/substrate/-/substrate-0.11.0.tgz',
  'pathToSaveTarball'
)
/*
{
  name: '@qiwi/substrate',
  version: '0.11.0',
  filePath: 'pathToSaveTarball/@qiwi%2Fsubstrate%2F-%2Fsubstrate-0.11.0.tgz'
}
 */
```
#### Download package assets
The same as a `getPackageAssets`, but with saving tarballs to given path
```javascript
const data = await helper.downloadPackageAssets(
  {
    repository: 'npm',
    group: 'qiwi', // optional
    name: 'substrate', // optional
    range: '<1.0.0' // optional
  },
  'pathToSaveTarball'
)
/*
{
  "items": [
    {
        "status": "fulfilled",
        "value": {
            "name": "@qiwi/substrate",
            "version": "0.11.0",
            "filePath": "pathToSaveTarball/@qiwi%2Fsubstrate%2F-%2Fsubstrate-0.11.0.tgz"
        }
    },
    {
        "status": "fulfilled",
        "value": {
            "name": "@qiwi/substrate",
            "version": "0.12.0",
            "filePath": "pathToSaveTarball/@qiwi%2Fsubstrate%2F-%2Fsubstrate-0.12.0.tgz"
        }
    },
    {
        "status": "rejected",
        "reason": {
            "message": "Not Found",
        }
    },
    ...
  ],
  "continuationToken": "token"
}
 */
```
Tarballs are saved to `value.path`
