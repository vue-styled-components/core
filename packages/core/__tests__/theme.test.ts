import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/vue'
import { ThemeProvider, styled } from '../index'
import { h, reactive } from 'vue'
import { getStyle } from './utils'

describe('theme-provider', () => {
  afterEach(() => {
    // Reset env
    cleanup()
  })

  it('should render with theme', async () => {
    const StyledComponent = styled.p.attrs({ 'data-testid': 'test' })`
      background: ${(props) => props.theme.primary};
    `
    const theme = reactive({
      primary: 'rgb(255, 0, 0)',
    })

    const instance = render(ThemeProvider, {
      props: {
        theme,
      },
      slots: {
        default: () => h(StyledComponent),
      },
    })

    const element = instance.getByTestId('test')
    const preStyle = getStyle(element)
    expect(preStyle?.background).toBe('rgb(255, 0, 0)')

    theme.primary = 'rgb(0, 0, 255)'
    await waitFor(() => {
      const newStyle = getStyle(element)
      return expect(newStyle?.background).eq('rgb(0, 0, 255)')
    })
  })
})
