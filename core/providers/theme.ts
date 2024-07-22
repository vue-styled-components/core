import { defineComponent, h, PropType, provide, ref, watch } from 'vue'

export const ThemeProvider = defineComponent(
  (props, { slots }) => {
    const theme = ref(props.theme)
    provide('$theme', theme)

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
        type: Object as PropType<Record<string, string | number>>,
        required: true,
        default: () => {},
      },
    },
  },
)
