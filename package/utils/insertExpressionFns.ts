export type ExpressionType = (props: Record<string, any>) => string | number

export function insertExpressionFns(strings: TemplateStringsArray, expressions: any): any[] {
  return expressions.reduce(
    (array: (string | ExpressionType)[], expression: ExpressionType, index: number) => {
      return array.concat(expression, strings[index + 1])
    },
    [strings[0]]
  )
}
