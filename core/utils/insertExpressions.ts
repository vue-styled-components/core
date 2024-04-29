export type ExpressionType = (props: Record<string, any>) => string | number

export type ExpressionsType = (ExpressionType | string)[]

export function insertExpressions(strings: TemplateStringsArray, expressions: ExpressionsType): ExpressionsType {
  return expressions.reduce(
    (array: ExpressionsType, expression: ExpressionType | string, index: number) => {
      return array.concat(expression, strings[index + 1])
    },
    [strings[0]]
  )
}
