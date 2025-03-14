import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { extractPropsFromCode } from './normalize'

describe('实际使用场景', () => {
  it('应该转换来自文档的示例代码', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      // 使用 TypeScript 接口定义 props
      interface ButtonProps {
        primary?: boolean
        size?: 'small' | 'medium' | 'large'
      }
      
      // 使用泛型语法创建样式化组件
      const Button = styled.button<ButtonProps>\`
        background-color: \${props => props.primary ? 'blue' : 'white'};
        padding: \${props => {
          switch (props.size) {
            case 'small': return '4px 8px'
            case 'large': return '12px 24px'
            default: return '8px 16px'
          }
        }};
      \`
    `

    const result = transformStyledSyntax(code, 'example.tsx')

    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(props).toHaveProperty('primary')
    expect(props).toHaveProperty('size')

    expect(props.primary.type).toBe('Boolean')
    expect(props.primary.required).toBe(false)
    expect(props.size.type).toEqual(['String'])
    expect(props.size.required).toBe(false)
  })

  it('应该在实际项目代码中正确转换', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      import { defineComponent } from 'vue'
      
      type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger'
      type Size = 'small' | 'medium' | 'large'
      
      interface StyledButtonProps {
        variant?: Variant
        size?: Size
        fullWidth?: boolean
        outlined?: boolean
        rounded?: boolean
        loading?: boolean
        disabled?: boolean
      }
      
      export const StyledButton = styled.button<StyledButtonProps>\`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        border-radius: \${props => props.rounded ? '9999px' : '4px'};
        font-weight: 500;
        cursor: \${props => (props.disabled || props.loading) ? 'not-allowed' : 'pointer'};
        opacity: \${props => props.disabled ? 0.6 : 1};
        transition: all 0.2s ease;
        white-space: nowrap;
        
        // Size styles
        \${props => {
          switch (props.size) {
            case 'small':
              return \`
                font-size: 12px;
                padding: 6px 12px;
                min-height: 28px;
              \`
            case 'large':
              return \`
                font-size: 16px;
                padding: 12px 20px;
                min-height: 44px;
              \`
            default:
              return \`
                font-size: 14px;
                padding: 8px 16px;
                min-height: 36px;
              \`
          }
        }}
        
        // Width
        width: \${props => props.fullWidth ? '100%' : 'auto'};
        
        // Variant and outlined styles
        \${props => {
          const isOutlined = props.outlined
          
          switch (props.variant) {
            case 'primary':
              return isOutlined
                ? \`
                  background-color: transparent;
                  border: 1px solid #3b82f6;
                  color: #3b82f6;
                  &:hover:not(:disabled) {
                    background-color: rgba(59, 130, 246, 0.1);
                  }
                \`
                : \`
                  background-color: #3b82f6;
                  border: 1px solid #3b82f6;
                  color: white;
                  &:hover:not(:disabled) {
                    background-color: #2563eb;
                    border-color: #2563eb;
                  }
                \`
            case 'success':
              return isOutlined
                ? \`
                  background-color: transparent;
                  border: 1px solid #10b981;
                  color: #10b981;
                  &:hover:not(:disabled) {
                    background-color: rgba(16, 185, 129, 0.1);
                  }
                \`
                : \`
                  background-color: #10b981;
                  border: 1px solid #10b981;
                  color: white;
                  &:hover:not(:disabled) {
                    background-color: #059669;
                    border-color: #059669;
                  }
                \`
            default:
              return isOutlined
                ? \`
                  background-color: transparent;
                  border: 1px solid #9ca3af;
                  color: #374151;
                  &:hover:not(:disabled) {
                    background-color: rgba(156, 163, 175, 0.1);
                  }
                \`
                : \`
                  background-color: #f3f4f6;
                  border: 1px solid #e5e7eb;
                  color: #374151;
                  &:hover:not(:disabled) {
                    background-color: #e5e7eb;
                  }
                \`
          }
        }}
        
        // Loading styles
        position: relative;
        \${props => props.loading ? \`
          color: transparent;
          pointer-events: none;
          
          &::after {
            content: '';
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid currentColor;
            border-right-color: transparent;
            animation: spin 0.75s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        \` : ''}
      \`
      
      export const Button = defineComponent({
        name: 'Button',
        props: {
          variant: {
            type: String,
            default: 'default',
            validator: (value: string) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value),
          },
          size: {
            type: String,
            default: 'medium',
            validator: (value: string) => ['small', 'medium', 'large'].includes(value),
          },
          fullWidth: {
            type: Boolean,
            default: false,
          },
          outlined: {
            type: Boolean,
            default: false,
          },
          rounded: {
            type: Boolean,
            default: false,
          },
          loading: {
            type: Boolean,
            default: false,
          },
          disabled: {
            type: Boolean,
            default: false,
          },
          type: {
            type: String,
            default: 'button',
          },
        },
        setup(props, { slots }) {
          return () => (
            <StyledButton
              variant={props.variant as StyledButtonProps['variant']}
              size={props.size as StyledButtonProps['size']}
              fullWidth={props.fullWidth}
              outlined={props.outlined}
              rounded={props.rounded}
              loading={props.loading}
              disabled={props.disabled}
              type={props.type}
            >
              {slots.default?.()}
            </StyledButton>
          )
        },
      })
    `

    const result = transformStyledSyntax(code, 'Button.tsx')

    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'StyledButton')
    expect(props).toHaveProperty('variant')
    expect(props).toHaveProperty('size')
    expect(props).toHaveProperty('fullWidth')
    expect(props).toHaveProperty('outlined')
    expect(props).toHaveProperty('rounded')
    expect(props).toHaveProperty('loading')
    expect(props).toHaveProperty('disabled')

    expect(props.variant.type).toBe('String')
    expect(props.variant.required).toBe(false)
    expect(props.size.type).toBe('String')
    expect(props.size.required).toBe(false)
    expect(props.fullWidth.type).toBe('Boolean')
    expect(props.fullWidth.required).toBe(false)
    expect(props.outlined.type).toBe('Boolean')
    expect(props.outlined.required).toBe(false)
    expect(props.rounded.type).toBe('Boolean')
    expect(props.rounded.required).toBe(false)
    expect(props.loading.type).toBe('Boolean')
    expect(props.loading.required).toBe(false)
    expect(props.disabled.type).toBe('Boolean')
    expect(props.disabled.required).toBe(false)
  })
})
