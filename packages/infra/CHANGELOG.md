# @qiwi/nexus-infra [2.0.0](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.2.2...@qiwi/nexus-infra@2.0.0) (2021-03-17)


### Features

* add assets downloading, change helper & cli contract ([#21](https://github.com/qiwi/nexus/issues/21)) ([f087dc2](https://github.com/qiwi/nexus/commit/f087dc227a6c9e6c891d97d1bb872eab915d9cb8))


### BREAKING CHANGES

* `getPackageComponents` in `@qiwi/nexus-helper` does not follow pagination anymore, return type is changed
* deleteComponentsByIds in `@qiwi/nexus-helper` does not take `skipErrors` anymore, use `deleteComponentsByIds` for `skipErrors === false` and `deleteComponentsByIdsSettled` for `true`
* `@qiwi/nexus-cli` now supports downloading in addition to deleting, arguments and config changed a lot, see README

## @qiwi/nexus-infra [1.2.2](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.2.1...@qiwi/nexus-infra@1.2.2) (2021-03-15)


### Performance Improvements

* update deps ([#19](https://github.com/qiwi/nexus/issues/19)) ([aa9a347](https://github.com/qiwi/nexus/commit/aa9a347acc653bb9cae9d4efcc56269311cc3f3d))

## @qiwi/nexus-infra [1.2.1](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.2.0...@qiwi/nexus-infra@1.2.1) (2021-02-16)


### Performance Improvements

* update deps ([#18](https://github.com/qiwi/nexus/issues/18)) ([2f72745](https://github.com/qiwi/nexus/commit/2f72745036daf1e8b78a4273d3ce1562cb593f78))

# @qiwi/nexus-infra [1.2.0](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.1.0...@qiwi/nexus-infra@1.2.0) (2021-01-20)


### Features

* add buildstamp, update deps ([#17](https://github.com/qiwi/nexus/issues/17)) ([61585d0](https://github.com/qiwi/nexus/commit/61585d0d96c0fdec46014a3fb64adecc29065ac5))

# @qiwi/nexus-infra [1.1.0](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.0.4...@qiwi/nexus-infra@1.1.0) (2020-11-26)


### Features

* add skipErrors flag ([#16](https://github.com/qiwi/nexus/issues/16)) ([b5fab08](https://github.com/qiwi/nexus/commit/b5fab083004d7d43497f7a56d8be30467852d762))

## @qiwi/nexus-infra [1.0.4](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.0.3...@qiwi/nexus-infra@1.0.4) (2020-11-23)


### Performance Improvements

* fix docs script, fix ts version ([#14](https://github.com/qiwi/nexus/issues/14)) ([6f0b3b0](https://github.com/qiwi/nexus/commit/6f0b3b0cdbe543c8a42b428c8f3ae32fb609f3b2))

## @qiwi/nexus-infra [1.0.3](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.0.2...@qiwi/nexus-infra@1.0.3) (2020-10-30)


### Performance Improvements

* updated versions, changed output to table ([#11](https://github.com/qiwi/nexus/issues/11)) ([510ee37](https://github.com/qiwi/nexus/commit/510ee37cf449162841f773f55d11fa76118f8872))

## @qiwi/nexus-infra [1.0.2](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.0.1...@qiwi/nexus-infra@1.0.2) (2020-10-30)


### Bug Fixes

* made group optional, added filtering components without group ([#10](https://github.com/qiwi/nexus/issues/10)) ([8a2d1b2](https://github.com/qiwi/nexus/commit/8a2d1b2cbc6a7bccf0f678b51e10a9f3fa0fb567))

## @qiwi/nexus-infra [1.0.1](https://github.com/qiwi/nexus/compare/@qiwi/nexus-infra@1.0.0...@qiwi/nexus-infra@1.0.1) (2020-10-21)


### Performance Improvements

* migrate to deepProxy and rateLimit, small improvements  ([#9](https://github.com/qiwi/nexus/issues/9)) ([6774e1d](https://github.com/qiwi/nexus/commit/6774e1d244bb77bac7c7892563b70947cf6dc4d2))

# @qiwi/nexus-infra 1.0.0 (2020-10-13)


### Features

* **helper:** new package ([#4](https://github.com/qiwi/nexus/issues/4)) ([ec65ce2](https://github.com/qiwi/nexus/commit/ec65ce2f7e4ef065a8047997f3fea4fce236821b))
