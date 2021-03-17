import { IBaseConfig } from '../../../main/ts'
import { validateConfig, validateDeleteConfig,validateDownloadConfig } from '../../../main/ts/utils/validators'
import { baseConfig } from '../utils'

type TTestCase = {
  description: string
  input: any,
  valid: boolean
}

const validatorTesterFactory = (validator: (config: IBaseConfig) => IBaseConfig) =>
  (opts: TTestCase) => {
    const { description, input, valid } = opts
    it(description, () => {
      if (valid) {
        expect(() => validator(input)).not.toThrow()
      } else {
        expect(() => validator(input)).toThrow()
      }
    })
  }

describe('validateConfig', () => {
  const config = { ...baseConfig, action: 'delete' }
  const testCases: Array<TTestCase> = [
    {
      description: 'correct config', // eslint-disable-line sonarjs/no-duplicate-string
      input: config,
      valid: true,
    },
    {
      description: 'url must be string',
      input: { ...config, url: undefined },
      valid: false,
    }
  ]

  const checker = validatorTesterFactory(validateConfig)
  testCases.forEach(checker)
})

describe('validateDownloadConfig', () => {
  const config = { ...baseConfig, action: 'download' }
  const testCases: TTestCase[] = [
    {
      description: 'correct config',
      input: {
        ...config,
        data: {
          repo: 'repo',
        }
      },
      valid: true,
    },
    {
      description: 'repo must be string',
      input: {
        ...config,
        data: {
          repo: undefined,
        }
      },
      valid: false,
    },
    {
      description: 'npmBatch must be object',
      input: {
        ...config,
        data: {
          repo: 'repo',
          npmBatch: 'foo',
        }
      },
      valid: false,
    }
  ]

  const checker = validatorTesterFactory(validateDownloadConfig)
  testCases.forEach(checker)
})


describe('validateDeleteConfig', () => {
  const config = { ...baseConfig, action: 'download' }
  const testCases: TTestCase[] = [
    {
      description: 'correct config',
      input: {
        ...config,
        data: {
          repo: 'repo',
          name: 'name'
        }
      },
      valid: true,
    },
    {
      description: 'name must be string',
      input: {
        ...config,
        data: {
          repo: 'repo',
          name: undefined,
        }
      },
      valid: false,
    }
  ]

  const checker = validatorTesterFactory(validateDeleteConfig)
  testCases.forEach(checker)
})
