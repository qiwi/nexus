import { defaultLimit as rateLimit, getConfig, resolveConfig } from '../../../main/ts/utils'
import * as misc from '../../../main/ts/utils/misc'

const nexus = {
  url: 'foo',
  username: 'bar',
  password: 'baz',
  rateLimit,
}

const packageOpts = {
  repo: 'bat',
  group: 'quz',
  name: 'qux',
  range: '>0.0.0',
}

describe('resolveConfig', () => {
  it('overrides config opts with cli opts', () => {
    expect(resolveConfig(
      {
        nexus,
        package: packageOpts,
        prompt: false,
      },
      {
        nexus: {
          url: 'foo2',
          password: 'baz',
        },
        package: {
          repo: 'bat',
          range: '>1.0.0',
        },
        prompt: true,
        config: '',
      },
    )).toEqual({
      nexus: {
        url: 'foo2',
        password: 'baz',
        username: 'bar',
        rateLimit,
      },
      package: {
        repo: 'bat',
        group: 'quz',
        name: 'qux',
        range: '>1.0.0',
      },
      prompt: true,
    })
  })

  it('stringifies null from cli opts', () => {
    expect(resolveConfig(
      {
        nexus,
        package: packageOpts
      },
      {
        package: {
          group: 'null'
        }
      }
    )).toEqual(
      {
        nexus,
        package: {
          ...packageOpts,
          group: null // eslint-disable-line unicorn/no-null
        }
      }
    )
  })
})

describe('getConfig', () => {
  it('returns the same config, when path is not given', () => {
    const opts = {
      nexus,
      package: packageOpts,
      prompt: false,
    }
    expect(getConfig(opts)).toEqual(opts)
  })

  it('reads config file', () => {
    const opts = {
      nexus: {
        url: 'foo',
        username: 'bar',
        password: 'baz',
      },
      package: packageOpts,
      prompt: false,
    }
    const cliPackageOpts = {
      repo: 'bat2',
      group: 'quz2',
      name: 'qux2',
      range: '>1.0.0',
    }
    jest.spyOn(misc, 'readFileToString')
      .mockImplementation(() => JSON.stringify(opts))
    expect(getConfig({
      package: cliPackageOpts,
      config: 'some/path'
    })).toEqual({ prompt: opts.prompt, nexus: { ...opts.nexus, rateLimit }, package: cliPackageOpts })
  })

  it('throws an error when config path is not given and package opts are absent', () => {
    expect(() => getConfig({
      nexus,
    })).toThrow()
  })

  it('throws an error when config path is not given and nexus opts are absent', () => {
    expect(() => getConfig({
      package: packageOpts,
    })).toThrow()
  })
})
