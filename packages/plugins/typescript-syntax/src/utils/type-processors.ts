/**
 * 通用类型处理函数
 * 包含从transform.ts和vue-transformer.ts中提取的共享类型处理逻辑
 */

/**
 * 将TypeScript类型转换为Vue Props格式
 */
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
}

/**
 * 将属性映射转换为字符串形式
 */
export function stringifyProps(props: Record<string, { type: string, required: boolean }>): string {
  const entries = Object.entries(props).map(([key, { type, required }]) => {
    return `${key}: { type: ${type}, required: ${required} }`
  })

  return `{ ${entries.join(', ')} }`
}

/**
 * 解析内联属性对象
 */
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
      // 处理引用的类型别名
      else if (cleanType.includes('<') || /^[A-Z_]\w*$/i.test(cleanType)) {
        // 尝试获取基础类型名称和泛型参数
        const genericMatch = cleanType.match(/([A-Z_]\w*)<(.+)>/i)

        if (genericMatch) {
          // 处理泛型参数
          const [, baseTypeName, genericParams] = genericMatch

          // 检查基础类型是否在类型别名映射中
          if (typeAliasMap.has(baseTypeName)) {
            const typeAlias = typeAliasMap.get(baseTypeName)

            // 根据基础类型推断 Vue 类型
            const baseType = inferTypeFromTypeAlias(typeAlias)

            // 处理通用容器类型
            if (baseTypeName.toLowerCase() === 'array'
              || baseTypeName.toLowerCase() === 'set'
              || baseTypeName.toLowerCase().includes('list')) {
              type = 'Array'
            }
            else if (baseTypeName.toLowerCase() === 'map'
              || baseTypeName.toLowerCase() === 'record'
              || baseTypeName.toLowerCase().includes('dictionary')) {
              type = 'Object'
            }
            else {
              type = baseType
            }

            // 尝试处理泛型参数
            const params = genericParams.split(',')

            // 如果有泛型参数且是已知类型别名，递归处理
            if (params.length > 0) {
              const paramTypes = params.map((param) => {
                const paramName = param.trim()
                // 检查参数是否是类型别名
                if (typeAliasMap.has(paramName)) {
                  return inferTypeFromTypeAlias(typeAliasMap.get(paramName))
                }
                return 'Object' // 默认值
              })

              // 对一些特殊类型做特殊处理
              if (baseType === 'Array' && paramTypes.length === 1) {
                // 可以增强这里，针对数组元素类型做进一步处理
                type = 'Array'
              }
            }
          }
          else {
            // 检查是否是内置的泛型类型
            switch (baseTypeName.toLowerCase()) {
              case 'array':
              case 'set':
              case 'list':
                type = 'Array'
                break
              case 'map':
              case 'record':
              case 'dictionary':
                type = 'Object'
                break
              case 'promise':
                type = 'Object' // Promise通常解析为其内部类型，但这里简化为Object
                break
              default:
                type = 'Object'
            }
          }
        }
        // 处理非泛型的类型别名引用
        else if (typeAliasMap.has(cleanType)) {
          const typeAlias = typeAliasMap.get(cleanType)
          type = inferTypeFromTypeAlias(typeAlias)
        }
      }

      result[propName] = { type, required: !isOptional }
    }
  }

  return result
}

/**
 * 处理多行内联对象类型
 */
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
 * 从类型别名节点推断实际类型
 * 深入分析类型别名的结构，判断其实际类型
 */
function inferTypeFromTypeAlias(typeAlias: any): string {
  if (!typeAlias)
    return 'String'

  // 直接判断节点类型
  if (typeAlias.type === 'TSFunctionType'
    || typeAlias.type === 'ArrowFunctionType'
    || typeAlias.type === 'TSCallSignatureDeclaration') {
    return 'Function'
  }
  if (typeAlias.type === 'TSArrayType') {
    return 'Array'
  }
  if (typeAlias.type === 'TSObjectType'
    || typeAlias.type === 'TSTypeLiteral'
    || typeAlias.type === 'TSInterfaceBody') {
    return 'Object'
  }

  // 如果是其他节点类型，尝试深入分析
  if (typeAlias.typeAnnotation) {
    return inferTypeFromTypeAlias(typeAlias.typeAnnotation)
  }

  // 检查是否是泛型函数定义
  if (typeAlias.parameters
    || (typeAlias.params && typeAlias.params.length)
    || typeAlias.typeParameters) {
    // 存在参数或类型参数，很可能是函数类型
    return 'Function'
  }

  // 检查是否有参数和返回类型的结构（函数特征）
  if (typeAlias.parameters && typeAlias.returnType) {
    return 'Function'
  }

  // 检查名称是否暗示了类型
  const typeName = typeof typeAlias === 'object' && typeAlias.name
    ? typeAlias.name.toLowerCase()
    : ''

  if (typeName.includes('func')
    || typeName.includes('callback')
    || typeName.includes('handler')
    || typeName.includes('listener')) {
    return 'Function'
  }

  if (typeName.includes('array')
    || typeName.includes('list')
    || typeName.includes('collection')) {
    return 'Array'
  }

  if (typeName.includes('object')
    || typeName.includes('record')
    || typeName.includes('map')) {
    return 'Object'
  }

  // 默认为字符串类型
  return 'String'
}

/**
 * 将原始类型字符串转换为Vue Props格式
 */
export function convertToJSTypes(typeAliasMap: Map<string, any>, typeText: string): string {
  // 获取类型名称，并清除额外的空格
  const type = typeText.trim()

  // 判断是否为可选类型（以?结尾）
  const isOptional = type.endsWith('?')
  const cleanType = isOptional ? type.slice(0, -1).trim() : type

  // 将类型名称转换为构造函数
  const getType = (typeName: string): string => {
    // 处理基本类型
    switch (typeName.toLowerCase()) {
      case 'string': return 'String'
      case 'number': return 'Number'
      case 'boolean': return 'Boolean'
      case 'array': return 'Array'
      case 'object': return 'Object'
      case 'function': return 'Function'
      case 'symbol': return 'Symbol'
      case 'bigint': return 'BigInt'
      default: {
        // 检查是否是引用类型别名
        if (typeAliasMap.has(typeName.toLowerCase())) {
          const typeAlias = typeAliasMap.get(typeName.toLowerCase())
          return inferTypeFromTypeAlias(typeAlias)
        }
        return 'String' // 默认为String类型
      }
    }
  }

  /**
   * 通过类型特征判断类型
   */
  function analyzeTypeBySignature(typeStr: string): string {
    typeStr = typeStr.trim()

    // 检查函数特征: 箭头、括号参数等
    if (typeStr.includes('=>')
      || /\([^)]*\)\s*=>/.test(typeStr)
      || /\([^)]*\)\s*\{/.test(typeStr)) {
      return 'Function'
    }

    // 检查是否是带泛型参数的类型
    if (typeStr.includes('<') && typeStr.includes('>')) {
      // 提取基础类型名
      const baseType = typeStr.split('<')[0].trim().toLowerCase()

      // 检查是否有类型别名定义
      if (typeAliasMap.has(baseType)) {
        const typeAlias = typeAliasMap.get(baseType)
        return inferTypeFromTypeAlias(typeAlias)
      }

      // 基于命名约定进行启发式判断
      if (baseType.includes('func')
        || baseType.includes('callback')
        || baseType.includes('handler')
        || baseType.includes('predicate')) {
        return 'Function'
      }

      if (baseType === 'array'
        || baseType === 'list'
        || baseType.includes('collection')) {
        return 'Array'
      }

      if (baseType === 'record'
        || baseType === 'map'
        || baseType === 'dictionary'
        || baseType === 'object') {
        return 'Object'
      }

      // 检查泛型内部是否有 => 函数指示符
      if (typeStr.includes('=>')) {
        return 'Function'
      }
    }

    // 尝试从类型上下文中查找
    const simpleTypeName = typeStr.split(/[<({]/, 1)[0].trim().toLowerCase()
    if (typeAliasMap.has(simpleTypeName)) {
      const typeAlias = typeAliasMap.get(simpleTypeName)
      return inferTypeFromTypeAlias(typeAlias)
    }

    // 无法确定类型时的默认处理
    return getType(typeStr)
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
      || typeStr.startsWith('Func<')
      || /^[A-Z]+<[^\n\r>\u2028\u2029]*>.*=>.*$/i.test(typeStr)) {
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

    // 处理自定义泛型类型，如Func<T,U>
    if (typeStr.includes('<')) {
      const baseName = typeStr.split('<')[0].trim().toLowerCase()
      if (typeAliasMap.has(baseName)) {
        const typeAlias = typeAliasMap.get(baseName)
        if (typeAlias && typeAlias.type === 'TSFunctionType') {
          return 'Function'
        }
      }

      // 通用名称判断
      if (baseName === 'func' || baseName.includes('function') || baseName.includes('callback')) {
        return 'Function'
      }
    }

    // 处理泛型类型和其他类型
    return analyzeTypeBySignature(typeStr)
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
