export function normalizeString(str?: string) {
  if (!str)
    return ''
  return str
    .replace(/\s+/g, ' ') // 将多个空白字符替换为单个空格
    .replace(/\s*([{}():,])\s*/g, '$1') // 移除括号、冒号和逗号周围的空格
    .trim()
}
