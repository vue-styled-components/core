import { defineComponent, h, PropType, provide, reactive, ref, watch } from 'vue'

export interface DefaultTheme {
  [key: string]: any
}

export const ThemeProvider = defineComponent(
  (props, { slots }) => {
    const theme = ref(props.theme)
    provide('$theme', reactive(theme.value as DefaultTheme))

    watch(
      () => props.theme,
      (v) => {
        theme.value = v
      },
      {
        deep: true,
      },
    )

    return () => {
      return h('div', null, slots)
    }
  },
  {
    name: 'ThemeProvider',
    props: {
      theme: {
        type: Object as PropType<DefaultTheme>,
        required: true,
        default: () => {},
      },
    },
  },
)
