import type { TypeContext } from './type-context'
import babelTraverse from '@babel/traverse'
/**
 * 类型收集和处理的辅助函数
 */
import { traverseAst } from './ast-traverser'
import { parsePropsFromTypeMap, useContext } from './type-context'
import { extractTypeInfo } from './type-converter'
import { formatPropTypeToJS } from './type-processors'

const traverse = ((babelTraverse as any).default as typeof babelTraverse) || babelTraverse

/**
 * 从 AST 中收集所有类型信息
 *
 * @param ast 要分析的 AST
 * @param useBabelTraverse 是否使用 Babel 的 traverse 遍历 AST
 */
export function collectTypesFromAST(ast: any, useBabelTraverse: boolean = true): void {
  if (!ast)
    return

  // 获取全局上下文
  const context = useContext()

  const collector = (node: any) => {
    if (node.type === 'ImportDeclaration') {
      collectImportedTypes(node, context.importedTypes)
    }
    else if (node.type === 'TSInterfaceDeclaration') {
      collectInterfaceDefinition(node, context.typeMap, context)
    }
    else if (node.type === 'TSTypeAliasDeclaration') {
      collectTypeAliasDefinition(node, context.typeMap, context.typeAliasMap)
    }
  }

  if (useBabelTraverse) {
    // 使用 Babel 的 traverse 函数
    traverse(ast, {
      ImportDeclaration(path) {
        collectImportedTypes(path.node, context.importedTypes)
      },
      TSInterfaceDeclaration(path) {
        collectInterfaceDefinition(path.node, context.typeMap, context)
      },
      TSTypeAliasDeclaration(path) {
        collectTypeAliasDefinition(path.node, context.typeMap, context.typeAliasMap)
      },
    })
  }
  else {
    // 使用自定义的 traverseAst 函数或直接遍历
    if (Array.isArray(ast)) {
      for (const node of ast) {
        collector(node)
      }
    }
    else if (ast.body && Array.isArray(ast.body)) {
      for (const node of ast.body) {
        collector(node)
      }
    }
    else {
      traverseAst(ast, collector)
    }
  }
}

/**
 * 收集接口定义
 *
 * @param node 接口节点
 * @param typeMap 存储接口定义的映射
 * @param context 可选的类型上下文，用于处理接口继承
 */
export function collectInterfaceDefinition(node: any, typeMap: Map<string, string>, context?: TypeContext): void {
  if (node.type !== 'TSInterfaceDeclaration' || !node.id || !node.id.name) {
    return
  }

  const interfaceName = node.id.name
  const interfaceBody = node.body
  const props: Record<string, string> = {}

  // 处理接口继承
  if (node.extends && Array.isArray(node.extends) && node.extends.length > 0) {
    for (const extendedInterface of node.extends) {
      if (extendedInterface.expression && extendedInterface.expression.type === 'Identifier') {
        const baseInterfaceName = extendedInterface.expression.name

        // 尝试获取基础接口的属性
        if (typeMap.has(baseInterfaceName)) {
          try {
            const baseProps = parsePropsFromTypeMap(typeMap.get(baseInterfaceName) || '{}')
            // 合并基础接口的属性
            Object.assign(props, baseProps)
          }
          catch (e) {
            console.error(`解析基础接口 ${baseInterfaceName} 失败:`, e)
          }
        }
      }
    }
  }

  // 处理接口自身的属性，覆盖继承的属性
  if (interfaceBody && interfaceBody.body && Array.isArray(interfaceBody.body)) {
    for (const member of interfaceBody.body) {
      if (member.type === 'TSPropertySignature' && member.key && member.key.name) {
        const propName = member.key.name
        const isOptional = member.optional === true

        let jsType = '{ type: String, required: true }'

        if (member.typeAnnotation && member.typeAnnotation.typeAnnotation) {
          const propType = extractTypeInfo(member.typeAnnotation.typeAnnotation)
          jsType = formatPropTypeToJS(propType, isOptional)
        }

        props[propName] = jsType
      }
    }
  }

  // 转换属性对象为字符串表示
  const propsStr = Object.entries(props).map(([name, type]) => `${name}: ${type}`).join(', ')
  typeMap.set(interfaceName, `{ ${propsStr} }`)
}

/**
 * 收集类型别名定义
 *
 * @param node 类型别名节点
 * @param typeMap 存储类型别名字符串表示的映射
 * @param typeAliasMap 存储类型别名节点的映射
 */
export function collectTypeAliasDefinition(node: any, typeMap: Map<string, string>, typeAliasMap: Map<string, any>): void {
  if (node.type !== 'TSTypeAliasDeclaration' || !node.id || !node.id.name) {
    return
  }

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

/**
 * 收集导入类型定义
 *
 * @param node 导入声明节点
 * @param importedTypes 存储导入类型的映射
 */
export function collectImportedTypes(node: any, importedTypes: Map<string, { source: string, originalName?: string }>): void {
  if (node.type !== 'ImportDeclaration') {
    return
  }

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
