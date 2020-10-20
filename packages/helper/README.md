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
You should create and pass `ContentsApi`, `SearchApi` instances from `@qiwi/nexus-client` to `NexusContentsHelper`'s constructor.
```typescript
import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { NexusComponentsHelper } from '@qiwi/nexus-helper'

const basePath = 'http://localhost/service/rest'
const componentsApi = new ComponentsApi({ basePath })
const searchApi = new SearchApi({ basePath })
const rateLimitOpts = {
  period: 1000,
  count: 2,
}
const helper = new NexusComponentsHelper(searchApi, componentsApi, rateLimitOpts)
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
[
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
                "path": "@qiwi/substrate/-/substrate-1.18.35.tgz",
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
                "path": "@qiwi/substrate/-/substrate-1.18.33.tgz",
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
]
*/
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
