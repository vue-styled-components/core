import styled from '@vue-styled-components/core'

// 基本属性
interface IconProps {
  size?: number
  color?: string
}

// 使用 attrs 方法的组件
const Icon = styled.span
  .attrs<IconProps>(props => ({
    'role': 'img',
    'aria-hidden': 'true',
    'style': {
      fontSize: `${props.size || 16}px`,
    },
  }))`
  color: ${props => props.color || 'currentColor'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

// 多行 attrs 和复杂泛型
interface BadgeProps<T = number> {
  count: T
  showZero?: boolean
  color?: string
  max?: number
}

const Badge = styled.div
  .attrs<BadgeProps>(props => ({
    'data-count': props.count,
    'data-visible': props.showZero || props.count > 0 ? 'true' : 'false',
    'data-overflow': props.max && props.count > props.max ? 'true' : 'false',
  }))`
  position: relative;
  display: inline-block;
  
  &::after {
    content: ${(props) => {
      if (!props.showZero && props.count === 0)
        return ''
      if (props.max && props.count > props.max)
        return `${props.max}+`
      return props.count
    }};
    position: absolute;
    top: -8px;
    right: -8px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    border-radius: 8px;
    background-color: ${props => props.color || 'red'};
    color: white;
    font-size: 12px;
  }
`

export { Badge, Icon }
