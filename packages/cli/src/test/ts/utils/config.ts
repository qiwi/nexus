import { IBaseConfig, TDeleteConfig, TDownloadConfig } from '../../../main/ts'
import {
  DeepPartial,
  getConfig,
  resolveConfig,
  resolveDeleteConfig,
  resolveDownloadConfig,
} from '../../../main/ts/utils'
import * as misc from '../../../main/ts/utils/misc'
import { baseConfig, batch } from '../utils'

describe('resolveConfig', () => {
  const testCases: Array<{
    configA: DeepPartial<IBaseConfig>,
    configB: DeepPartial<IBaseConfig>,
    description: string,
    output: DeepPartial<IBaseConfig>
  }> = [
    {
      description: 'second config has higher priority',
      configA: {
        url: 'localhost',
        action: 'download',
        data: {}
      },
      configB: {
        url: 'localhost:3001',
        auth: {
          username: 'usernameB',
          password: 'password',
        }
      },
      output: {
        url: 'localhost:3001',
        action: 'download',
        auth: {
          username: 'usernameB',
          password: 'password',
        },
        batch,
        data: {}
      }
    },
    {
      description: 'it merges nested fields too',
      configA: {
        url: 'localhost',
        action: 'delete',
        auth: {
          username: 'username',
        }
      },
      configB: {
        url: 'localhost',
        auth: {
          password: 'password'
        }
      },
      output: {
        url: 'localhost',
        action: 'delete',
        auth: {
          username: 'username',
          password: 'password',
        },
        batch,
        data: {},
      }
    }
  ]

  testCases.forEach(
    ({ configA, configB, description, output }) => test(description, () => expect(resolveConfig(configA, configB)).toEqual(output))
  )
})

describe('resolveDownloadConfig', (() => {
  const testCases: Array<{
    description: string,
    config: TDownloadConfig,
    output: TDownloadConfig
  }> = [
    {
      description: 'it adds procces.cwd when cwd is absent',
      config: {
        ...baseConfig,
        action: 'download',
        data: {
          name: 'name',
          repo: 'npm',
        }
      },
      output: {
        ...baseConfig,
        action: 'download',
        data: {
          name: 'name',
          repo: 'npm',
          cwd: process.cwd()
        }
      }
    },
    {
      description: 'it replaces stringified null to null',
      config: {
        ...baseConfig,
        action: 'download',
        data: {
          name: 'name',
          repo: 'npm',
          cwd: 'cwd',
          group: 'null',
        }
      },
      output: {
        ...baseConfig,
        action: 'download',
        data: {
          name: 'name',
          repo: 'npm',
          cwd: 'cwd',
          group: null as any, // eslint-disable-line unicorn/no-null
        }
      }
    },
  ]

  testCases.forEach(
    ({ config, description, output }) => test(description, () => expect(resolveDownloadConfig(config)).toEqual(output))
  )
}))

describe('resolveDeleteConfig', () => {
  const testCases: Array<{
    description: string,
    config: TDeleteConfig,
    output: TDeleteConfig
  }> = [
    {
      description: 'it replaces stringified null to null',
      config: {
        ...baseConfig,
        action: 'delete',
        data: {
          name: 'name',
          repo: 'npm',
          group: 'null',
          range: '*',
        }
      },
      output: {
        ...baseConfig,
        action: 'delete',
        data: {
          range: '*',
          name: 'name',
          repo: 'npm',
          group: null as any, // eslint-disable-line unicorn/no-null
        }
      }
    },
  ]

  testCases.forEach(
    ({ config, description, output }) => test(description, () => expect(resolveDeleteConfig(config)).toEqual(output))
  )
})

describe('getConfig', () => {
  it('throws error on unknown action', () => {
    expect(() => getConfig({ ...baseConfig, action: 'foo', data: {} } as any)).toThrow()
  })

  it('reads config from file', () => {
    const readFileMock = jest.spyOn(misc, 'readFileToString')
      .mockImplementation(() => JSON.stringify({
        data: {
          repo: 'repo',
        }
      }))

    expect(getConfig({ ...baseConfig, action: 'download', data: {} }, 'some/path')).toEqual({
      ...baseConfig,
      action: 'download',
      data: {
        cwd: process.cwd(),
        repo: 'repo',
      },
    })
    expect(readFileMock).toHaveBeenCalled()
  })
})
