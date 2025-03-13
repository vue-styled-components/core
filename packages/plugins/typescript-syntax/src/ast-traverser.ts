/**
 * 遍历AST树
 *
 * @param node 当前节点
 * @param visitor 访问者函数
 */
export function traverseAst(node: any, visitor: (node: any) => void) {
  if (!node || typeof node !== 'object')
    return

  // 调用访问者函数
  visitor(node)

  // 递归遍历所有子节点
  for (const key in node) {
    if (key === 'parent')
      continue // 跳过父节点引用，避免循环引用

    const child = node[key]
    if (Array.isArray(child)) {
      // 如果是数组，递归遍历每个元素
      for (const item of child) {
        if (item && typeof item === 'object') {
          // 添加父节点引用，方便向上查找
          item.parent = node
          traverseAst(item, visitor)
        }
      }
    }
    else if (child && typeof child === 'object') {
      // 添加父节点引用，方便向上查找
      child.parent = node
      traverseAst(child, visitor)
    }
  }
}

/**
 * 分析类型参数，识别是否是引用类型以及是否带有泛型参数
 */
export function analyzeTypeParameter(paramText: string): { isReference: boolean, name: string, typeParameters?: any[] } {
  // 检查是否是简单引用类型（没有泛型参数）
  const simpleRefMatch = /^([A-Z_]\w*)$/.exec(paramText)
  if (simpleRefMatch) {
    return {
      isReference: true,
      name: simpleRefMatch[1],
    }
  }

  // 检查是否是带有泛型参数的引用类型
  const genericRefMatch = /^([A-Z_]\w*)\s*<(.+)>$/.exec(paramText)
  if (genericRefMatch) {
    const baseName = genericRefMatch[1]
    // 暂时不处理泛型参数的内容
    const _typeParamsText = genericRefMatch[2]

    // 简单处理，实际上需要更复杂的解析来处理嵌套的泛型参数
    return {
      isReference: true,
      name: baseName,
      typeParameters: [{ type: 'any' }], // 简化处理
    }
  }

  return {
    isReference: false,
    name: '',
  }
}
