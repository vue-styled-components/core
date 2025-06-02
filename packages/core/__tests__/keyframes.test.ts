import { cleanup, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { keyframes, styled } from '../index'
import { getStyle, presetBasicEnv } from './utils'

describe('keyframes', () => {
  beforeEach(() => {
    presetBasicEnv()
  })
  afterEach(() => {
    // Reset env
    cleanup()
  })

  it('should have keyframes', async () => {
    const kf = keyframes`
      from {
        margin-left: 100%;
        width: 300%;
      }

      to {
        margin-left: 0%;
        width: 100%;
      }
    `

    const StyledComponent = styled.div`
      width: 40px;
      height: 40px;
      animation-duration: 3s;
      animation-name: ${kf};
      animation-iteration-count: infinite;
    `

    const instance = render(StyledComponent)
    const element = instance.container.firstElementChild

    // Make sure the animation is applied correctly
    const style = getStyle(element)
    expect(style).toBeDefined()
    expect(style?.animationName).toBe(kf)
    expect(style?.animationDuration).toBe('3s')
    expect(style?.animationIterationCount).toBe('infinite')
  })
})
