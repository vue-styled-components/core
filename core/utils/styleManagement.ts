import { applyExpressions, ExpressionType } from '@/utils/index'

const MAX_SIZE = 65536

let ctx: number = 0
const insertedRuleMap: Record<string, Text> = {}
const tags: HTMLStyleElement[] = []

function createStyleTag(): HTMLStyleElement {
  const style = document.createElement('style')
  document.head.appendChild(style)
  tags.push(style)
  return style
}

function insert(className: string, cssString: string) {
  ctx++

  let styleTag = tags[tags.length - 1]

  if (!styleTag || ctx >= MAX_SIZE) {
    styleTag = createStyleTag()
    ctx = 0
  }

  const ruleNode = insertedRuleMap[className]
  let rule = `.${className} { ${cssString} }`

  if (className === 'global' || /^kf-.+/.test(className)) {
    rule = cssString
  }

  if (ruleNode) {
    ruleNode.data = rule
    return
  }
  const cssTextNode = document.createTextNode(rule)
  styleTag.appendChild(cssTextNode)
  insertedRuleMap[className] = cssTextNode
}

export function removeStyle(className: string): void {
  for (const tag of tags) {
    for (const node of tag.childNodes) {
      if (node.nodeValue?.includes(className)) {
        node.remove()
        break
      }
    }
  }
}

export function injectStyle<T>(className: string, cssWithExpression: ExpressionType<T>[], context: Record<string, any>): void {
  const appliedCss = applyExpressions(cssWithExpression, context).join('')
  insert(className, appliedCss)
}
