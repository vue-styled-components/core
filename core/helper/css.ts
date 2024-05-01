import { type ExpressionType, insertExpressions } from '@/utils'

export function css(strings: TemplateStringsArray, ...interpolations: ExpressionType[]): ExpressionType[] {
  return insertExpressions(strings, interpolations)
}
