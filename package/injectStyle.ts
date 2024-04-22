import { applyExpressions, ExpressionType } from '@/utils'

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

  if (className === 'global' || className === 'keyframes') {
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

export function injectStyle(className: string, cssWithExpression: (string | ExpressionType)[], context: Record<string, any>) {
  const appliedCss = applyExpressions(cssWithExpression, context).join('')
  console.log(appliedCss)
  insert(className, appliedCss)
}
