import type { TransformResult } from './types'
import MagicString from 'magic-string'
import { analyzeTypeParameter, traverseAst } from './ast-traverser'
import { convertToJSTypes, formatPropTypeToJS, handleMultilineObject, parseInlineProps, stringifyProps } from './transform'
import { extractTypeInfo } from './type-converter'

/**
 * 转换Vue单文件组件中的styled组件语法
 *
 * @param code 原始Vue文件代码
 * @param id 文件ID
 * @param descriptor Vue文件描述符
 * @param scriptBlock 编译后的script块
 * @returns 转换结果，如果没有变化则为null
 */
export function transformVueSFC(
  code: string,
  id: string,
  descriptor: any,
  scriptBlock: any,
): TransformResult | null {
  // 如果没有script块，则不需要转换
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null
  }

  // 获取AST
  const ast = scriptBlock.scriptSetupAst || scriptBlock.scriptAst

  // 如果没有AST，则无法进行基于AST的转换
  if (!ast) {
    return null
  }

  // 获取script在原始代码中的偏移量
  const scriptStartOffset = scriptBlock.loc.start.offset

  // 使用MagicString直接操作原始代码
  const s = new MagicString(code)

  // 是否有修改
  let hasChanges = false

  // 存储接口和类型定义，用于后续转换引用类型
  const typeMap = new Map<string, string>()
  // 存储导入的类型及其来源
  const importedTypes = new Map<string, { source: string, originalName?: string }>()
  // 存储类型别名的实际类型内容
  const typeAliasMap = new Map<string, any>()

  // 第一遍扫描：收集所有导入类型和类型定义
  const collectTypeDefinitions = (node: any) => {
    // 处理导入语句，收集导入的类型
    if (node.type === 'ImportDeclaration') {
      const importSource = node.source?.value

      // 遍历导入的所有说明符
      if (importSource && node.specifiers && Array.isArray(node.specifiers)) {
        for (const specifier of node.specifiers) {
          // 获取导入的名称
          let importedName = ''
          let originalName = ''

          // 处理不同类型的导入
          if (specifier.type === 'ImportSpecifier') {
            // 命名导入: import { Type } from '...'
            importedName = specifier.local?.name
            originalName = specifier.imported?.name || importedName
          }
          else if (specifier.type === 'ImportDefaultSpecifier') {
            // 默认导入: import Type from '...'
            importedName = specifier.local?.name
            originalName = 'default'
          }
          else if (specifier.type === 'ImportNamespaceSpecifier') {
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
    }

    // 处理接口定义
    if (node.type === 'TSInterfaceDeclaration' && node.id && node.id.name) {
      const interfaceName = node.id.name
      const interfaceBody = node.body

      if (interfaceBody && interfaceBody.body && Array.isArray(interfaceBody.body)) {
        const props: string[] = []

        // 遍历接口成员
        for (const member of interfaceBody.body) {
          if (member.type === 'TSPropertySignature' && member.key && member.key.name) {
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

        // 以JS构造函数格式存储接口定义
        typeMap.set(interfaceName, `{ ${props.join(', ')} }`)
      }
    }

    // 处理类型别名
    if (node.type === 'TSTypeAliasDeclaration' && node.id && node.id.name) {
      const typeName = node.id.name
      const typeAnnotation = node.typeAnnotation

      // 保存类型别名的实际类型节点，用于后续引用
      typeAliasMap.set(typeName, typeAnnotation)

      // 如果是类型字面量，处理其中的属性
      if (typeAnnotation && typeAnnotation.type === 'TSTypeLiteral'
        && typeAnnotation.members && Array.isArray(typeAnnotation.members)) {
        const props: string[] = []

        // 遍历类型成员
        for (const member of typeAnnotation.members) {
          if (member.type === 'TSPropertySignature' && member.key && member.key.name) {
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
  }

  // 第二遍：收集声明中的styled组件并转换
  const findAndTransformStyledComponents = (node: any) => {
    // 检查是否是变量声明
    if (node.type === 'VariableDeclaration') {
      // 遍历所有声明
      for (const declaration of node.declarations) {
        // 查找初始化表达式
        const init = declaration.init
        if (init && init.type === 'TaggedTemplateExpression') {
          const tag = init.tag

          // 查找styled.tag<Props> 模式
          // 首先看是否是TypeCastExpression或TSAsExpression（泛型标记可能被解析为类型断言）
          if (tag && (tag.type === 'TSAsExpression' || tag.type === 'TypeCastExpression')) {
            const expression = tag.expression

            // 检查是否是成员表达式 styled.tag
            if (expression && expression.type === 'MemberExpression'
              && expression.object && expression.object.type === 'Identifier'
              && expression.object.name === 'styled'
              && expression.property && expression.property.type === 'Identifier') {
              // 获取HTML标签名称
              const tagName = expression.property.name

              // 获取类型参数（在TypeAnnotation或typeAnnotation中）
              const typeAnnotation = tag.typeAnnotation
              if (typeAnnotation) {
                // 获取类型在源码中的位置
                const typeStart = scriptStartOffset + (typeAnnotation.start || 0)
                const typeEnd = scriptStartOffset + (typeAnnotation.end || 0)

                // 如果无法获取位置信息，则跳过
                if (typeStart === scriptStartOffset || typeEnd === scriptStartOffset)
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
                            params = stringifyProps(objProps)
                          }
                          catch (e) {
                            console.error('Error parsing inline object:', e)
                          }
                        }
                      }
                    }
                  }
                }

                // 查找成员表达式在源码中的位置
                const exprStart = scriptStartOffset + expression.start

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
          if (tag && tag.type === 'MemberExpression'
            && tag.object && tag.object.type === 'Identifier'
            && tag.object.name === 'styled'
            && tag.property && tag.property.type === 'Identifier') {
            // 查找泛型参数（可能在父节点或相邻节点）
            let typeParams = null
            let typeParamsStart = 0
            let typeParamsEnd = 0

            // 检查是否有typeParameters属性
            if (tag.typeParameters) {
              typeParams = tag.typeParameters
              typeParamsStart = scriptStartOffset + (typeParams.start || 0)
              typeParamsEnd = scriptStartOffset + (typeParams.end || 0)
            }

            // 如果没有找到类型参数，查找下一个可能的节点
            if (!typeParams && init.typeParameters) {
              typeParams = init.typeParameters
              typeParamsStart = scriptStartOffset + (typeParams.start || 0)
              typeParamsEnd = scriptStartOffset + (typeParams.end || 0)
            }

            if (typeParams && typeParamsStart > scriptStartOffset && typeParamsEnd > scriptStartOffset) {
              // 获取HTML标签名称
              const tagName = tag.property.name

              // 提取泛型参数文本
              const genericParams = code.slice(typeParamsStart, typeParamsEnd)

              // 检查是否是有效的泛型参数
              if (genericParams.startsWith('<') && genericParams.endsWith('>')) {
                // 提取尖括号内的内容
                const params = genericParams.slice(1, -1).trim()

                // 分析类型参数
                const typeInfo = analyzeTypeParameter(params)
                let finalParams = params

                if (typeInfo.isReference) {
                  const typeName = typeInfo.name

                  // 处理引用类型
                  if (typeMap.has(typeName) || typeAliasMap.has(typeName)) {
                    // 使用预先收集的类型信息
                    finalParams = typeMap.get(typeName) || typeAliasMap.get(typeName)
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
                          finalParams = stringifyProps(objProps)
                        }
                        catch (e) {
                          console.error('Error parsing inline object:', e)
                        }
                      }
                    }
                  }
                }

                // 替换 styled.tag<Props> 为 styled('tag', Props)
                const nodeStart = scriptStartOffset + (tag.start || 0)
                if (nodeStart === scriptStartOffset)
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
    }
  }

  // 收集接口和类型定义
  if (Array.isArray(ast)) {
    for (const node of ast) {
      collectTypeDefinitions(node)
    }
  }
  else if (ast.body && Array.isArray(ast.body)) {
    for (const node of ast.body) {
      collectTypeDefinitions(node)
    }
  }
  else {
    traverseAst(ast, collectTypeDefinitions)
  }

  // 处理AST的顶层节点
  if (Array.isArray(ast)) {
    // AST是数组形式，直接遍历顶层节点
    for (const node of ast) {
      findAndTransformStyledComponents(node)
    }
  }
  else if (ast.body && Array.isArray(ast.body)) {
    // AST有body属性且为数组，遍历body中的节点
    for (const node of ast.body) {
      findAndTransformStyledComponents(node)
    }
  }
  else {
    // 其他情况，使用通用的遍历
    traverseAst(ast, findAndTransformStyledComponents)
  }

  // 如果没有变更，返回null
  if (!hasChanges) {
    return null
  }

  return {
    code: s.toString(),
    map: s.generateMap({ source: id, includeContent: true }),
  }
}
