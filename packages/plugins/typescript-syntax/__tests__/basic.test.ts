import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { extractPropsFromCode } from './normalize'

describe('基本语法转换', () => {
  it('应该转换简单的 styled.tag<Props> 为 styled("tag", { primary: { type: Boolean, required: false } })', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      interface ButtonProps {
        primary?: boolean
      }
      
      const Button = styled.button<ButtonProps>\`
        background-color: \${props => props.primary ? 'blue' : 'white'};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(props).toHaveProperty('primary')
    expect(props.primary.type).toBe('Boolean')
    expect(props.primary.required).toBe(false)
  })

  it('应该转换行内泛型定义', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      const Link = styled.a<{ active: boolean; disabled?: boolean }>\`
        color: \${props => props.active ? 'red' : 'blue'};
        opacity: \${props => props.disabled ? 0.5 : 1};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'Link')
    expect(props).toHaveProperty('active')
    expect(props).toHaveProperty('disabled')
    expect(props.active.type).toBe('Boolean')
    expect(props.active.required).toBe(true)
    expect(props.disabled.type).toBe('Boolean')
    expect(props.disabled.required).toBe(false)
  })

  it('不应该转换没有泛型的样式组件', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      const Button = styled.button\`
        background-color: blue;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).toBeNull()
  })

  it('不应该转换原始的函数调用语法', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      const Button = styled('button', {
        primary: Boolean,
      })\`
        background-color: \${props => props.primary ? 'blue' : 'white'};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).toBeNull()
  })

  it('应该处理同一文件中的多个样式组件', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      interface ButtonProps {
        primary?: boolean
      }
      
      interface IconProps {
        size?: number
      }
      
      const Button = styled.button<ButtonProps>\`
        background-color: \${props => props.primary ? 'blue' : 'white'};
      \`
      
      const Icon = styled.span<IconProps>\`
        font-size: \${props => \`\${props.size || 16}px\`};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()

    // 检查第一个组件
    const buttonProps = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(buttonProps).toHaveProperty('primary')
    expect(buttonProps.primary.type).toBe('Boolean')
    expect(buttonProps.primary.required).toBe(false)

    // 检查第二个组件
    const iconProps = extractPropsFromCode(result?.props?.[1], 'Icon')
    expect(iconProps).toHaveProperty('size')
    expect(iconProps.size.type).toBe('Number')
    expect(iconProps.size.required).toBe(false)
  })
})
