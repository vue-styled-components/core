import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/transform'
import { normalizeString } from './normalize'

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
    expect(result?.code).toContain(`styled('button', { primary: { type: Boolean, required: false } })`)
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
    /* console.log(result?.code) */
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('a', { active: { type: Boolean, required: true }, disabled: { type: Boolean, required: false } })`))
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
    expect(result?.code).toContain(`styled('button', { primary: { type: Boolean, required: false } })`)
    expect(result?.code).toContain(`styled('span', { size: { type: Number, required: false } })`)
  })
})
