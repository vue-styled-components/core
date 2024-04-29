import { createGlobalStyle, styled } from '../index'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

describe('styled', () => {
  afterEach(() => {
    // Reset env
    const styleTags = document.querySelectorAll('style')
    styleTags.forEach((styleTag) => {
      styleTag.innerHTML = ''
    })
  })

  it('should create a styled component', async () => {
    const MyComponent = {
      template: '<div>Hello World</div>'
    }

    const StyledComponent = styled(MyComponent)`
      color: blue;
    `
    expect(StyledComponent).toBeDefined()
    expect(StyledComponent.name).toMatch(/^styled-/)

    const wrapper = mount(StyledComponent)
    const className = wrapper.find('div').element.className

    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).selectorText).toBe(`.${className}`)
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style.color).toBe('blue')
    expect(wrapper.text()).toBe('Hello World')
  })

  it('should throw error if the element is invalid', () => {
    // 模拟一个无效的元素类型
    const invalidElement = 'invalid-element'

    // 断言当传入无效的元素类型时，应该抛出错误
    expect(() => {
      styled(invalidElement)
    }).toThrowError('The element is invalid.')
  })

  it('should style styled component', async () => {
    const StyledComponent = styled.div`
      height: 36px;
    `

    const StyledComponent2 = styled(StyledComponent).attrs({ style: 'color: blue' })`
      height: 44px;
    `

    const wrapper = mount(StyledComponent2, { slots: { default: () => 'Hello World' } })
    const className = wrapper.find('div').element.className
    expect(className).contain((document.styleSheets[0].cssRules[0] as CSSStyleRule).selectorText.replace(/\./, ''))
    expect(className).contain((document.styleSheets[0].cssRules[1] as CSSStyleRule).selectorText.replace(/\./, ''))
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style.height).toBe('44px')
    expect((document.styleSheets[0].cssRules[1] as CSSStyleRule).style.height).toBe('36px')
    expect(wrapper.find('div').element.className).toMatch(/^styled-/)
    expect(wrapper.text()).toBe('Hello World')
    expect(wrapper.find('div').element.style.color).toBe('blue')
  })

  it('should inject attrs', async () => {
    const StyledComponent = styled.div.attrs({
      style: 'color: red'
    })`
      height: 36px;
    `
    const wrapper = mount(StyledComponent)

    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style.height).toBe('36px')
    expect(wrapper.find('div').element.style.color).toBe('red')
  })

  it('should react to props change', async () => {
    const StyledComponent = styled('div', { color: String })`
      color: ${(props) => props.color};
    `
    const color = ref('red')
    const wrapper = mount(StyledComponent, {
      props: {
        color: color.value
      }
    })

    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style['color']).toBe('red')

    await wrapper.setProps({ color: 'blue' })
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style['color']).toBe('blue')
  })

  it('should create a global style component', async () => {
    const GlobalStyle = createGlobalStyle`
      body {
        background: red;
      }
    `
    mount(GlobalStyle)

    expect(GlobalStyle).toBeDefined()
    expect(GlobalStyle.name).toMatch(/^global-style/)
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).selectorText).toBe('body')
    expect((document.styleSheets[0].cssRules[0] as CSSStyleRule).style.background).toBe('red')
  })
})
