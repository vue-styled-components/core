import type { TransformResult } from './types'
import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import MagicString from 'magic-string'
import { analyzeTypeParameter } from './ast-traverser'
import { extractTypeInfo } from './type-converter'
import { hasStyledComponents } from './utils'

// 辅助函数：将TypeScript类型转换为Vue Props格式
export function formatPropTypeToJS(propType: any, isOptional: boolean = false): string {
  if (!propType)
    return '{ type: null, required: true }'

  // 获取required属性值
  const required = !isOptional

  // 基本类型转换为Vue Props格式
  if (propType.type === 'String')
    return `{ type: String, required: ${required} }`
  if (propType.type === 'Number')
    return `{ type: Number, required: ${required} }`
  if (propType.type === 'Boolean')
    return `{ type: Boolean, required: ${required} }`
  if (propType.type === 'Array')
    return `{ type: Array, required: ${required} }`
  if (propType.type === 'Object')
    return `{ type: Object, required: ${required} }`
  if (propType.type === 'Function')
    return `{ type: Function, required: ${required} }`

  // 联合类型
  if (propType.type === 'union') {
    const types: string[] = []
    propType.types.forEach((t: any) => {
      if (types.includes(t.type))
        return
      types.push(t.type)
    })

    return `{ type: [${types.join(', ')}], required: ${required} }`
  }

  // 对象类型
  if (propType.type === 'object' && propType.properties) {
    return `{ type: Object, required: ${required} }`
  }

  // 其他类型默认返回String
  return `{ type: String, required: ${required} }`
};

// 处理单个属性定义
export function processProp(propStr: string): string {
  // 匹配属性名和类型，支持特殊字符（如带引号的属性名和data-*属性）
  // 注意：属性名可能包含问号，表示可选属性，需要从属性名中移除
  const propMatch = propStr.match(/\s*(['"]?)([^'":\s?]+)(\?)?\1\s*(?:\?\s*)?:\s*(.+)/)
  if (propMatch) {
    const [, quote, propName, questionMark, propType] = propMatch
    // 检查属性名是否有效
    if (!propName || propName.length === 0) {
      return ''
    }

    // 判断属性是否可选 - 有两种情况: name?: type 或 name: type | undefined
    const propIsOptional = questionMark === '?' || propStr.includes('?:') || propType.includes('undefined')

    // 特殊字符属性名需要加引号，例如 data-id
    const formattedPropName = propName.includes('-') ? `'${propName}'` : propName

    // 简化处理属性类型
    let jsType
    const cleanPropType = propType.trim()

    if (cleanPropType.startsWith('Array<') || cleanPropType.endsWith('[]')) {
      jsType = 'Array'
    }
    else if (cleanPropType.includes('=>') || cleanPropType.includes('function')) {
      jsType = 'Function'
    }
    else if (cleanPropType.startsWith('{')) {
      jsType = 'Object'
    }
    else if (cleanPropType.includes('|')) {
      // 处理联合类型
      const types = cleanPropType.split('|').map(t => t.trim()).filter(t => t && t !== 'undefined' && t !== 'null')

      // 检查是否都是字符串字面量
      if (types.every(t => t.startsWith('\'') || t.startsWith('"'))) {
        jsType = 'String'
      }
      // 检查是否都是数字
      else if (types.every(t => !isNaN(Number(t)))) {
        jsType = 'Number'
      }
      // 混合类型
      else {
        const uniqueTypes = new Set()
        types.forEach((t) => {
          let basicType
          if (t.startsWith('\'') || t.startsWith('"'))
            basicType = 'String'
          else if (!isNaN(Number(t)))
            basicType = 'Number'
          else if (t === 'true' || t === 'false')
            basicType = 'Boolean'
          else basicType = 'String' // 默认为String
          uniqueTypes.add(basicType)
        })

        if (uniqueTypes.size === 1) {
          jsType = [...uniqueTypes][0]
        }
        else {
          jsType = `[${[...uniqueTypes].join(', ')}]`
        }
      }
    }
    else {
      // 基本类型
      switch (cleanPropType.toLowerCase()) {
        case 'string': jsType = 'String'; break
        case 'number': jsType = 'Number'; break
        case 'boolean': jsType = 'Boolean'; break
        default: jsType = 'String' // 默认为String
      }
    }

    return `${formattedPropName}: { type: ${jsType}, required: ${!propIsOptional} }`
  }

  // 处理更复杂的情况，只提取属性名和可选性
  // 这个正则主要用于处理格式不标准或包含复杂泛型的属性
  const complexPropMatch = propStr.match(/^\s*(\w+)\s*(\?)?:.+$/)
  if (complexPropMatch) {
    const [, propName, questionMark] = complexPropMatch
    const isOptional = !!questionMark || propStr.includes('undefined')
    return `${propName}: { type: String, required: ${!isOptional} }`
  }

  // 如果无法解析属性，返回空字符串
  return ''
}

// 辅助函数：将原始类型字符串转换为Vue Props格式
export function convertToJSTypes(typeAliasMap: Map<string, any>, typeText: string): string {
  // 获取类型名称，并清除额外的空格
  const type = typeText.trim()

  // 判断是否为可选类型（以?结尾）
  const isOptional = type.endsWith('?')
  const cleanType = isOptional ? type.slice(0, -1).trim() : type

  // 将类型名称转换为构造函数
  const getType = (typeName: string): string => {
    switch (typeName.toLowerCase()) {
      case 'string': return 'String'
      case 'number': return 'Number'
      case 'boolean': return 'Boolean'
      case 'array': return 'Array'
      case 'object': return 'Object'
      case 'function': return 'Function'
      case 'symbol': return 'Symbol'
      case 'bigint': return 'BigInt'
      default: return 'String' // 默认为String类型
    }
  }

  // 辅助函数：简化类型处理，不处理复杂嵌套结构
  const getSimplifiedType = (typeStr: string): string => {
    typeStr = typeStr.trim()

    // 数组类型简化
    if (typeStr.endsWith('[]')
      || typeStr.startsWith('Array<')
      || typeStr.startsWith('Set<')
      || typeStr.startsWith('Collection<')) {
      return 'Array'
    }

    // Map或Record类型简化
    if (typeStr.startsWith('Map<')
      || typeStr.startsWith('Record<')
      || typeStr.startsWith('Dictionary<')) {
      return 'Object'
    }

    // 函数类型简化
    if (typeStr.includes('=>')
      || typeStr.startsWith('Function')
      || typeStr.startsWith('Func<')) {
      return 'Function'
    }

    // 处理Promise或异步类型
    if (typeStr.startsWith('Promise<')
      || typeStr.startsWith('Async')) {
      return 'Object'
    }

    // 处理联合类型
    if (typeStr.includes('|')) {
      const types = typeStr.split('|').map(t => t.trim()).filter(t => t !== 'undefined' && t !== 'null')

      if (types.length === 0)
        return 'null'
      if (types.length === 1)
        return getType(types[0])

      // 如果都是字符串字面量类型
      if (types.every(t => t.startsWith('\'') || t.startsWith('"'))) {
        return 'String'
      }

      // 如果都是数字字面量类型
      if (types.every(t => !isNaN(Number(t)))) {
        return 'Number'
      }

      // 其他联合类型返回数组
      return `[${types.map(getType).join(', ')}]`
    }

    // 处理基本类型
    return getType(typeStr)
  }

  // 检查是否是对象类型的内联定义 - 形如 {prop: type}
  if (cleanType.startsWith('{') && cleanType.endsWith('}')) {
    try {
      // 提取对象内容
      const objContent = cleanType.slice(1, -1).trim()

      // 直接分割属性并解析属性类型
      if (objContent) {
        // 使用更可靠的方法处理属性分隔
        // 考虑分号和逗号分隔，并处理嵌套结构
        const props = parseInlineProps(typeAliasMap, objContent)
        return stringifyProps(props)
      }
    }
    catch (e) {
      console.error('Error parsing inline object type:', e)
    }

    // 如果无法解析内联对象，返回通用对象类型
    return `{ type: Object, required: ${!isOptional} }`
  }

  // 返回Vue Props格式
  return `{ type: ${getSimplifiedType(cleanType)}, required: ${!isOptional} }`
}

// 修改类型识别逻辑，确保正确映射TS类型到Vue类型
export function mapTypeToVueProp(type: string): string {
  const typeMap: Record<string, string> = {
    boolean: 'Boolean',
    string: 'String',
    number: 'Number',
    array: 'Array',
    object: 'Object',
    function: 'Function',
    symbol: 'Symbol',
    bigint: 'BigInt',
    // 添加其他需要的类型映射
  }

  const normalizedType = type.toLowerCase().trim()

  return typeMap[normalizedType] || 'String' // 默认为String如果未找到匹配
}

// 检测是否为复杂泛型表达式
export function isComplexGenericType(typeText: string): boolean {
  return (
    typeText.includes('extends')
    || typeText.includes('&')
    || typeText.includes('|')
    || typeText.includes('=>')
    || typeText.includes('<') && typeText.includes('>') // 嵌套泛型
  )
}

// 处理泛型参数部分
export function processGenericParams(typeAliasMap: Map<string, any>, genericText: string): string {
  // 检查是否为复杂泛型表达式
  if (isComplexGenericType(genericText)) {
    // 对于复杂泛型，直接返回原始表达式
    return genericText
  }

  // 处理简单内联对象类型
  if (genericText.startsWith('{') && genericText.endsWith('}')) {
    try {
      const props = parseInlineProps(typeAliasMap, genericText)
      console.log(props, 22)
      return stringifyProps(props)
    }
    catch (e) {
      // 如果解析失败，回退到原始表达式
      return genericText
    }
  }

  // 处理简单接口引用
  return genericText
}

// 解析内联属性对象
export function parseInlineProps(typeAliasMap: Map<string, any>, propsText: string): Record<string, { type: string, required: boolean }> {
  const result: Record<string, { type: string, required: boolean }> = {}

  // 处理多行属性定义，标准化换行符和空格
  const normalizedText = propsText
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, ';')
    .replace(/\s+/g, '')
    .trim()

  // 智能分割属性，考虑分号和逗号分隔
  const properties: string[] = []
  let current = ''
  let braceLevel = 0
  let angleLevel = 0
  let parenLevel = 0 // 处理括号，例如函数类型中的参数列表

  // 先智能分割属性
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i]

    if (char === '{') {
      braceLevel++
    }
    else if (char === '}') {
      braceLevel--
    }
    else if (char === '<') {
      angleLevel++
    }
    else if (char === '>') {
      angleLevel--
    }
    else if (char === '(') {
      parenLevel++
    }
    else if (char === ')') {
      parenLevel--
    }
    // 只有在顶层时才视为分隔符
    else if ((char === ';' || char === ',') && braceLevel === 0 && angleLevel === 0 && parenLevel === 0) {
      if (current.trim()) {
        properties.push(current.trim())
      }
      current = ''
      continue
    }

    current += char
  }

  // 处理最后一个属性
  if (current.trim()) {
    properties.push(current.trim())
  }

  // 处理每个属性
  for (const prop of properties) {
    // 匹配属性名、可选标记和类型
    // 支持以下格式:
    // - name: type
    // - name?: type
    const match = prop.match(/^\s*([^?:\s]+)(\?)?:\s*(.+)$/)
    if (match) {
      const [, propName, questionMark, propType] = match
      const isOptional = !!questionMark

      // 智能检测属性类型
      let type = 'String' // 默认值
      const cleanType = propType.trim()
      const lowerType = cleanType.toLowerCase()

      // 优先检测布尔类型 - 高优先级匹配关键词
      if (lowerType === 'boolean'
        || lowerType === 'true'
        || lowerType === 'false') {
        type = 'Boolean'
      }
      // 检测数字类型
      else if (lowerType === 'number'
        || !isNaN(Number(cleanType))) {
        type = 'Number'
      }
      // 检测字符串类型
      else if (lowerType === 'string'
        || cleanType.startsWith('\'')
        || cleanType.startsWith('"')) {
        type = 'String'
      }
      // 检测数组类型
      else if (cleanType.endsWith('[]')
        || lowerType.startsWith('array<')) {
        type = 'Array'
      }
      // 检测函数类型
      else if (cleanType.includes('=>')
        || lowerType === 'function') {
        type = 'Function'
      }
      // 检测对象类型
      else if (lowerType === 'object'
        || cleanType.startsWith('{')) {
        type = 'Object'
      }
      // 处理联合类型
      else if (cleanType.includes('|')) {
        // 检查是否包含布尔关键字或布尔字面量
        if (lowerType.includes('boolean')
          || lowerType.includes('true')
          || lowerType.includes('false')) {
          type = 'Boolean'
        }
        // 检查是否包含字符串字面量
        else if (cleanType.includes('\'') || cleanType.includes('"')) {
          type = 'String'
        }
        // 检查是否包含 number 关键字或数字字面量
        else if (lowerType.includes('number')
          || /\b\d+\b/.test(cleanType)) {
          type = 'Number'
        }
        // 混合类型
        else {
          // 返回联合类型数组
          const types = new Set<string>()

          if (lowerType.includes('string'))
            types.add('String')
          if (lowerType.includes('number'))
            types.add('Number')
          if (lowerType.includes('boolean'))
            types.add('Boolean')

          if (types.size > 0) {
            type = types.size === 1
              ? [...types][0]
              : `[${[...types].join(', ')}]`
          }
          else {
            type = 'String' // 默认为字符串类型
          }
        }
      }
      else {
        // 正确判断类型，使用Babel类型检查函数
        const typeName = propType.split('<')[0].trim()
        const typeInfo = typeAliasMap.get(typeName)

        if (typeInfo) {
          console.log(typeInfo)

          if (t.isTSStringKeyword(typeInfo))
            type = 'String'
          if (t.isTSNumberKeyword(typeInfo))
            type = 'Number'
          if (t.isTSBooleanKeyword(typeInfo))
            type = 'Boolean'
          if (t.isTSArrayType(typeInfo))
            type = 'Array'
          if (t.isTSObjectKeyword(typeInfo))
            type = 'Object'
          if (t.isTSFunctionType(typeInfo))
            type = 'Function'
          if (t.isTSNullKeyword(typeInfo))
            type = 'null'
          if (t.isTSUndefinedKeyword(typeInfo))
            type = 'undefined'

          console.log(type)

          // 处理引用类型
          if (t.isTSTypeReference(typeInfo)) {
            if (t.isIdentifier(typeInfo.typeName)) {
              type = typeInfo.typeName.name
            }
          }
        }
        else {
          // 默认类型处理
          type = 'String'
        }
      }

      result[propName] = { type, required: !isOptional }
    }
  }

  return result
}

// 将解析后的props转为字符串
export function stringifyProps(props: Record<string, { type: string, required: boolean }>): string {
  const entries = Object.entries(props).map(([key, { type, required }]) => {
    return `${key}: { type: ${type}, required: ${required} }`
  })

  return `{ ${entries.join(', ')} }`
}

// 处理多行内联对象类型
export function handleMultilineObject(typeAliasMap: Map<string, any>, objectText: string): string {
  // 移除花括号并整理内容
  const content = objectText.slice(1, -1).trim()

  if (!content)
    return '{}'

  try {
    // 解析属性并重建Vue Props对象
    const properties = parseInlineProps(typeAliasMap, content)
    return stringifyProps(properties)
  }
  catch (e) {
    console.error('Error parsing multiline object:', e)
    return '{}'
  }
}

/**
 * 转换styled组件语法
 *
 * @param code 原始代码
 * @param id 文件ID
 * @returns 转换结果，如果没有变化则为null
 */
export function transformStyledSyntax(code: string, id: string): TransformResult | null {
  if (!hasStyledComponents(code)) {
    return null
  }

  // 使用 MagicString 进行精确替换
  const s = new MagicString(code)

  // 是否有修改
  let hasChanges = false

  // 存储接口和类型定义，用于后续转换引用类型
  const typeMap = new Map<string, string>()
  // 存储导入的类型及其来源
  const importedTypes = new Map<string, { source: string, originalName?: string }>()
  // 存储类型别名的实际类型内容
  const typeAliasMap = new Map<string, any>()

  // 使用Babel解析代码
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      ['decorators', { decoratorsBeforeExport: true }],
    ],
    errorRecovery: true,
  })

  // 第一遍扫描：收集所有导入类型和类型定义
  traverse(ast, {
    ImportDeclaration(path) {
      const importSource = path.node.source?.value

      if (importSource && path.node.specifiers && Array.isArray(path.node.specifiers)) {
        for (const specifier of path.node.specifiers) {
          // 获取导入的名称
          let importedName = ''
          let originalName = ''

          // 处理不同类型的导入
          if (t.isImportSpecifier(specifier)) {
            // 命名导入: import { Type } from '...'
            importedName = specifier.local?.name
            originalName = t.isIdentifier(specifier.imported)
              ? specifier.imported?.name
              : importedName
          }
          else if (t.isImportDefaultSpecifier(specifier)) {
            // 默认导入: import Type from '...'
            importedName = specifier.local?.name
            originalName = 'default'
          }
          else if (t.isImportNamespaceSpecifier(specifier)) {
            // 命名空间导入: import * as Types from '...'
            importedName = specifier.local?.name
          }

          // 记录导入的类型名称及其来源
          if (importedName) {
            importedTypes.set(importedName, {
              source: importSource,
              originalName: originalName || undefined,
            })
          }
        }
      }
    },

    TSInterfaceDeclaration(path) {
      if (path.node.id && path.node.id.name) {
        const interfaceName = path.node.id.name
        const interfaceBody = path.node.body

        // 创建属性集合
        const propsMap: Record<string, any> = {}

        // 处理接口继承
        if (path.node.extends && Array.isArray(path.node.extends) && path.node.extends.length > 0) {
          for (const extendedInterface of path.node.extends) {
            if (extendedInterface.expression
              && extendedInterface.expression.type === 'Identifier') {
              const baseInterfaceName = (extendedInterface.expression as any).name
              if (baseInterfaceName) {
                // 检查是否已经处理过该基础接口
                if (typeMap.has(baseInterfaceName)) {
                  try {
                    // 获取基础接口的属性字符串
                    const basePropsStr = typeMap.get(baseInterfaceName) || '{}'

                    // 解析基础接口的字符串表示成一个对象
                    if (basePropsStr.startsWith('{') && basePropsStr.endsWith('}')) {
                      // 提取所有属性定义
                      const content = basePropsStr.slice(1, -1).trim()
                      // 采用更简单和可靠的方法：按照属性模式分割
                      // 先按逗号分割，确保分隔符不在花括号内
                      let propCount = 0
                      let braceCount = 0
                      let start = 0

                      for (let i = 0; i < content.length; i++) {
                        if (content[i] === '{') {
                          braceCount++
                        }
                        else if (content[i] === '}') {
                          braceCount--
                        }
                        else if (content[i] === ',' && braceCount === 0) {
                          // 找到属性分隔符，处理当前属性
                          const propDef = content.substring(start, i).trim()
                          const colonIdx = propDef.indexOf(':')

                          if (colonIdx !== -1) {
                            const propName = propDef.substring(0, colonIdx).trim()
                            const propValue = propDef.substring(colonIdx + 1).trim()
                            propsMap[propName] = propValue
                            propCount++
                          }

                          start = i + 1 // 更新下一个属性的起始位置
                        }
                      }

                      // 处理最后一个属性
                      if (start < content.length) {
                        const propDef = content.substring(start).trim()
                        const colonIdx = propDef.indexOf(':')

                        if (colonIdx !== -1) {
                          const propName = propDef.substring(0, colonIdx).trim()
                          const propValue = propDef.substring(colonIdx + 1).trim()
                          propsMap[propName] = propValue
                          propCount++
                        }
                      }

                      if (propCount === 0) {
                        // 如果上面的方法没有找到属性，尝试使用正则表达式
                        const propRegex = /(\w+)\s*:\s*(\{[^}]*\})/g
                        let match

                        while ((match = propRegex.exec(content)) !== null) {
                          const [, propName, propValue] = match
                          if (propName && propValue) {
                            propsMap[propName] = propValue
                          }
                        }
                      }
                    }
                  }
                  catch (e) {
                    console.error(`解析基础接口 ${baseInterfaceName} 失败:`, e)
                  }
                }
              }
            }
          }
        }

        if (interfaceBody && interfaceBody.body && Array.isArray(interfaceBody.body)) {
          // 遍历接口成员
          for (const member of interfaceBody.body) {
            if (t.isTSPropertySignature(member)
              && t.isIdentifier(member.key)
              && member.key.name) {
              const propName = member.key.name
              const isOptional = member.optional === true

              let jsType = '{ type: String, required: true }'

              // 提取类型
              if (member.typeAnnotation && member.typeAnnotation.typeAnnotation) {
                const propType = extractTypeInfo(member.typeAnnotation.typeAnnotation)
                jsType = formatPropTypeToJS(propType, isOptional)
              }

              // 添加到属性映射
              propsMap[propName] = jsType
            }
          }
        }

        // 将属性映射转换为属性字符串
        const props = Object.entries(propsMap).map(([name, type]) => `${name}: ${type}`)

        // 以JS构造函数格式存储接口定义
        typeMap.set(interfaceName, `{ ${props.join(', ')} }`)
      }
    },

    TSTypeAliasDeclaration(path) {
      if (path.node.id && path.node.id.name) {
        const typeName = path.node.id.name
        const typeAnnotation = path.node.typeAnnotation

        // 保存类型别名的实际类型节点，用于后续引用
        typeAliasMap.set(typeName, typeAnnotation)

        // 如果是类型字面量，处理其中的属性
        if (t.isTSTypeLiteral(typeAnnotation)
          && typeAnnotation.members
          && Array.isArray(typeAnnotation.members)) {
          const props: string[] = []

          // 遍历类型成员
          for (const member of typeAnnotation.members) {
            if (t.isTSPropertySignature(member)
              && t.isIdentifier(member.key)
              && member.key.name) {
              const propName = member.key.name
              const isOptional = member.optional === true

              let jsType = '{ type: String, required: true }'

              // 提取类型
              if (member.typeAnnotation && member.typeAnnotation.typeAnnotation) {
                const propType = extractTypeInfo(member.typeAnnotation.typeAnnotation)
                jsType = formatPropTypeToJS(propType, isOptional)
              }

              props.push(`${propName}: ${jsType}`)
            }
          }

          // 以JS构造函数格式存储类型别名定义
          typeMap.set(typeName, `{ ${props.join(', ')} }`)
        }
      }
    },
  })

  // 第二遍：收集声明中的styled组件并转换
  traverse(ast, {
    VariableDeclaration(path) {
      // 遍历所有声明
      for (const declaration of path.node.declarations) {
        // 查找初始化表达式
        const init = declaration.init
        if (init && t.isTaggedTemplateExpression(init)) {
          const tag = init.tag

          // 查找styled.tag<Props> 模式
          // 首先看是否是TypeCastExpression或TSAsExpression（泛型标记可能被解析为类型断言）
          if (tag && (t.isTSAsExpression(tag) || t.isTypeCastExpression(tag))) {
            const expression = tag.expression
            // 检查是否是成员表达式 styled.tag
            if (expression && t.isMemberExpression(expression)
              && t.isIdentifier(expression.object) && expression.object.name === 'styled'
              && t.isIdentifier(expression.property)) {
              // 获取HTML标签名称
              const tagName = expression.property.name

              // 获取类型参数（在TypeAnnotation或typeAnnotation中）
              const typeAnnotation = tag.typeAnnotation
              if (typeAnnotation) {
                // 获取类型在源码中的位置
                const typeStart = typeAnnotation.start || 0
                const typeEnd = typeAnnotation.end || 0

                // 如果无法获取位置信息，则跳过
                if (typeStart === 0 || typeEnd === 0)
                  continue

                // 提取类型文本
                const typeText = code.slice(typeStart, typeEnd)

                // 处理类型文本，提取实际参数
                let params = typeText
                let typeName = ''

                // 如果是形如 <Props> 的泛型参数
                if (typeText.startsWith('<') && typeText.endsWith('>')) {
                  params = typeText.slice(1, -1).trim()

                  // 分析类型参数
                  const typeInfo = analyzeTypeParameter(params)

                  if (typeInfo.isReference) {
                    typeName = typeInfo.name

                    // 处理引用类型
                    if (typeMap.has(typeName)) {
                      // 使用预先收集的类型信息
                      params = typeMap.get(typeName) || params
                    }
                    else if (typeInfo.typeParameters && typeInfo.typeParameters.length > 0) {
                      // 如果是带有泛型参数的类型引用，或类型组合
                      if (typeInfo.typeParameters[0].composition) {
                        // 保留类型组合表达式
                        params = typeInfo.typeParameters[0].text
                      }
                      else if (typeInfo.typeParameters[0].text) {
                        // 保留泛型参数
                        params = `${typeName}<${typeInfo.typeParameters[0].text}>`
                      }
                    }
                  }
                  else if (typeInfo.name === 'object') {
                    // 处理对象类型
                    params = convertToJSTypes(typeAliasMap, params)
                  }
                  else if (params.includes('{') && params.includes('}')) {
                    // 处理包含内联对象的复杂表达式
                    // 尝试提取内联对象
                    if (params.startsWith('{') && params.endsWith('}')) {
                      // 对完整的内联对象使用专用解析函数
                      params = handleMultilineObject(typeAliasMap, params)
                    }
                    else {
                      // 处理包含内联对象但有其他内容的复杂表达式
                      const objMatch = params.match(/\{([^{}]*)\}/)
                      if (objMatch && objMatch[1]) {
                        const objContent = objMatch[1].trim()
                        if (objContent) {
                          try {
                            const objProps = parseInlineProps(typeAliasMap, objContent)
                            // 检查是否是交叉类型（对象 & 其他类型）
                            if (params.includes('&')) {
                              // 解析完整的交叉类型
                              params = handleObjectIntersectionType(typeMap, params, objProps)
                            }
                            else {
                              params = stringifyProps(objProps)
                            }
                          }
                          catch (e) {
                            console.error('Error parsing inline object:', e)
                          }
                        }
                      }
                      else if (params.includes('&')) {
                        // 处理不包含内联对象的交叉类型
                        params = handleIntersectionType(typeAliasMap, typeMap, params)
                      }
                      else if (params.includes('|')) {
                        // 处理联合类型
                        params = handleUnionType(params)
                      }
                    }
                  }
                }

                // 查找成员表达式在源码中的位置
                const exprStart = expression.start || 0
                if (exprStart === 0)
                  continue

                // 替换 styled.tag<Props> 为 styled('tag', Props)
                s.overwrite(
                  exprStart,
                  typeEnd,
                  `styled('${tagName}', ${params})`,
                )
                hasChanges = true
              }
            }
          }

          // 另一种可能：直接是成员表达式并且跟着TSTypeParameterInstantiation
          if (tag && t.isMemberExpression(tag)
            && t.isIdentifier(tag.object) && tag.object.name === 'styled'
            && t.isIdentifier(tag.property)) {
            // 查找泛型参数（可能在父节点或相邻节点）
            let typeParams: any = null
            let typeParamsStart = 0
            let typeParamsEnd = 0

            // 检查是否有typeParameters属性（Babel类型定义中可能缺少，但运行时可能存在）
            if ((tag as any).typeParameters) {
              typeParams = (tag as any).typeParameters
              typeParamsStart = typeParams.start || 0
              typeParamsEnd = typeParams.end || 0
            }

            // 如果没有找到类型参数，查找下一个可能的节点
            if (!typeParams && (init as any).typeParameters) {
              typeParams = (init as any).typeParameters
              typeParamsStart = typeParams.start || 0
              typeParamsEnd = typeParams.end || 0
            }

            if (typeParams && typeParamsStart > 0 && typeParamsEnd > 0) {
              // 获取HTML标签名称
              const tagName = tag.property.name

              // 提取泛型参数文本
              const genericParams = code.slice(typeParamsStart, typeParamsEnd)

              // 检查是否是有效的泛型参数
              if (genericParams.startsWith('<') && genericParams.endsWith('>')) {
                // 提取尖括号内的内容
                const params = genericParams.slice(1, -1).trim()

                console.log(params)

                // 分析类型参数
                const typeInfo = analyzeTypeParameter(params)
                let finalParams = params

                if (typeInfo.isReference) {
                  const typeName = typeInfo.name

                  // 处理引用类型
                  if (typeMap.has(typeName)) {
                    // 使用预先收集的类型信息
                    finalParams = typeMap.get(typeName) || params
                  }
                  else if (typeInfo.typeParameters && typeInfo.typeParameters.length > 0) {
                    // 如果是带有泛型参数的类型引用，或类型组合
                    if (typeInfo.typeParameters[0].composition) {
                      // 保留类型组合表达式
                      finalParams = typeInfo.typeParameters[0].text
                    }
                    else if (typeInfo.typeParameters[0].text) {
                      // 保留泛型参数
                      finalParams = `${typeName}<${typeInfo.typeParameters[0].text}>`
                    }
                  }
                }
                else if (typeInfo.name === 'object') {
                  // 处理对象类型
                  finalParams = convertToJSTypes(typeAliasMap, params)
                }
                else if (params.includes('{') && params.includes('}')) {
                  // 处理包含内联对象的复杂表达式
                  // 尝试提取内联对象
                  if (params.startsWith('{') && params.endsWith('}')) {
                    // 对完整的内联对象使用专用解析函数
                    console.log(typeAliasMap)
                    finalParams = handleMultilineObject(typeAliasMap, params)
                  }
                  else {
                    // 处理包含内联对象但有其他内容的复杂表达式
                    const objMatch = params.match(/\{([^{}]*)\}/)
                    if (objMatch && objMatch[1]) {
                      const objContent = objMatch[1].trim()
                      if (objContent) {
                        try {
                          const objProps = parseInlineProps(typeAliasMap, objContent)
                          // 检查是否是交叉类型（对象 & 其他类型）
                          if (params.includes('&')) {
                            // 解析完整的交叉类型
                            finalParams = handleObjectIntersectionType(typeMap, params, objProps)
                          }
                          else if (params.includes('|')) {
                            // 处理联合类型
                            finalParams = handleUnionType(params)
                          }
                          else {
                            finalParams = stringifyProps(objProps)
                          }
                        }
                        catch (e) {
                          console.error('Error parsing inline object:', e)
                        }
                      }
                    }
                    else if (params.includes('&')) {
                      // 处理不包含内联对象的交叉类型
                      finalParams = handleIntersectionType(typeAliasMap, typeMap, params)
                    }
                    else if (params.includes('|')) {
                      // 处理联合类型
                      finalParams = handleUnionType(params)
                    }
                  }
                }

                // 替换 styled.tag<Props> 为 styled('tag', Props)
                const nodeStart = tag.start || 0
                if (nodeStart === 0)
                  continue

                s.overwrite(
                  nodeStart,
                  typeParamsEnd,
                  `styled('${tagName}', ${finalParams})`,
                )
                hasChanges = true
              }
            }
          }
        }
      }
    },
  })

  console.log(hasChanges, id)

  // 如果没有变更，返回null
  if (!hasChanges) {
    return null
  }

  return {
    code: s.toString(),
    map: s.generateMap({ source: id, includeContent: true }),
  }
}

// 处理联合类型
export function handleUnionType(unionText: string): string {
  // 解析联合类型表达式，考虑嵌套情况
  const types: string[] = []
  let current = ''
  let braceLevel = 0
  let angleLevel = 0

  // 智能分割联合类型
  for (let i = 0; i < unionText.length; i++) {
    const char = unionText[i]

    if (char === '{') {
      braceLevel++
    }
    else if (char === '}') {
      braceLevel--
    }
    else if (char === '<') {
      angleLevel++
    }
    else if (char === '>') {
      angleLevel--
    }
    // 只有在顶层时才视为分隔符
    else if (char === '|' && braceLevel === 0 && angleLevel === 0) {
      if (current.trim()) {
        types.push(current.trim())
      }
      current = ''
      continue
    }

    current += char
  }

  // 处理最后一个类型
  if (current.trim()) {
    types.push(current.trim())
  }

  // 如果没有有效类型，返回默认值
  if (types.length === 0) {
    return '{ type: String, required: true }'
  }

  // 分析各个类型，提取Vue支持的类型
  const vueTypes = new Set<string>()
  let allOptional = false // 判断是否包含undefined或null，表示可选

  for (const type of types) {
    const normalizedType = type.trim().toLowerCase()

    // 检查是否为undefined或null，表示可选
    if (normalizedType === 'undefined' || normalizedType === 'null') {
      allOptional = true
      continue
    }

    // 映射TS类型到Vue类型
    if (normalizedType === 'string' || normalizedType.startsWith('\'') || normalizedType.startsWith('"')) {
      vueTypes.add('String')
    }
    else if (normalizedType === 'number' || /^-?\d+(\.\d+)?$/.test(normalizedType)) {
      vueTypes.add('Number')
    }
    else if (normalizedType === 'boolean' || normalizedType === 'true' || normalizedType === 'false') {
      vueTypes.add('Boolean')
    }
    else if (normalizedType === 'object' || normalizedType.startsWith('{')) {
      vueTypes.add('Object')
    }
    else if (normalizedType === 'function' || normalizedType.includes('=>')) {
      vueTypes.add('Function')
    }
    else if (normalizedType.endsWith('[]') || normalizedType.startsWith('array<')) {
      vueTypes.add('Array')
    }
    else {
      // 对于其他复杂类型，默认添加为Object
      vueTypes.add('Object')
    }
  }

  // 根据收集的类型构建结果
  const typeArray = Array.from(vueTypes)
  const typeExpression = typeArray.length === 1
    ? typeArray[0]
    : `[${typeArray.join(', ')}]`

  return `{ type: ${typeExpression}, required: ${!allOptional} }`
}

// 处理交叉类型 (A & B)
export function handleIntersectionType(typeAliasMap: Map<string, any>, typeMap: Map<string, any>, intersectionText: string): string {
  // 解析交叉类型表达式，考虑嵌套情况
  const types: string[] = []
  let current = ''
  let braceLevel = 0
  let angleLevel = 0

  // 智能分割交叉类型
  for (let i = 0; i < intersectionText.length; i++) {
    const char = intersectionText[i]

    if (char === '{') {
      braceLevel++
    }
    else if (char === '}') {
      braceLevel--
    }
    else if (char === '<') {
      angleLevel++
    }
    else if (char === '>') {
      angleLevel--
    }
    // 只有在顶层时才视为分隔符
    else if (char === '&' && braceLevel === 0 && angleLevel === 0) {
      if (current.trim()) {
        types.push(current.trim())
      }
      current = ''
      continue
    }

    current += char
  }

  // 处理最后一个类型
  if (current.trim()) {
    types.push(current.trim())
  }

  // 交叉类型的处理策略：
  // 1. 对于对象类型，尝试合并所有属性
  // 2. 对于其他类型，选择最具体的类型表示

  // 合并的属性集合
  const mergedProps: Record<string, { type: string, required: boolean }> = {}
  let hasObjectType = false

  // 首先检查是否有对象类型
  for (const type of types) {
    const trimmedType = type.trim()

    // 处理对象字面量类型
    if (trimmedType.startsWith('{') && trimmedType.endsWith('}')) {
      hasObjectType = true
      try {
        const objContent = trimmedType.slice(1, -1).trim()
        const objProps = parseInlineProps(typeAliasMap, objContent)

        // 合并属性
        Object.entries(objProps).forEach(([key, value]) => {
          // 如果属性已存在，保留required=true的版本
          if (mergedProps[key]) {
            if (value.required) {
              mergedProps[key] = value
            }
          }
          else {
            mergedProps[key] = value
          }
        })
      }
      catch (e) {
        console.error('Error parsing object in intersection type:', e)
      }
    }
    // 处理引用类型（可能是接口或类型别名）
    else if (/^[A-Z_]\w*$/i.test(trimmedType)) {
      // 尝试查找预定义的类型
      if (typeMap.has(trimmedType)) {
        const typeStr = typeMap.get(trimmedType) || ''
        // 如果是对象类型的字符串表示
        if (typeStr.startsWith('{') && typeStr.endsWith('}')) {
          hasObjectType = true
          try {
            // 提取所有属性
            const content = typeStr.slice(1, -1).trim()
            // 解析属性并合并
            const propRegex = /(\w+)\s*:\s*(\{[^{}]*\})/g
            let match

            while ((match = propRegex.exec(content)) !== null) {
              const [, propName, propValue] = match
              if (propName && propValue) {
                try {
                  const propValueObj = JSON.parse(propValue.replace(/([A-Z]+):/gi, '"$1":').replace(/'/g, '"'))
                  mergedProps[propName] = {
                    type: propValueObj.type || 'String',
                    required: propValueObj.required !== false,
                  }
                }
                catch (e) {
                  mergedProps[propName] = { type: 'String', required: true }
                }
              }
            }
          }
          catch (e) {
            console.error(`解析类型 ${trimmedType} 失败:`, e)
          }
        }
      }
    }
  }

  // 如果有对象类型，返回合并后的属性对象
  if (hasObjectType && Object.keys(mergedProps).length > 0) {
    return stringifyProps(mergedProps)
  }

  // 如果没有对象类型或无法解析，返回Object类型
  return '{ type: Object, required: true }'
}

// 处理对象与其他类型的交叉类型，如 {prop: string} & OtherType
export function handleObjectIntersectionType(
  typeMap: Map<string, any>,
  intersectionText: string,
  inlineProps: Record<string, { type: string, required: boolean }>,
): string {
  // 交叉类型的解析
  const intersectionParts = intersectionText.split('&').map(part => part.trim())

  // 合并属性的结果对象
  const mergedProps = { ...inlineProps }

  // 处理除内联对象外的其他类型
  for (const part of intersectionParts) {
    // 跳过内联对象部分，因为已经通过inlineProps参数传入
    if (part.startsWith('{') && part.endsWith('}')) {
      continue
    }

    // 处理引用类型（接口或类型别名）
    const typeName = part.trim()
    if (/^[A-Z_]\w*$/i.test(typeName)) {
      if (typeMap.has(typeName)) {
        const typeStr = typeMap.get(typeName) || ''

        // 尝试解析类型表示
        if (typeStr.startsWith('{') && typeStr.endsWith('}')) {
          try {
            // 去掉花括号，获取内容
            const content = typeStr.slice(1, -1).trim()

            // 解析属性定义并合并
            const propRegex = /(\w+)\s*:\s*(\{[^{}]*\})/g
            let match

            while ((match = propRegex.exec(content)) !== null) {
              const [, propName, propValue] = match
              if (propName && propValue) {
                try {
                  // 尝试解析属性值对象
                  // 将JavaScript对象字符串转换为实际对象
                  // 例如: { type: String, required: true } => { "type": "String", "required": true }
                  const cleanValue = propValue
                    .replace(/\b(String|Number|Boolean|Array|Object|Function|Symbol|BigInt)\b/g, '"$1"')
                    .replace(/(\w+):/g, '"$1":')
                    .replace(/'/g, '"')

                  try {
                    const propValueObj = JSON.parse(cleanValue)

                    // 只有当现有属性不存在或新属性是必需的时才覆盖
                    if (!mergedProps[propName] || propValueObj.required === true) {
                      mergedProps[propName] = {
                        type: propValueObj.type || 'String',
                        required: propValueObj.required !== false,
                      }
                    }
                  }
                  catch (parseError) {
                    // 如果JSON解析失败，尝试使用正则提取type和required
                    const typeMatch = propValue.match(/type\s*:\s*([^,}]+)/)
                    const requiredMatch = propValue.match(/required\s*:\s*(true|false)/)

                    if (typeMatch && typeMatch[1]) {
                      mergedProps[propName] = {
                        type: typeMatch[1].trim(),
                        required: !(requiredMatch && requiredMatch[1] === 'false'),
                      }
                    }
                  }
                }
                catch (e) {
                  console.error(`解析属性 ${propName} 失败:`, e)
                }
              }
            }
          }
          catch (e) {
            console.error(`解析交叉类型 ${typeName} 失败:`, e)
          }
        }
      }
    }
  }

  // 将合并后的属性转换为字符串
  return stringifyProps(mergedProps)
}
