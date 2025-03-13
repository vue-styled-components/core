import type { ImportedType, TypeInfo } from '../types/types'

/**
 * 提取类型信息
 */
export function extractTypeInfo(typeNode: any): TypeInfo {
  if (!typeNode)
    return { type: 'any' }

  switch (typeNode.type) {
    case 'TSStringKeyword':
      return { type: 'String' }
    case 'TSNumberKeyword':
      return { type: 'Number' }
    case 'TSBooleanKeyword':
      return { type: 'Boolean' }
    case 'TSArrayType':
      return { type: 'Array' }
    case 'TSObjectKeyword':
      return { type: 'Object' }
    case 'TSFunctionType':
      return { type: 'Function' }
    case 'TSTypeLiteral': {
      const propsObj: Record<string, any> = {}
      if (typeNode.members && Array.isArray(typeNode.members)) {
        for (const member of typeNode.members) {
          if (member.type === 'TSPropertySignature' && member.key && member.key.name) {
            const propName = member.key.name
            let propType: TypeInfo = { type: 'any' }

            if (member.typeAnnotation && member.typeAnnotation.typeAnnotation) {
              propType = extractTypeInfo(member.typeAnnotation.typeAnnotation)
            }

            propType.optional = !!member.optional
            propsObj[propName] = propType
          }
        }
      }
      return {
        type: 'object',
        properties: propsObj,
      }
    }
    case 'TSUnionType': {
      return {
        type: 'union',
        types: typeNode.types ? typeNode.types.map((t: any) => extractTypeInfo(t)) : [],
      }
    }
    case 'TSIntersectionType': {
      return {
        type: 'intersection',
        types: typeNode.types ? typeNode.types.map((t: any) => extractTypeInfo(t)) : [],
      }
    }
    case 'TSTypeReference': {
      if (typeNode.typeName && typeNode.typeName.name) {
        const refName = typeNode.typeName.name
        return {
          type: 'reference',
          name: refName,
          typeParameters: typeNode.typeParameters
            ? typeNode.typeParameters.params.map((p: any) => extractTypeInfo(p))
            : undefined,
        }
      }
      return { type: 'any' }
    }
    case 'TSLiteralType': {
      if (typeNode.literal) {
        if (typeNode.literal.type === 'StringLiteral') {
          return { type: 'String', literal: typeNode.literal.value }
        }
        else if (typeNode.literal.type === 'NumericLiteral') {
          return { type: 'Number', literal: typeNode.literal.value }
        }
        else if (typeNode.literal.type === 'BooleanLiteral') {
          return { type: 'Boolean', literal: typeNode.literal.value }
        }
      }
      return { type: 'any' }
    }
    default:
      return { type: 'any' }
  }
}

/**
 * 获取联合类型的JavaScript构造函数
 */
export function getUnionJSType(unionTypes: any[]): string {
  if (!unionTypes || !Array.isArray(unionTypes)) {
    return 'any'
  }

  const allStringLiterals = unionTypes.every((type: any) =>
    type.type === 'TSStringKeyword'
    || (type.type === 'TSLiteralType' && type.literal && type.literal.type === 'StringLiteral'),
  )

  if (allStringLiterals) {
    return 'String'
  }

  const allNumberLiterals = unionTypes.every((type: any) =>
    type.type === 'TSNumberKeyword'
    || (type.type === 'TSLiteralType' && type.literal && type.literal.type === 'NumericLiteral'),
  )

  if (allNumberLiterals) {
    return 'Number'
  }

  const hasBooleanTypes = unionTypes.every((type: any) =>
    type.type === 'TSBooleanKeyword'
    || (type.type === 'TSLiteralType' && type.literal
      && (type.literal.value === true || type.literal.value === false)),
  )

  if (hasBooleanTypes) {
    return 'Boolean'
  }

  const hasNullish = unionTypes.some((type: any) =>
    type.type === 'TSNullKeyword' || type.type === 'TSUndefinedKeyword',
  )

  if (hasNullish) {
    for (const type of unionTypes) {
      if (type.type !== 'TSNullKeyword' && type.type !== 'TSUndefinedKeyword') {
        const typeInfo = extractTypeInfo(type)
        return typeInfo.type
      }
    }
  }

  for (const type of unionTypes) {
    if (type.type === 'TSTypeReference' && type.typeName && type.typeName.name) {
      return type.typeName.name
    }
  }

  return 'any'
}

/**
 * 将类型引用转换为 Vue props 对象
 */
export function convertToPropsDef(
  typeInfo: TypeInfo,
  processedTypes: Set<string> = new Set(),
  typeMap: Map<string, string>,
  typeAliasMap: Map<string, any>,
  importedTypes: Map<string, ImportedType>,
): string {
  if (typeof typeInfo === 'string') {
    return typeInfo
  }

  if (typeInfo && typeInfo.type === 'reference' && typeInfo.name) {
    const typeName = typeInfo.name

    if (processedTypes.has(typeName)) {
      return 'Object'
    }
    processedTypes.add(typeName)

    if (typeMap.has(typeName)) {
      try {
        const typeDefStr = typeMap.get(typeName) || '{}'
        const typeDef = JSON.parse(typeDefStr)
        return convertPropsObjToVueProps(typeDef, processedTypes, typeMap, typeAliasMap, importedTypes)
      }
      catch {
        return typeName
      }
    }

    if (typeAliasMap.has(typeName)) {
      const aliasedType = typeAliasMap.get(typeName)
      return resolveAliasedType(aliasedType, processedTypes, typeMap, typeAliasMap, importedTypes)
    }

    if (importedTypes.has(typeName)) {
      return typeName
    }

    return typeName
  }

  if (typeInfo && typeInfo.type === 'union') {
    const types = typeInfo.types || []

    const basicTypeMap: Record<string, string> = {
      String: 'String',
      Number: 'Number',
      Boolean: 'Boolean',
      Array: 'Array',
      Object: 'Object',
      Function: 'Function',
    }

    const basicTypes = types
      .map((t: any) => t.type)
      .filter((t: string) => basicTypeMap[t])

    if (basicTypes.length > 0
      && basicTypes.every((t: string) => t === basicTypes[0])) {
      return basicTypeMap[basicTypes[0]]
    }

    for (const t of types) {
      if (t.type === 'reference' && t.name) {
        const refTypeName = t.name
        if (typeMap.has(refTypeName) || typeAliasMap.has(refTypeName)
          || importedTypes.has(refTypeName)) {
          return convertToPropsDef(t, processedTypes, typeMap, typeAliasMap, importedTypes)
        }
      }
    }

    return getUnionJSType(types)
  }

  if (typeInfo && typeInfo.type === 'intersection') {
    const mergedProps: Record<string, any> = {}
    const types = typeInfo.types || []

    for (const t of types) {
      if (t.type === 'object' && t.properties) {
        Object.assign(mergedProps, t.properties)
      }
      else if (t.type === 'reference' && t.name) {
        const refTypeName = t.name
        if (typeMap.has(refTypeName)) {
          try {
            const typeDefStr = typeMap.get(refTypeName) || '{}'
            const typeDef = JSON.parse(typeDefStr)
            Object.assign(mergedProps, typeDef)
          }
          catch {
            // 忽略解析错误
          }
        }
        else if (typeAliasMap.has(refTypeName)) {
          const aliasedType = typeAliasMap.get(refTypeName)
          const resolvedType = extractTypeInfo(aliasedType)

          if (resolvedType.type === 'object' && resolvedType.properties) {
            Object.assign(mergedProps, resolvedType.properties)
          }
        }
      }
    }

    if (Object.keys(mergedProps).length > 0) {
      return convertPropsObjToVueProps(mergedProps, processedTypes, typeMap, typeAliasMap, importedTypes)
    }

    return 'Object'
  }

  if (typeof typeInfo === 'object' && typeInfo !== null) {
    return convertPropsObjToVueProps(typeInfo, processedTypes, typeMap, typeAliasMap, importedTypes)
  }

  return 'any'
}

/**
 * 解析类型别名指向的实际类型
 */
export function resolveAliasedType(
  typeNode: any,
  processedTypes: Set<string>,
  typeMap: Map<string, string>,
  typeAliasMap: Map<string, any>,
  importedTypes: Map<string, ImportedType>,
): string {
  if (!typeNode)
    return 'any'

  const typeInfo = extractTypeInfo(typeNode)
  return convertToPropsDef(typeInfo, processedTypes, typeMap, typeAliasMap, importedTypes)
}

/**
 * 将类型对象转换为Vue props格式字符串
 */
export function convertPropsObjToVueProps(
  propsObj: Record<string, any>,
  processedTypes: Set<string>,
  typeMap: Map<string, string>,
  typeAliasMap: Map<string, any>,
  importedTypes: Map<string, ImportedType>,
): string {
  const parts = []

  for (const [propName, propTypeInfo] of Object.entries(propsObj)) {
    let propType = 'any'

    if (typeof propTypeInfo === 'string') {
      propType = propTypeInfo
    }
    else if (propTypeInfo && propTypeInfo.type) {
      if (propTypeInfo.type === 'reference') {
        propType = convertToPropsDef(propTypeInfo, processedTypes, typeMap, typeAliasMap, importedTypes)
      }
      else {
        propType = propTypeInfo.type
      }
    }

    parts.push(`${propName}: ${propType}`)
  }

  return `{ ${parts.join(', ')} }`
}
