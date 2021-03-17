# @qiwi/nexus-helper [2.0.0](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.2.2...@qiwi/nexus-helper@2.0.0) (2021-03-17)


### Features

* add assets downloading, change helper & cli contract ([#21](https://github.com/qiwi/nexus/issues/21)) ([f087dc2](https://github.com/qiwi/nexus/commit/f087dc227a6c9e6c891d97d1bb872eab915d9cb8))


### BREAKING CHANGES

* `getPackageComponents` in `@qiwi/nexus-helper` does not follow pagination anymore, return type is changed
* deleteComponentsByIds in `@qiwi/nexus-helper` does not take `skipErrors` anymore, use `deleteComponentsByIds` for `skipErrors === false` and `deleteComponentsByIdsSettled` for `true`
* `@qiwi/nexus-cli` now supports downloading in addition to deleting, arguments and config changed a lot, see README





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.1.3
* **@qiwi/nexus-infra:** upgraded to 2.0.0

## @qiwi/nexus-helper [1.2.2](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.2.1...@qiwi/nexus-helper@1.2.2) (2021-03-15)


### Performance Improvements

* update deps ([#19](https://github.com/qiwi/nexus/issues/19)) ([aa9a347](https://github.com/qiwi/nexus/commit/aa9a347acc653bb9cae9d4efcc56269311cc3f3d))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.1.2
* **@qiwi/nexus-infra:** upgraded to 1.2.2

## @qiwi/nexus-helper [1.2.1](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.2.0...@qiwi/nexus-helper@1.2.1) (2021-02-16)


### Performance Improvements

* update deps ([#18](https://github.com/qiwi/nexus/issues/18)) ([2f72745](https://github.com/qiwi/nexus/commit/2f72745036daf1e8b78a4273d3ce1562cb593f78))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.1.1
* **@qiwi/nexus-infra:** upgraded to 1.2.1

# @qiwi/nexus-helper [1.2.0](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.1.0...@qiwi/nexus-helper@1.2.0) (2021-01-20)


### Features

* add buildstamp, update deps ([#17](https://github.com/qiwi/nexus/issues/17)) ([61585d0](https://github.com/qiwi/nexus/commit/61585d0d96c0fdec46014a3fb64adecc29065ac5))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.1.0
* **@qiwi/nexus-infra:** upgraded to 1.2.0

# @qiwi/nexus-helper [1.1.0](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.7...@qiwi/nexus-helper@1.1.0) (2020-11-26)


### Features

* add skipErrors flag ([#16](https://github.com/qiwi/nexus/issues/16)) ([b5fab08](https://github.com/qiwi/nexus/commit/b5fab083004d7d43497f7a56d8be30467852d762))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.8
* **@qiwi/nexus-infra:** upgraded to 1.1.0

## @qiwi/nexus-helper [1.0.7](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.6...@qiwi/nexus-helper@1.0.7) (2020-11-25)


### Bug Fixes

* null group parsing, remove redundant packages ([#15](https://github.com/qiwi/nexus/issues/15)) ([cbbf257](https://github.com/qiwi/nexus/commit/cbbf257aede87ff91457f34ecca87fc8fb1059a3)), closes [#12](https://github.com/qiwi/nexus/issues/12)





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.7

## @qiwi/nexus-helper [1.0.6](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.5...@qiwi/nexus-helper@1.0.6) (2020-11-23)


### Performance Improvements

* fix docs script, fix ts version ([#14](https://github.com/qiwi/nexus/issues/14)) ([6f0b3b0](https://github.com/qiwi/nexus/commit/6f0b3b0cdbe543c8a42b428c8f3ae32fb609f3b2))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.6
* **@qiwi/nexus-infra:** upgraded to 1.0.4

## @qiwi/nexus-helper [1.0.5](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.4...@qiwi/nexus-helper@1.0.5) (2020-10-30)





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.5
* **@qiwi/nexus-infra:** upgraded to 1.0.3

## @qiwi/nexus-helper [1.0.4](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.3...@qiwi/nexus-helper@1.0.4) (2020-10-30)


### Bug Fixes

* made group optional, added filtering components without group ([#10](https://github.com/qiwi/nexus/issues/10)) ([8a2d1b2](https://github.com/qiwi/nexus/commit/8a2d1b2cbc6a7bccf0f678b51e10a9f3fa0fb567))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.4
* **@qiwi/nexus-infra:** upgraded to 1.0.2

## @qiwi/nexus-helper [1.0.3](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.2...@qiwi/nexus-helper@1.0.3) (2020-10-21)


### Performance Improvements

* migrate to deepProxy and rateLimit, small improvements  ([#9](https://github.com/qiwi/nexus/issues/9)) ([6774e1d](https://github.com/qiwi/nexus/commit/6774e1d244bb77bac7c7892563b70947cf6dc4d2))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.3
* **@qiwi/nexus-infra:** upgraded to 1.0.1

## @qiwi/nexus-helper [1.0.2](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.1...@qiwi/nexus-helper@1.0.2) (2020-10-15)


### Bug Fixes

* publish configs ([#8](https://github.com/qiwi/nexus/issues/8)) ([1ce2747](https://github.com/qiwi/nexus/commit/1ce2747a51db5cde04a1e0934c6beece040454bb))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.2

## @qiwi/nexus-helper [1.0.1](https://github.com/qiwi/nexus/compare/@qiwi/nexus-helper@1.0.0...@qiwi/nexus-helper@1.0.1) (2020-10-13)





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.1

# @qiwi/nexus-helper 1.0.0 (2020-10-13)


### Features

* **cli:** introduce new package ([#5](https://github.com/qiwi/nexus/issues/5)) ([b8c95b5](https://github.com/qiwi/nexus/commit/b8c95b54e3c0fd198a0bf35ea643ecccd2d7af5e))
* **helper:** new package ([#4](https://github.com/qiwi/nexus/issues/4)) ([ec65ce2](https://github.com/qiwi/nexus/commit/ec65ce2f7e4ef065a8047997f3fea4fce236821b))





### Dependencies

* **@qiwi/nexus-client:** upgraded to 1.0.0
* **@qiwi/nexus-infra:** upgraded to 1.0.0
