import type { BaseContext } from '../styled'
import type { ExpressionType } from '../utils'
import { insertExpressions } from '../utils'

export function css<T = BaseContext<any>>(
  strings: TemplateStringsArray,
  ...interpolations: (ExpressionType<T> | ExpressionType<T>[])[]
): ExpressionType<T>[] {
  return insertExpressions<T>(strings, interpolations)
}
