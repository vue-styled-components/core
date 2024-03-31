export default function parseCSS(stylesString) {
  const styles = {}
  const regex = /([a-z-]+):\s*([^;]+);/g // 匹配属性名和属性值的正则表达式
  let match
  while ((match = regex.exec(stylesString)) !== null) {
    // console.log(match)
    const propertyName = match[1].trim() // 属性名
    const propertyValue = match[2].trim() // 属性值
    styles[propertyName] = propertyValue
  }
  console.log(styles)
  return styles
}
