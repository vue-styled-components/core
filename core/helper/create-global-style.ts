import type { ExpressionsType } from '@/utils'
import { defineComponent, h } from 'vue'
import { generateComponentName, insertExpressions } from '@/utils'
import { injectStyle } from '@/utils/injectStyle'

export const createGlobalStyle = (styles: TemplateStringsArray, ...expressions: ExpressionsType) => {
  return defineComponent(
    (_, { attrs }) => {
      const cssStringsWithExpression = insertExpressions(styles, expressions)
      injectStyle('global', cssStringsWithExpression, attrs)
      return () => {
        return h('div', { style: 'display: none' })
      }
    },
    {
      name: generateComponentName('global'),
      inheritAttrs: true,
      styled: true
    } as any
  )
}
