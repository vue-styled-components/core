import styled from '@vue-styled-components/core'

// 泛型类型参数
type Size = 'small' | 'medium' | 'large'
type Theme = 'light' | 'dark'

// 嵌套泛型
interface BaseProps<T> {
  value?: T
  onChange?: (value: T) => void
}

// 多行泛型定义
interface InputProps<T = string> extends BaseProps<T> {
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}

// 使用嵌套泛型
const Input = styled.input<InputProps<string>>`
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  background-color: ${props => props.readonly ? '#f5f5f5' : 'white'};
  &::placeholder {
    color: #aaa;
  }
`

// 带条件类型的复杂泛型
type ButtonVariant<T extends Theme> = T extends 'dark'
  ? { background: 'black', color: 'white' }
  : { background: 'white', color: 'black' }

interface ComplexButtonProps<T extends Theme = 'light'> {
  variant?: T
  size?: Size
  style?: ButtonVariant<T>
}

// 具有多行复杂泛型的组件
const ComplexButton = styled.button<
  ComplexButtonProps<'dark' | 'light'> & {
    fullWidth?: boolean
    outlined?: boolean
  }
>`
  padding: ${(props) => {
    switch (props.size) {
      case 'small': return '4px 8px'
      case 'large': return '12px 24px'
      default: return '8px 16px'
    }
  }};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  background-color: ${props =>
      props.outlined
        ? 'transparent'
        : props.variant === 'dark' ? '#333' : '#fff'
  };
  color: ${props =>
      props.outlined
        ? (props.variant === 'dark' ? '#333' : '#666')
        : (props.variant === 'dark' ? '#fff' : '#333')
  };
  border: ${props => props.outlined ? '1px solid currentColor' : 'none'};
`

// 导出用于测试
export { ComplexButton, Input }
