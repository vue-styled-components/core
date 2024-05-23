import { type ExpressionType, insertExpressions } from '@/utils'

export function css<T = any>(
  strings: TemplateStringsArray,
  ...interpolations: (ExpressionType<T> | ExpressionType<T>[])[]
): ExpressionType<T>[] {
  return insertExpressions<T>(strings, interpolations)
}
