import { defineComponent, h, PropType, provide } from 'vue'

export const ThemeProvider = defineComponent(
  (props, { slots }) => {
    provide('$theme', props.theme)
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
