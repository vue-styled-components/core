import styled from '@vue-styled-components/core'

// 基本接口
interface ButtonProps {
  primary?: boolean
  size?: 'small' | 'medium' | 'large'
}

// 基本用法：单行泛型
const Button = styled.button<ButtonProps>`
  color: ${props => props.primary ? 'white' : 'blue'};
  padding: ${props => props.size === 'small' ? '4px 8px' : '8px 16px'};
`

// 使用多个属性
const Link = styled.a<{ active: boolean, disabled?: boolean }>`
  color: ${props => props.active ? 'red' : 'blue'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`

// 混合使用常规语法
const Icon = styled('span', {
  size: Number,
})`
  font-size: ${props => `${props.size || 16}px`};
`
