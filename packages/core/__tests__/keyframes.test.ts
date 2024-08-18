import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { keyframes, styled } from '../index'

describe('keyframes', () => {
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
      background: ${(props: any) => props.theme.error};
      animation-duration: 3s;
      animation-name: ${kf};
      animation-iteration-count: infinite;
    `

    mount(StyledComponent)
    // Make sure the keyframes are defined
    const cssRules = document.styleSheets[0].cssRules
    const keyframesRule = Array.from(cssRules as unknown as CSSKeyframesRule[]).find((rule) => rule?.name === kf)

    expect(keyframesRule).not.toBeUndefined()
    expect(keyframesRule?.name).toBe(kf)

    // Make sure the animation is applied correctly
    const styleRule = Array.from(cssRules as unknown as CSSStyleRule[]).find((rule) => rule instanceof CSSStyleRule)
    expect(styleRule).not.toBeUndefined()
    expect(styleRule!.style['animation-name' as any]).toBe(kf)
  })
})
