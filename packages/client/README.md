# @qiwi/nexus-client

Nexus TS client, created by Open API generator

# Installation

```shell script
yarn add @qiwi/nexus-client
```
or
```shell script
npm i @qiwi/nexus-client
```

# Usage

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
