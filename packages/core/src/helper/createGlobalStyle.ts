import type { DefineSetupFnComponent } from 'vue'
import type { ExpressionType } from '../utils'
import { defineComponent, h } from 'vue'
import { generateComponentName, injectStyle, insertExpressions } from '../utils'

export function createGlobalStyle(styles: TemplateStringsArray, ...expressions: ExpressionType[]): DefineSetupFnComponent<any> {
  return defineComponent(
    (_, { attrs }) => {
      const cssStringsWithExpression = insertExpressions(styles, expressions)

      injectStyle('', cssStringsWithExpression, attrs)

      return () => {
        return h('div', { style: 'display: none' })
      }
    },
    {
      name: generateComponentName('global'),
      inheritAttrs: true,
    },
  )
}
