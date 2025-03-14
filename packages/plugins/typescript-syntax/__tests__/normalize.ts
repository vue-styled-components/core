export function normalizeString(str?: string) {
  if (!str)
    return ''
  return str
    .replace(/\s+/g, ' ') // 将多个空白字符替换为单个空格
    .replace(/\s*([{}():,])\s*/g, '$1') // 移除括号、冒号和逗号周围的空格
    .trim()
}

/**
 * 解析styled组件的props字符串为JavaScript对象
 * 例如: { type: String, required: false } => { type: 'String', required: false }
 *
 * @param propsString 来自转换结果的props字符串
 * @return 解析后的JavaScript对象
 */
export function parseProps(propsString?: string): Record<string, any> {
  if (!propsString)
    return {}

  try {
    // 预处理字符串以便能够正确解析
    let processedStr = propsString

    // 1. 移除多余空格
    processedStr = processedStr.replace(/\s+/g, ' ').trim()

    // 2. 将构造函数名称转换为字符串
    processedStr = processedStr.replace(/(String|Number|Boolean|Array|Object|Function|Date|RegExp|Promise|Set|Map|Symbol|BigInt)/g, '"$1"')

    // 3. 为属性名添加引号（如果没有）
    processedStr = processedStr.replace(/([a-z$_][\w$]*)(?=\s*:)/gi, '"$1"')

    // 4. 保持 true/false/null/undefined 值不变
    processedStr = processedStr.replace(/"(true|false|null|undefined)"(?=(,|\}|$))/g, '$1')

    // 5. 处理可能嵌套的对象
    // 这个简单的正则可能无法处理所有复杂情况，但适用于大多数props对象

    return JSON.parse(processedStr)
  }
  catch (e) {
    console.error('解析props字符串失败:', e)
    console.error('字符串内容:', propsString)
    return {}
  }
}

/**
 * 从转换结果中提取props对象
 *
 * @param code 转换后的代码
 * @param component 组件名称，用于定位代码中的styled组件定义
 * @return 解析后的props对象
 */
export function extractPropsFromCode(props?: string, component: string = ''): Record<string, any> {
  if (!props)
    return {}

  // 直接传递提取的props对象字符串
  return parseProps(props)
}
