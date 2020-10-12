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
import { NexusContentsHelper } from '@qiwi/nexus-helper'

const basePath = 'http://localhost/service/rest'
const componentsApi = new ComponentsApi({ basePath })
const searchApi = new SearchApi({ basePath })
const helper = new NexusContentsHelper(searchApi, componentsApi)
```
#### Get package components
```typescript
const data = await helper.getPackageComponents({
  repository: 'npm',
  group: 'qiwi',
  name: 'substrate'
})
```

#### Delete components by their ids
```typescript
await helper.deletePackagesByIds(['foo', 'bar', 'baz'])
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
