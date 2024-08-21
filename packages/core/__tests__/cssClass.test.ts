import { describe, it, expect, afterEach } from 'vitest'
import { cssClass, styled } from '../index'
import { render, cleanup } from '@testing-library/vue'
import { getStyle } from './utils'

describe('css class', () => {
  afterEach(() => {
    cleanup()
  })

  it('should get a class name and inject style', async () => {
    const h = 10

    const result = cssClass`
      width: 100px;
      height: ${h}px;
    `

    expect(result.startsWith('styled-')).toBeTruthy()

    const Component = styled.div.attrs({
      'data-testid': 'test',
      class: result,
    })``

    const instance = render(Component)
    const style = getStyle(instance.getByTestId('test'))

    expect(style?.width).eq('100px')
    expect(style?.height).eq('10px')
  })
})
