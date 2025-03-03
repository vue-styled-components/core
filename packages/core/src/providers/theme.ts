import type { PropType } from 'vue'
import { assign, cloneDeep } from 'lodash-es'
import { defineComponent, h, inject, provide, reactive, watch } from 'vue'

export interface DefaultTheme {
  [key: string]: any
}

export const ThemeProvider = defineComponent(
  (props, { slots }) => {
    const parentTheme = inject<DefaultTheme>('$theme', reactive({}))
    const mergeTheme = (cur: DefaultTheme) => {
      return typeof props.theme === 'function' ? props.theme(cloneDeep(cur)) : props.theme
    }

    const reactiveTheme = reactive(mergeTheme(parentTheme))

    provide<DefaultTheme>('$theme', reactive(reactiveTheme))

    watch(
      parentTheme,
      (v) => {
        assign(reactiveTheme, mergeTheme(v))
      },
      { deep: true, immediate: true },
    )

    return () => {
      return h('div', null, slots)
    }
  },
  {
    name: 'ThemeProvider',
    props: {
      theme: {
        type: [Object, Function] as PropType<DefaultTheme | ((theme: DefaultTheme) => DefaultTheme)>,
        required: true,
      },
    },
  },
)
