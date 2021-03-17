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
### Basic:
### Delete
```shell script
nexus-cli --auth.username foo --auth.password bar --url baz --data.repo npm --data.name bat --data.group quz --data.range '<2.0.3' --action delete
```
### Download
For this action utility saves tarballs and prints metadata in given `cwd`
```shell script
nexus-cli --auth.username foo --auth.password bar --url baz --data.repo npm --data.name foo --data.group qiwi --data.range --data.cwd nexus-downloads '<1.0.0' --action download
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
| `auth.username`, `auth.password`          | Nexus API credentials                            |
| `url`                                 | Nexus API URL                                    |
| `batch.rateLimit`                           | Components API `deleteComponent` method multiple call limit. If exists, limitation will be applied. See more at [push-it-to-the-limit](https://github.com/antongolub/push-it-to-the-limit). |
| `config`                                    | path to config file                              
| `action`                                    | one of `delete`, `download`                              |
| `data.repo`                              | name of package repository                       |
| `data.name`                              | package name                                     |
| `data.group`                             | package group. To get packages outside of any group (scope) pass `null`                                    |
| `data.range`                             | package versions range to be deleted             |
### Delete

| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `data.no-prompt`                                 | disable destructive action confirmation (delete) |
### Download

| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `data.cwd`                                 | cwd path for saving meta and tarballs, by default `process.cwd()` |
| `data.npmBatch.access`                      | make meta output as [@qiwi/npm-batch-cli](https://github.com/qiwi/npm-batch-action/tree/master/packages/cli) config with blank values & given access, one of `public`, `restricted` |

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
