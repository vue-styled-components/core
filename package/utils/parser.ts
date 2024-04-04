export function parseCSS(stylesString: string) {
  const styles: Record<string, any> = {}
  const regex = /([a-z-]+):\s*([^;]+);/g // 匹配属性名和属性值的正则表达式
  let match
  while ((match = regex.exec(stylesString)) !== null) {
    const propertyName = match[1].trim()
    styles[propertyName] = match[2].trim()
  }
  return styles
}
