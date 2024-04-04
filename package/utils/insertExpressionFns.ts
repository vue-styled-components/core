export type ExpressionType = (props: Record<string, any>) => string | number

export function insertExpressionFns(strings: TemplateStringsArray, expressions: ExpressionType[]): (string | ExpressionType)[] {
  return expressions.reduce(
    (array: (string | ExpressionType)[], expression: ExpressionType, index: number) => {
      return array.concat(expression, strings[index + 1])
    },
    [strings[0]]
  )
}
