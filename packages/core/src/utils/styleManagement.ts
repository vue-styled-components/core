import type { Element } from 'stylis'
import type { ExpressionType } from './insertExpressions'
import { compile, middleware, prefixer, serialize, stringify } from 'stylis'
import { getStyleConfig } from '../config'
import { plugin } from '../plugins'
import { applyExpressions } from './applyExpressions'
import { batchUpdater } from './batchUpdater'
import { performanceMonitor } from './performanceMonitor'
import { styleCache } from './styleCache'

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

// 设置批量更新器的插入函数
batchUpdater.setInsertFunction(insert)

export function removeStyle(className: string): void {
  if (!tags.length) {
    return
  }
  for (const tag of tags) {
    if (!tag?.childNodes?.length) {
      continue
    }
    for (const node of tag.childNodes) {
      if (node.nodeValue?.startsWith(`.${className}`)) {
        node.remove()
        break
      }
    }
  }
}

export function injectStyle<T>(className: string, cssWithExpression: ExpressionType<T>[], context: Record<string, any>): string[] {
  const config = getStyleConfig()

  if (config.enableCache) {
    // 尝试从缓存获取
    const cached = styleCache.get(cssWithExpression, context, className)
    if (cached) {
      performanceMonitor.recordCacheHit()

      // 使用批量更新器调度样式插入
      const config = getStyleConfig()
      if (config.enableBatchUpdates) {
        batchUpdater.scheduleUpdate(className, cached.css)
      }
      else {
        insert(className, cached.css)
      }
      return [...cached.tailwindClasses]
    }

    performanceMonitor.recordCacheMiss()
  }

  const endTimer = performanceMonitor.startStyleCalculation()

  // 计算新样式
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

  // 缓存结果
  styleCache.set(cssWithExpression, context, compiledCss, tailwindClasses, className)

  // 使用批量更新器调度样式插入
  if (config.enableBatchUpdates) {
    batchUpdater.scheduleUpdate(className, compiledCss)
  }
  else {
    insert(className, compiledCss)
  }

  endTimer()
  return tailwindClasses
}
