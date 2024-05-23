import { ExpressionType, generateClassName, insertExpressions } from '@/utils'
import { injectStyle } from '@/utils/injectStyle'

export function cssClass(cssStrings: TemplateStringsArray, ...interpolations: (ExpressionType<any> | ExpressionType<any>[])[]): string {
  const className = generateClassName()
  injectStyle(className, insertExpressions(cssStrings, interpolations), {})

  return className
}
