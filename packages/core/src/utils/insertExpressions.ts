import type { DefineSetupFnComponent } from 'vue'
import type { TailwindObject } from '../helper'

export type ExpressionType<T = Record<string, any>> =
  | ((props: T) => string | number | ExpressionType | ExpressionType[])
  | string
  | number
  | TailwindObject
  | DefineSetupFnComponent<any>
  | undefined
  | null

export function insertExpressions<T>(
  strings: TemplateStringsArray,
  expressions: (ExpressionType<T> | ExpressionType<T>[])[],
): ExpressionType<T>[] {
  return expressions.reduce(
    (array: ExpressionType<T>[], expression: ExpressionType<T>[] | ExpressionType<T> | string, index: number) => {
      return array.concat(expression, strings[index + 1])
    },
    [strings[0]],
  )
}
