import { describe, it, expect } from 'vitest'
import { styled, withAttrs } from '../index'
import { render } from '@testing-library/vue'
import { getStyle } from './utils'

describe('with attrs', () => {
  it('should add attrs to component', async () => {
    const Component = styled.div.attrs({ 'data-testid': 'test' })``

    const newComponent = withAttrs(Component, { style: 'width: 100px;' })

    const instance = render(newComponent)
    const style = getStyle(instance.getByTestId('test'))

    expect(style?.width).eq('100px')
  })

  it('should throw error if target is not a valid component', () => {
    withAttrs('div', {})
    expect(() => withAttrs(123, {})).toThrowError('The target is invalid.')
  })
})
