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
    expect((document.styleSheets[0].cssRules[0] as CSSKeyframesRule).name).toBe(kf)
    expect((document.styleSheets[0].cssRules[1] as CSSStyleRule).style['animation-name' as any]).toBe(kf)
  })
})
