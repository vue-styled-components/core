import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/transform'

describe('transformStyledSyntax', () => {
  it('应该正确转换styled.tag<Props>模式', () => {
    const code = `
      import styled from 'vue-styled-components'
      
      interface ButtonProps {
        primary?: boolean
        size?: 'small' | 'medium' | 'large'
      }
      
      const Button = styled.button<ButtonProps>\`
        background-color: \${props => props.primary ? 'blue' : 'white'};
        padding: \${props => {
          switch(props.size) {
            case 'small': return '4px 8px'
            case 'large': return '12px 24px'
            default: return '8px 16px'
          }
        }};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(result?.code).toContain(`styled('button', {`)
    expect(result?.code).toContain(`primary: { type: Boolean, required: false }`)
    expect(result?.code).toContain(`size: { type: String, required: false }`)
  })

  it('应该转换类型别名', () => {
    const code = `
      import styled from 'vue-styled-components'
      
      type InputProps = {
        variant: 'outline' | 'filled'
        disabled?: boolean
      }
      
      const Input = styled.input<InputProps>\`
        border: \${props => props.variant === 'outline' ? '1px solid #ccc' : 'none'};
        opacity: \${props => props.disabled ? 0.5 : 1};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(result?.code).toContain(`styled('input', {`)
    expect(result?.code).toContain(`variant: { type: String, required: true }`)
    expect(result?.code).toContain(`disabled: { type: Boolean, required: false }`)
  })

  it('应该跳过不包含styled组件的代码', () => {
    const code = `
      import { ref, computed } from 'vue'
      
      const count = ref(0)
      const doubled = computed(() => count.value * 2)
    `

    const result = transformStyledSyntax(code, 'test.ts')

    expect(result).toBeNull()
  })

  it('应该处理基本类型名称', () => {
    const code = `
      import styled from 'vue-styled-components'
      
      const Box = styled.div<{ width: number, height: number, visible: boolean }>\`
        width: \${props => props.width}px;
        height: \${props => props.height}px;
        display: \${props => props.visible ? 'block' : 'none'};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(result?.code).toContain(`styled('div', {`)
    expect(result?.code).toContain(`width: { type: Number, required: true }`)
    expect(result?.code).toContain(`height: { type: Number, required: true }`)
    expect(result?.code).toContain(`visible: { type: Boolean, required: true }`)
  })
})
