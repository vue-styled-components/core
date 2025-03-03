import type { ComponentInstance, DefineSetupFnComponent } from 'vue'
import { isValidElementType } from '@/src/helper/is'
import { defineComponent, h } from 'vue'

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

  throw new Error('The target is invalid.')
}
