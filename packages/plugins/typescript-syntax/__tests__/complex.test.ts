import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/transform'
import { normalizeString } from './normalize'

describe('复杂泛型语法转换', () => {
  it('应该转换嵌套泛型', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      interface BaseProps<T> {
        value?: T
        onChange?: (value: T) => void
      }
      
      interface InputProps<T = string> extends BaseProps<T> {
        placeholder?: string
      }
      
      const Input = styled.input<InputProps<string>>\`
        border: 1px solid #ccc;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('input', { value: { type: String, required: false }, onChange: { type: Function, required: false }, placeholder: { type: String, required: false } })`))
  })

  it('应该转换多行泛型定义', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      const Button = styled.button<{
        primary?: boolean
        size?: 'small' | 'medium' | 'large'
        disabled?: boolean
      }>\`
        padding: 8px 16px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()

    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('button', {
        primary: { type: Boolean, required: false },
        size: { type: String, required: false },
        disabled: { type: Boolean, required: false }
      })`))
  })

  it('应该转换带条件类型的复杂泛型', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      type Theme = 'light' | 'dark'
      type ButtonVariant<T extends Theme> = T extends 'dark' 
        ? { background: 'black'; color: 'white' }
        : { background: 'white'; color: 'black' }
        
      interface ButtonProps<T extends Theme = 'light'> {
        variant?: T
        style?: ButtonVariant<T>
      }
      
      const Button = styled.button<ButtonProps<'dark'>>\`
        background-color: black;
        color: white;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('button', {
      variant: {
        type: String,
        required: false
      },
      style: {
        type: String,
        required: false
      }
    })`))
  })

  it('应该转换组合多个泛型和接口的类型', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      interface BaseProps {
        theme?: 'light' | 'dark'
      }
      
      interface SizeProps {
        size?: 'small' | 'medium' | 'large'
      }
      
      // 具有多行复杂泛型的组件
      const ComplexButton = styled.button<
        BaseProps & 
        SizeProps & {
          fullWidth?: boolean
          outlined?: boolean
        }
      >\`
        padding: 8px 16px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('button', 
        {
          fullWidth: {
            type: Boolean,
            required: false
          },
          outlined: {
            type: Boolean,
            required: false
          },
          theme: {
            type: String,
            required: false
          },
          size: {
            type: String,
            required: false
          }
        }
      )`))
  })
})
