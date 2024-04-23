import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ThemeProvider, styled } from '../index'
import { h, reactive } from 'vue'

describe('theme-provider', () => {
  const StyledComponent = styled.p`
    background: ${(props) => props.theme.primary};
  `
  const theme = reactive({
    primary: 'red'
  })
  const wrapper = mount(ThemeProvider, {
    props: {
      theme
    },
    slots: {
      default: () => h(StyledComponent)
    }
  })

  it('should use theme', async () => {
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style.background).toBe('red')
  })

  it('should react to theme change', async () => {
    theme.primary = 'blue'
    await wrapper.setProps({
      theme
    })
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style.background).toBe('blue')
  })
})
