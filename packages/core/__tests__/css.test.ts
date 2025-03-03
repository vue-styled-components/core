import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { css, styled } from '../index'
import { getStyle } from './utils'

describe('css', () => {
  afterEach(() => {
    cleanup()
  })

  it('should get a template string array with css', async () => {
    const h = 10

    const result = css`
      width: 100px;
      height: ${h}px;
    `.join('')

    expect(result).toContain('width: 100px;')
    expect(result).toContain(`height: ${h}px;`)
  })

  it('should apply css', () => {
    const mixin = css`
      width: 100px;
      height: 100px;
      ${css`
        border-radius: 10px;
      `}
      ${css`
        box-sizing: border-box;
      `}
    `
    const StyledComponent = styled.div`
      ${mixin}
    `
    const instance = render(StyledComponent)
    const style = getStyle(instance.container.firstElementChild)
    expect(style?.width).eq('100px')
    expect(style?.height).eq('100px')
    expect(style?.borderRadius).eq('10px')
    expect(style?.boxSizing).eq('border-box')
  })
})
