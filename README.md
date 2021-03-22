# @qiwi/nexus
[![Build Status](https://travis-ci.com/qiwi/nexus.svg?branch=master)](https://travis-ci.com/qiwi/nexus)
[![Maintainability](https://api.codeclimate.com/v1/badges/98447914169b865c87ff/maintainability)](https://codeclimate.com/github/qiwi/nexus/maintainability)

Monorepo of components for working with [Sonatype Nexus](https://www.sonatype.com/nexus/repository-pro)

## [@qiwi/nexus-client](https://github.com/qiwi/nexus/tree/master/packages/client)
Generated clients for working with Nexus APIs.
```typescript
import { ComponentsApi } from '@qiwi/nexus-client'

const options = {
  auth: {
    password: 'secretPassword',
    username: 'j.sins'
  }
}

const api = new ComponentsApi({
  basePath: 'your Nexus API URL',
  baseOptions: options
})

api
  .getComponentById('bnBtLWludGVybmFsOjFjNzg3YTAzZGI4MjA5ZWI2MDUyOTU1MjUwNWFlMmNh')
  .then(d => console.log(d.data))

```

## [@qiwi/nexus-helper](https://github.com/qiwi/nexus/tree/master/packages/helper)
Helper for getting and deleting package components.
```typescript
import { ComponentsApi, SearchApi } from '@qiwi/nexus-client'
import { NexusComponentsHelper } from '@qiwi/nexus-helper'

const basePath = 'http://localhost/service/rest'
const componentsApi = new ComponentsApi({ basePath })
const searchApi = new SearchApi({ basePath })
const helper = new NexusComponentsHelper(searchApi, componentsApi)
const data = await helper.getPackageComponents({
  repository: 'npm',
  group: 'qiwi',
  name: 'substrate'
})
await helper.deletePackagesByIds(['foo', 'bar', 'baz'])
```

## [@qiwi/nexus-cli](https://github.com/qiwi/nexus/tree/master/packages/cli)
CLI utility for getting, downloading and deleting package components.
```shell script
> @qiwi/nexus-cli --auth.username=foo --auth.password=bar --url=baz --data.repo=npm --data.name=react --data.group=null --data.range='>16.0.0' --action=delete

┌─────────┬─────────────┬───────┬─────────┬───────────┬────────────────────────────────────────────────────────────┐
│ (index) │ repository  │ group │  name   │  version  │                             id                             │
├─────────┼─────────────┼───────┼─────────┼───────────┼────────────────────────────────────────────────────────────┤
│    0    │ 'npm'       │ null  │ 'react' │ '16.2.0'  │ '12345678901234567890123456789012345678901234567890123456' │
│    1    │ 'npm'       │ null  │ 'react' │ '16.4.2'  │ '12345678901234567890123456789012345678901234567890123457' │
│    2    │ 'npm'       │ null  │ 'react' │ '16.8.3'  │ '12345678901234567890123456789012345678901234567890123458' |
│    3    │ 'npm'       │ null  │ 'react' │ '16.9.0'  │ '12345678901234567890123456789012345678901234567890123459' │
└─────────┴─────────────┴───────┴─────────┴───────────┴────────────────────────────────────────────────────────────┘
These components are going to be deleted. Proceed? (yes/no) yes
Done.
```
