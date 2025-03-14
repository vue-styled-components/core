import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { extractPropsFromCode } from './normalize'

describe('transformStyledSyntax', () => {
  it('should transform styled.tag<Props> to styled("tag", Props)', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      interface IconProps {
        color?: string
        size?: number
      }
      
      const Icon = styled.span<IconProps>\`
        color: \${props => props.color || 'currentColor'};
        font-size: \${props => \`\${props.size || 16}px\`};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'Icon')
    expect(props).toHaveProperty('color')
    expect(props).toHaveProperty('size')
    expect(props.color.type).toBe('String')
    expect(props.color.required).toBe(false)
    expect(props.size.type).toBe('Number')
    expect(props.size.required).toBe(false)
  })

  it('should not transform code without styled components', () => {
    const code = `
      import { ref } from 'vue'
      
      const count = ref(0)
      function increment() {
        count.value++
      }
    `

    const result = transformStyledSyntax(code, 'test.ts')

    expect(result).toBeNull()
  })

  it('should not transform styled() function calls', () => {
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

  it('should handle multiple styled components in the same file', () => {
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

    // 检查第一个组件的props
    const buttonProps = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(buttonProps).toHaveProperty('primary')
    expect(buttonProps.primary.type).toBe('Boolean')
    expect(buttonProps.primary.required).toBe(false)

    // 检查第二个组件的props
    const iconProps = extractPropsFromCode(result?.props?.[1], 'Icon')
    expect(iconProps).toHaveProperty('size')
    expect(iconProps.size.type).toBe('Number')
    expect(iconProps.size.required).toBe(false)
  })
})
