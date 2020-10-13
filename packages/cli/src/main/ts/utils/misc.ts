import { readFileSync } from 'fs'
import { createInterface } from 'readline'

export const question = (message: string): Promise<string> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(message, resolve)
  })
}

export const readFileToString = (path: string): string => readFileSync(path).toString()
