export function insertExpressionFns(strings: string[], expressions: any): any[] {
  return expressions.reduce(
    (array, expression, i) => {
      return array.concat(expression, strings[i + 1])
    },
    [strings[0]]
  )
}
