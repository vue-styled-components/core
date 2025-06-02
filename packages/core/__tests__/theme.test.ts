import { cleanup, render, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { h, reactive } from 'vue'
import { styled, ThemeProvider } from '../index'
import { getStyle, presetBasicEnv } from './utils'

describe('theme-provider', () => {
  beforeEach(() => {
    presetBasicEnv()
  })
  afterEach(() => {
    // Reset env
    cleanup()
  })

  it('should render with theme', async () => {
    const StyledComponent = styled.p.attrs({ 'data-testid': 'test' })`
      background: ${props => props.theme.primary};
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

  it('should use the nestest theme', async () => {
    const StyledComponent = styled.p.attrs({ 'data-testid': 'test' })`
      background: ${props => props.theme.primary};
    `

    const instance = render(ThemeProvider, {
      props: {
        theme: {
          primary: 'rgb(255, 0, 0)',
        },
      },
      slots: {
        default: () => h(ThemeProvider, { theme: { primary: 'rgb(0, 0, 255)' } }, () => h(StyledComponent)),
      },
    })

    const element = instance.getByTestId('test')
    const style = getStyle(element)
    expect(style?.background).toBe('rgb(0, 0, 255)')
  })
})
