import { defineComponent, h, PropType, provide, ref, useSlots, watch } from 'vue'

export const ThemeProvider = defineComponent(
  (props) => {
    const theme = ref(props.theme)

    watch(props.theme, (newTheme) => {
      theme.value = newTheme
    })

    provide('$theme', theme.value)

    return () => {
      const slot = useSlots()
      return h('div', {}, slot)
    }
  },
  {
    name: 'ThemeProvider',
    props: {
      theme: {
        type: Object as PropType<Record<string, string | number>>,
        required: true,
        default: {}
      }
    }
  }
)
