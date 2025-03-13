/**
 * 检查文件内容是否包含 styled 相关代码
 */
export function hasStyledComponents(code: string): boolean {
  return /styled\.[a-zA-Z]+/.test(code)
}

/**
 * 将TypeScript基本类型名称转换为首字母大写形式
 */
export function convertTypeNamesToCapitalized(typeParams: string): string {
  return typeParams.replace(
    /\b(string|boolean|number|any|void|null|undefined|never|object|symbol|bigint)\b/g,
    match => match.charAt(0).toUpperCase() + match.slice(1),
  )
}

/**
 * 检查泛型参数中的尖括号是否平衡
 */
export function isBalancedGeneric(text: string): boolean {
  let depth = 0
  let inString = false
  let stringDelimiter = ''
  let inTemplate = false
  let i = 0

  while (i < text.length) {
    const char = text[i]

    // 处理字符串
    if (!inString && (char === '"' || char === '\'' || char === '`')) {
      inString = true
      stringDelimiter = char
      if (char === '`') {
        inTemplate = true
      }
    }
    else if (inString && char === stringDelimiter && text[i - 1] !== '\\') {
      inString = false
      if (stringDelimiter === '`') {
        inTemplate = false
      }
      stringDelimiter = ''
    }
    // 处理模板字符串中的表达式
    else if (inTemplate && char === '$' && i + 1 < text.length && text[i + 1] === '{') {
      // 跳过表达式内容
      i += 2
      let braceDepth = 1
      while (i < text.length && braceDepth > 0) {
        if (text[i] === '{') {
          braceDepth++
        }
        else if (text[i] === '}') {
          braceDepth--
        }
        else if (text[i] === '"' || text[i] === '\'' || text[i] === '`') {
          // 跳过表达式中的字符串
          const innerDelimiter = text[i]
          i++
          while (i < text.length && (text[i] !== innerDelimiter || text[i - 1] === '\\')) {
            i++
          }
        }
        i++
      }
      continue
    }
    // 处理尖括号
    else if (!inString) {
      if (char === '<') {
        depth++
      }
      else if (char === '>') {
        depth--
        if (depth < 0) {
          return false // 不平衡
        }
      }
    }

    i++
  }

  return depth === 0
}
