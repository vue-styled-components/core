import { isValidElementType } from '@/helper/is'
import { ComponentInstance, defineComponent, h } from 'vue'

export function withAttrs<T extends Record<string, unknown>>(target: string | ComponentInstance<any>, attrs: T) {
  if (isValidElementType(target)) {
    return defineComponent(
      (_, { slots }) =>
        () =>
          h(target, attrs, slots?.default)
    )
  }

  throw Error('The target is invalid.')
}
