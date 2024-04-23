import { ExpressionsType, insertExpressions } from '@/utils'

export function css(strings: TemplateStringsArray, ...interpolations: ExpressionsType) {
  return insertExpressions(strings, interpolations)
}
