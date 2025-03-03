import type { ExpressionType } from '../utils'
import { generateClassName, injectStyle, insertExpressions } from '../utils'

export function cssClass(cssStrings: TemplateStringsArray, ...interpolations: (ExpressionType<any> | ExpressionType<any>[])[]): string {
  const className = generateClassName()
  injectStyle(className, insertExpressions(cssStrings, interpolations), {})

  return className
}
