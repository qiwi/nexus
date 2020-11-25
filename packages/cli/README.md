# @qiwi/nexus-cli
CLI for managing Nexus NPM repository contents.
Deletes package components, which are not included in given opts
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
```shell script
nexus-cli --nexus.username=foo --nexus.password=bar --nexus.url=baz --package.repo=npm --package.name=bat --package.group=quz --package.range='<2.0.3'
```
### With config file:
```shell script
nexus-cli --config=some/path/config.json
```
### With config file and overriding
```shell script
nexus-cli --config=some/path/config.json --package.repo=npm --package.name=bat --package.group=quz --package.range='<2.0.3'
```
### Options
| Option                                      | Description                                      |
|---------------------------------------------|--------------------------------------------------|
| `nexus.username`, `nexus.password`          | Nexus API credentials                            |
| `nexus.url`                                 | Nexus API URL                                    |
| `nexus.rateLimit`                           | Components API `deleteComponent` method multiple call limit. If exists, limitation will be applied. See more at [push-it-to-the-limit](https://github.com/antongolub/push-it-to-the-limit). |
| `package.repo`                              | name of package repository                       |
| `package.name`                              | package name                                     |
| `package.group`                             | package group. To get packages outside of any group (scope) pass `null`                                    |
| `package.range`                             | package versions range to be deleted             |
| `config`                                    | path to config file                              |
| `no-prompt`                                 | disable destructive action confirmation (delete) |
| `proceedOnErrors`                           | continue deleting on errors                      |
All options except `--no-prompt` must be set through the CLI flags or `--config` JSON data.
Options from config file can be overridden.
If you want to use `--no-prompt` option in a config file, add it as `"prompt": false`.
### Config file
```json
{
    "nexus": {
        "username": "foo",
        "password": "bar",
        "url": "http://localhost",
        "rateLimit": {
            "period": 1000,
            "count": 10
        } 
    },
    "package": {
        "group": "qiwi",
        "name": "substrate",
        "range": ">1.2.0",
        "repo": "npm"
    }
}
```
