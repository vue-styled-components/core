import { isValidElementType } from '@/helper/is'
import { ComponentInstance, defineComponent, DefineSetupFnComponent, h } from 'vue'

export function withAttrs<T extends Record<string, unknown>>(
  target: string | ComponentInstance<any>,
  attrs: T,
): DefineSetupFnComponent<any> {
  if (isValidElementType(target)) {
    return defineComponent(
      (_, { slots }) =>
        () =>
          h(target, attrs, slots?.default),
    )
  }

  throw Error('The target is invalid.')
}
