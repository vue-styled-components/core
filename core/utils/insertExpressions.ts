export type ExpressionType = ((props: Record<string, any>) => string | number) | string

export function insertExpressions(strings: TemplateStringsArray, expressions: (ExpressionType | ExpressionType[])[]): ExpressionType[] {
  return expressions.reduce(
    (array: ExpressionType[], expression: ExpressionType[] | ExpressionType | string, index: number) => {
      return array.concat(expression, strings[index + 1])
    },
    [strings[0]],
  )
}
