// 主题类型定义
import '@vue-styled-components/core'

export {}

// 扩展的主题接口
interface Theme {
  // 主要颜色
  primary?: string
  secondary?: string
  success?: string
  danger?: string
  warning?: string
  info?: string

  // 背景和表面颜色
  background?: string
  surface?: string

  // 文本颜色
  text?: string
  textSecondary?: string

  // 边框颜色
  border?: string

  // 兼容旧版本的颜色定义
  colors?: {
    lightText?: string
    darkText?: string
  }

  // 间距函数
  spacing?: (size: number) => string

  // 阴影定义
  shadows?: {
    small: string
    medium: string
    large: string
  }

  // 断点定义
  breakpoints?: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// 声明模块扩展
declare module '@vue-styled-components/core' {
  export interface DefaultTheme extends Theme {}
}
