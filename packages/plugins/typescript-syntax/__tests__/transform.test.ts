import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/transform'

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
    expect(result?.code).toContain(`styled('span', { color: { type: String, required: false }, size: { type: Number, required: false } })`)
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
    expect(result?.code).toContain(`styled('button', { primary: { type: Boolean, required: false } })`)
    expect(result?.code).toContain(`styled('span', { size: { type: Number, required: false } })`)
  })
})
