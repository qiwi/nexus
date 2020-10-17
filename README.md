# @qiwi/nexus
Monorepo of components for working with Nexus

## @qiwi/nexus-client
Generated clients for working with Nexus APIs.

### Usage

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

## @qiwi/nexus-helper
Helper for getting and deleting package components.
#### Usage
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

# @qiwi/nexus-cli
CLI utility for getting and deleting package components.
## Usage
```shell script
@qiwi/nexus-cli --nexus.username=foo --nexus.password=bar --nexus.url=baz --package.repo=npm --package.name=bat --package.group=quz --package.range='<2.0.3'
```
