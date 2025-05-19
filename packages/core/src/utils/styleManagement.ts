import type { ExpressionType } from '@/src/utils/index'
import type { Element } from 'stylis'
import { applyExpressions } from '@/src/utils/index'
import { compile, middleware, prefixer, serialize, stringify } from 'stylis'
import { plugin } from '../plugins'

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
  const rule = cssString

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
      if (node.nodeValue?.startsWith(`.${className}`)) {
        node.remove()
        break
      }
    }
  }
}

export function injectStyle<T>(className: string, cssWithExpression: ExpressionType<T>[], context: Record<string, any>): string[] {
  const tailwindClasses: string[] = []
  const appliedCss = applyExpressions(cssWithExpression, context, tailwindClasses).join('')
  let cssString = appliedCss
  if (className !== '') {
    cssString = `.${className}{${appliedCss}}`
  }
  let compiledCss = serialize(
    compile(cssString),
    middleware([
      (element: Element, index: number, children: Element[]) => {
        return plugin.runBeforeBuild(element, index, children)
      },
      prefixer,
      stringify,
    ]),
  )
  compiledCss = plugin.runAfterBuild(compiledCss)
  insert(className, compiledCss)

  return tailwindClasses
}
