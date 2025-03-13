/**
 * 类型处理工具集
 * 提供通用的类型分析、分割和处理函数
 */
import { ErrorType, handleError } from './error-handler'

/**
 * 复杂类型的解析结果
 */
export interface TypeAnalysisResult {
  // 分割后的类型片段
  parts: string[]

  // 是否是联合类型 (A | B)
  isUnion: boolean

  // 是否是交叉类型 (A & B)
  isIntersection: boolean

  // 原始类型文本
  originalText: string
}

/**
 * 解析复杂类型，识别联合类型和交叉类型
 * @param typeText 类型文本
 */
export function parseComplexType(typeText: string): TypeAnalysisResult {
  const trimmedText = typeText.trim()
  const isUnion = trimmedText.includes('|')
  const isIntersection = trimmedText.includes('&')

  // 如果既有联合又有交叉，优先处理联合类型
  const operator = isUnion ? '|' : isIntersection ? '&' : ''

  try {
    return {
      parts: operator ? splitTypeByOperator(trimmedText, operator) : [trimmedText],
      isUnion,
      isIntersection,
      originalText: trimmedText,
    }
  }
  catch (err) {
    handleError(
      ErrorType.TYPE_PARSE_ERROR,
      `解析复杂类型失败: ${trimmedText}`,
      err,
    )

    // 返回默认结果
    return {
      parts: [trimmedText],
      isUnion: false,
      isIntersection: false,
      originalText: trimmedText,
    }
  }
}

/**
 * 按操作符分割类型文本，处理嵌套结构
 * @param typeText 类型文本
 * @param operator 操作符 ('|' 或 '&')
 */
export function splitTypeByOperator(typeText: string, operator: string): string[] {
  if (!typeText)
    return []

  const parts: string[] = []
  let current = ''
  let braceLevel = 0
  let angleLevel = 0
  let squareLevel = 0
  let parenLevel = 0

  for (let i = 0; i < typeText.length; i++) {
    const char = typeText[i]

    // 跟踪嵌套级别
    switch (char) {
      case '{': braceLevel++; break
      case '}': braceLevel--; break
      case '<': angleLevel++; break
      case '>': angleLevel--; break
      case '[': squareLevel++; break
      case ']': squareLevel--; break
      case '(': parenLevel++; break
      case ')': parenLevel--; break
    }

    // 只有在顶层遇到操作符才分割
    if (char === operator[0]
      && braceLevel === 0
      && angleLevel === 0
      && squareLevel === 0
      && parenLevel === 0) {
      // 检查是完整的操作符，而不是其中的一部分
      if (operator.length === 1
        || (i + operator.length <= typeText.length
          && typeText.substring(i, i + operator.length) === operator)) {
        // 如果是多字符操作符，跳过剩余字符
        if (operator.length > 1) {
          i += operator.length - 1
        }

        // 添加当前部分并重置
        if (current.trim()) {
          parts.push(current.trim())
        }
        current = ''
        continue
      }
    }

    current += char
  }

  // 添加最后一部分
  if (current.trim()) {
    parts.push(current.trim())
  }

  return parts
}

/**
 * 检测类型是否为可选（包含 undefined 或 null）
 * @param typeText 类型文本
 */
export function isOptionalType(typeText: string): boolean {
  const { parts, isUnion } = parseComplexType(typeText)

  if (!isUnion)
    return false

  return parts.some((part) => {
    const normalized = part.trim().toLowerCase()
    return normalized === 'undefined' || normalized === 'null'
  })
}

/**
 * 获取类型的基本名称（去除泛型参数）
 * @param typeText 类型文本
 */
export function getBaseTypeName(typeText: string): string {
  const trimmed = typeText.trim()

  // 处理泛型
  const genericIndex = trimmed.indexOf('<')
  if (genericIndex > 0) {
    return trimmed.substring(0, genericIndex).trim()
  }

  // 处理数组类型
  if (trimmed.endsWith('[]')) {
    return 'Array'
  }

  return trimmed
}

/**
 * 提取泛型参数
 * @param typeText 类型文本
 */
export function extractGenericParameters(typeText: string): string[] {
  const trimmed = typeText.trim()

  // 查找泛型参数
  const startIdx = trimmed.indexOf('<')
  const endIdx = trimmed.lastIndexOf('>')

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    return []
  }

  const genericContent = trimmed.substring(startIdx + 1, endIdx)

  // 分割泛型参数（处理嵌套泛型）
  return splitTypeByOperator(genericContent, ',')
}

/**
 * 将 TypeScript 类型转换为 Vue props 定义
 * @param typeText 类型文本
 * @param isRequired 是否必需
 */
export function typeScriptToVueProp(typeText: string, isRequired: boolean = true): string {
  const trimmed = typeText.trim().toLowerCase()

  // 基本类型映射
  const typeMap: Record<string, string> = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    object: 'Object',
    function: 'Function',
    array: 'Array',
    date: 'Date',
    symbol: 'Symbol',
    bigint: 'BigInt',
    any: 'null',
    unknown: 'null',
  }

  // 应用基本类型转换
  if (typeMap[trimmed]) {
    return `{ type: ${typeMap[trimmed]}, required: ${isRequired} }`
  }

  // 处理数组类型
  if (trimmed.endsWith('[]')) {
    return `{ type: Array, required: ${isRequired} }`
  }

  // 处理特殊类型
  if (trimmed.startsWith('readonly ')) {
    return typeScriptToVueProp(trimmed.substring(9), isRequired)
  }

  // 处理联合类型和交叉类型
  const analysis = parseComplexType(typeText)

  if (analysis.isUnion) {
    // 处理可选类型
    const nonNullable = analysis.parts.filter((p) => {
      const normalized = p.trim().toLowerCase()
      return normalized !== 'undefined' && normalized !== 'null'
    })

    if (nonNullable.length === 0) {
      return `{ type: null, required: false }`
    }

    if (nonNullable.length === 1) {
      return typeScriptToVueProp(nonNullable[0], isRequired)
    }

    // 处理字符串字面量联合类型
    const isStringLiterals = nonNullable.every(p =>
      (p.startsWith('\'') && p.endsWith('\''))
      || (p.startsWith('"') && p.endsWith('"')),
    )

    if (isStringLiterals) {
      return `{ type: String, required: ${isRequired} }`
    }

    // 处理数字字面量联合类型
    const isNumberLiterals = nonNullable.every(p => !isNaN(Number(p)))

    if (isNumberLiterals) {
      return `{ type: Number, required: ${isRequired} }`
    }

    // 创建类型数组
    const vueTypes = nonNullable.map((p) => {
      const baseName = getBaseTypeName(p)
      return typeMap[baseName.toLowerCase()] || 'Object'
    })

    return `{ type: [${[...new Set(vueTypes)].join(', ')}], required: ${isRequired} }`
  }

  if (analysis.isIntersection) {
    // 交叉类型通常表示复杂对象类型
    return `{ type: Object, required: ${isRequired} }`
  }

  // 处理函数类型
  if (trimmed.includes('=>') || trimmed.startsWith('(') && trimmed.includes(')')) {
    return `{ type: Function, required: ${isRequired} }`
  }

  // 默认为对象类型
  return `{ type: Object, required: ${isRequired} }`
}
