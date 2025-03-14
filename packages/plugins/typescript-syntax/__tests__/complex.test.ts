import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { extractPropsFromCode } from './normalize'

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

    const props = extractPropsFromCode(result?.props?.[0], 'Input')
    expect(props).toHaveProperty('value')
    expect(props).toHaveProperty('onChange')
    expect(props).toHaveProperty('placeholder')
    expect(props.value.type).toBe('String')
    expect(props.value.required).toBe(false)
    expect(props.onChange.type).toBe('Function')
    expect(props.placeholder.type).toBe('String')
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

    const props = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(props).toHaveProperty('primary')
    expect(props).toHaveProperty('size')
    expect(props).toHaveProperty('disabled')
    expect(props.primary.type).toBe('Boolean')
    expect(props.primary.required).toBe(false)
    expect(props.size.type).toBe('String')
    expect(props.disabled.type).toBe('Boolean')
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

    const props = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(props).toHaveProperty('variant')
    expect(props).toHaveProperty('style')
    expect(props.variant.required).toBe(false)
    expect(props.style.required).toBe(false)
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

    const props = extractPropsFromCode(result?.props?.[0], 'ComplexButton')
    expect(props).toHaveProperty('theme')
    expect(props).toHaveProperty('size')
    expect(props).toHaveProperty('fullWidth')
    expect(props).toHaveProperty('outlined')
    expect(props.theme.type).toBe('String')
    expect(props.fullWidth.type).toBe('Boolean')
    expect(props.fullWidth.required).toBe(false)
  })
})
