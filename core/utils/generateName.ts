import { CLASS_PREFIX, COMPONENT_PREFIX } from '@/constants/constants'

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generatedNamesSet = new Set<string>()

export const generateUniqueName = (): string => {
  let uniqueName
  do {
    const timestamp = new Date().getTime()
    const randomSuffix = Math.floor(Math.random() * 10000) * Math.floor(Math.random() * 10)
    uniqueName = `${generateAlphabeticName(timestamp * Math.floor(Math.random() * 1000))}${randomSuffix}`
  } while (generatedNamesSet.has(uniqueName))

  generatedNamesSet.add(uniqueName)

  return uniqueName
}

/* 生成字母名的函数 */
const generateAlphabeticName = (code: number): string => {
  const lastDigit = chars[code % chars.length]
  return code > chars.length ? `${generateAlphabeticName(Math.floor(code / chars.length))}${lastDigit}` : lastDigit
}

export function generateComponentName(target: string): string {
  return `${COMPONENT_PREFIX}-${target}-${generateUniqueName()}`
}

export function generateClassName(): string {
  return `${CLASS_PREFIX}-${generateUniqueName()}`
}
