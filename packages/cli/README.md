# @qiwi/nexus-cli
CLI for managing Nexus NPM repository contents.
Deletes and downloads package components.
## Installation
You can use this utility without installation, see [Usage](#Usage)
```shell script
yarn add @qiwi/nexus-cli
```
or
```shell script
npm i @qiwi/nexus-cli
```
## Usage
You can call this utility without installing:
```shell script
npx @qiwi/nexus-cli <arguments>
```
### Delete
```shell script
nexus-cli --auth.username foo --auth.password bar --url baz --data.repo npm --data.name bat --data.group quz --data.range '<2.0.3' --action delete
```
### Download
For this action utility saves tarballs and prints metadata in given `cwd`
```shell script
nexus-cli --auth.username foo --auth.password bar --url baz --data.repo npm --data.name foo --data.group qiwi --data.range '<1.0.0' --data.cwd nexus-downloads --action download
```
Output in `nexus-downloads/nexus-cli-downloads-meta-2021-03-17T06:48:21.347Z.json`:
```json
[
	{
		"name": " @qiwi/foo",
		"version": "0.2.0",
		"filePath": "/Users/user/projects/platform/nexus/packages/cli/nexus-cli-downloads-2021-03-17T06:48:21.347Z/@qiwi%foo%2F-%foo-0.2.0.tgz"
	},
	{
		"name": " @qiwi/foo",
		"version": "0.6.0",
		"filePath": "/Users/user/projects/platform/nexus/packages/cli/nexus-cli-downloads-2021-03-17T06:48:21.347Z/@qiwi%foo%2F-%foo-0.6.0.tgz"
	}
]
```
### Compare
Utility will write list of missing packages and list of missing extra for primary registry in comparison with secondary one.

Output in `${cwd}/missing.json`
```json
[
  {
    "group": "null",
    "name": "buildstamp",
    "version": "1.0.2"
  },
  {
    "group": "null",
    "name": "buildstamp",
    "version": "1.2.2"
  },
  {
    "group": "null",
    "name": "buildstamp",
    "version": "1.3.0"
  }
]
```
Output in `${cwd}/missing.json`
```json
[
  {
    "group": "null",
    "name": "buildstamp",
    "version": "1.0.1",
  }
]
```
### With config file:
```shell script
nexus-cli --config some/path/config.json
```
### With config file and overriding
```shell script
nexus-cli --config some/path/config.json --data.repo npm --data.name bat --data.group quz --data.range '<2.0.3'
```
### Options
#### Common
| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `auth.username`, `auth.password`          | Nexus API credentials, optional if action is 'compare'                             |
| `url`                                 | Nexus API URL, optional if action is 'compare'                                    |
| `batch.rateLimit`                           | Components API `deleteComponent` method multiple call limit. If exists, limitation will be applied. See more at [push-it-to-the-limit](https://github.com/antongolub/push-it-to-the-limit). |
| `config`                                    | path to config file                              
| `action`                                    | one of `delete`, `download`                              |
By default `batch.rateLimit` is 3 requests per 1000 ms
### Delete

| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `data.no-prompt`                                 | disable destructive action confirmation (delete) |
| `data.repo`                              | name of package repository                       |
| `data.name`                              | package name                                     |
| `data.group`                             | package group. To get packages outside of any group (scope) pass `null`                                    |
| `data.range`                             | package versions range to be deleted             |
### Download

| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `data.cwd`                                 | cwd path for saving meta and tarballs, by default `process.cwd()` |
| `data.npmBatch.access`                      | make meta output as [@qiwi/npm-batch-cli](https://github.com/qiwi/npm-batch-action/tree/master/packages/cli) config with blank values & given access, one of `public`, `restricted` |
| `data.sortField`                      | one of `version`, `name`, `group`, `repository` |
| `data.sortDirection`                      | one of `asc`, `desc` |
| `data.repo`                              | name of package repository                       |
| `data.name`                              | package name                                     |
| `data.group`                             | package group. To get packages outside of any group (scope) pass `null`                                    |

### Compare

| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `data.packages[].name`                              | name of package to compare                       |
| `data.packages[].group`                              | group of package to compare. To get packages outside of any group (scope) pass `null`                       |
| `data.primaryRegistry.url`                      | url of primary repository to compare |
| `data.primaryRegistry.auth.username`, `data.primaryRegistry.auth.password`          | credentials of primary repository |
| `data.secondaryRegistry.url`                      | url of secondary repository to compare |
| `data.secondaryRegistry.auth.username`, `data.secondaryRegistry.auth.password`          | credentials of secondary repository |

All options except `--no-prompt` must be set through the CLI flags or `--config` JSON data.
Options from config file can be overridden.
If you want to use `--no-prompt` option in a config file, add it as `"prompt": false`.
### Config file
#### Delete
```json
{
    "url": "http://localhost",
    "auth": {
        "username": "foo",
        "password": "bar"
    },
    "action": "delete",
    "package": {
        "group": "qiwi",
        "name": "substrate",
        "range": ">1.2.0",
        "repo": "npm"
    }
}
```
#### Download
```json
{
    "url": "http://localhost",
    "auth": {
        "username": "foo",
        "password": "bar"
    },
    "action": "download",
    "package": {
        "group": "qiwi",
        "name": "substrate",
        "range": ">1.2.0",
        "repo": "npm",
        "cwd": "nexus-downloads",
        "npmBatch": {
            "access": "public"
        }
    }
}
```
#### Compare
```json
{
  "action": "compare",
  "data": {
    "cwd": "temp-compare",
    "primaryRegistry": {
      "url": "http://foo.qiwi.com:8081/repository/npm-foo",
      "auth": {
        "username": "username",
        "password": "password"
      }
    },
    "secondaryRegistry": {
      "url": "https://bar.qiwi.com/repository/npm-foo",
      "auth": {
        "username": "username",
        "password": "password"
      }
    },
    "packages": [
      {
        "name": "baz",
        "group": "qiwi-bar"
      },
      {
        "name": "foo-bar",
        "group": "qiwi"
      },
      {
        "name": "common",
        "group": "null"
      }
    ]
  }
}

```
