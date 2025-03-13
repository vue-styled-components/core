import styled from '@vue-styled-components/core'
import { defineComponent, ref } from 'vue'

// 基本属性
interface CardProps {
  elevation?: number
  bordered?: boolean
  clickable?: boolean
}

// 基本卡片组件
const Card = styled.div<CardProps>`
  padding: 16px;
  border-radius: 8px;
  box-shadow: ${props =>
    props.elevation
      ? `0 ${props.elevation * 2}px ${props.elevation * 4}px rgba(0,0,0,0.1)`
      : 'none'};
  border: ${props => (props.bordered ? '1px solid #e0e0e0' : 'none')};
  cursor: ${props => (props.clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  &:hover {
    transform: ${props => (props.clickable ? 'translateY(-2px)' : 'none')};
    box-shadow: ${props =>
      props.clickable
        ? `0 ${(props.elevation || 1) * 3}px ${(props.elevation || 1) * 6}px rgba(0,0,0,0.1)`
        : ''};
  }
`

// 使用样式化组件创建Vue组件
const CardComponent = defineComponent({
  name: 'CardComponent',
  props: {
    title: {
      type: String,
      default: '',
    },
    elevation: {
      type: Number,
      default: 1,
    },
    bordered: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function,
      default: null,
    },
  },
  setup(props, { slots }) {
    const handleClick = () => {
      if (props.clickable && props.onClick) {
        props.onClick()
      }
    }

    return () => (
      <Card
        elevation={props.elevation}
        bordered={props.bordered}
        clickable={props.clickable}
        onClick={handleClick}
      >
        {props.title && <h3 style={{ marginTop: 0 }}>{props.title}</h3>}
        {slots.default && slots.default()}
      </Card>
    )
  },
})

// 扩展样式化组件
interface AvatarProps {
  size?: 'small' | 'medium' | 'large'
  src?: string
  alt?: string
}

const Avatar = styled.img<AvatarProps>`
  display: inline-block;
  border-radius: 50%;
  object-fit: cover;
  width: ${(props) => {
    switch (props.size) {
      case 'small':
        return '32px'
      case 'large':
        return '64px'
      default:
        return '48px'
    }
  }};
  height: ${(props) => {
    switch (props.size) {
      case 'small':
        return '32px'
      case 'large':
        return '64px'
      default:
        return '48px'
    }
  }};
`

// 创建扩展了AvatarProps的头像组件
interface UserAvatarProps extends AvatarProps {
  username: string
  online?: boolean
}

const UserAvatar = styled.div<UserAvatarProps>`
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: ${props => (props.online ? '#4caf50' : '#9e9e9e')};
  }
`

// 组合使用
const UserAvatarComponent = defineComponent({
  name: 'UserAvatarComponent',
  props: {
    username: {
      type: String,
      required: true,
    },
    src: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value: string) =>
        ['small', 'medium', 'large'].includes(value),
    },
    online: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // 如果没有头像，使用用户名的首字母
    const getInitials = (name: string) => name.charAt(0).toUpperCase()

    const showPlaceholder = !props.src
    const bgColor = ref(`hsl(${(props.username.length * 30) % 360}, 70%, 60%)`)

    return () => (
      <UserAvatar
        username={props.username}
        online={props.online}
        size={props.size as AvatarProps['size']}
      >
        {showPlaceholder
          ? (
              <div
                style={{
                  width:
                props.size === 'small'
                  ? '32px'
                  : props.size === 'large'
                    ? '64px'
                    : '48px',
                  height:
                props.size === 'small'
                  ? '32px'
                  : props.size === 'large'
                    ? '64px'
                    : '48px',
                  borderRadius: '50%',
                  backgroundColor: bgColor.value,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize:
                props.size === 'small'
                  ? '14px'
                  : props.size === 'large'
                    ? '24px'
                    : '18px',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(props.username)}
              </div>
            )
          : (
              <Avatar
                src={props.src}
                alt={props.username}
                size={props.size as AvatarProps['size']}
              />
            )}
      </UserAvatar>
    )
  },
})

export { Avatar, Card, CardComponent, UserAvatar, UserAvatarComponent }
