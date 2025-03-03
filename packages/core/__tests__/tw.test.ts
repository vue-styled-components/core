import { cleanup, render, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { styled, tw } from '../index'

describe('tw', () => {
  afterEach(() => {
    cleanup()
  })

  it('should get a tailwind class name array', async () => {
    const h = 10
    const deep = 5

    const result = tw`text-red-${deep} 
        width-100px height-${h} text-lg`

    expect(result.value.length).toBe(4)
    expect(result.value[0]).toBe('text-red-5')
    expect(result.value[1]).toBe('width-100px')
    expect(result.value[2]).toBe('height-10')
    expect(result.value[3]).toBe('text-lg')
  })

  it('should insert classes to the component', async () => {
    const twObject = tw`text-red-5`
    const StyledComponent = styled.div`
      ${twObject}
    `
    const instance = render(StyledComponent)
    await waitFor(() => expect(instance.container.firstElementChild?.className).contain(twObject.value.join(' ')))
  })
})
