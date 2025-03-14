# TypeScript 泛型语法插件

Vue Styled Components 提供了一个 Vite 插件，使得开发者可以使用类似 React styled-components 的 TypeScript 泛型语法。

## 安装

```bash
# npm
npm install @vue-styled-components/plugin-typescript-syntax --save-dev

# yarn
yarn add @vue-styled-components/plugin-typescript-syntax --dev

# pnpm
pnpm add @vue-styled-components/plugin-typescript-syntax -D
```

## 配置

在 Vite 配置文件中添加插件：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueStyledComponentsTypescriptSyntax from '@vue-styled-components/plugin-typescript-syntax'

export default defineConfig({
  plugins: [
    // 确保在 vue 和 vueJsx 插件之前使用
    vueStyledComponentsTypescriptSyntax(),
    vue(),
    vueJsx(),
  ],
})
```

## 使用方法

### 传统语法

在没有插件的情况下，你需要使用以下语法定义带有 props 的样式化组件：

```tsx
import styled from '@vue-styled-components/core'

// 定义 props
const buttonProps = {
  primary: Boolean,
  size: String,
}

// 创建样式化组件
const Button = styled('button', buttonProps)`
  background-color: ${props => props.primary ? 'blue' : 'white'};
  padding: ${props => props.size === 'large' ? '12px 24px' : '8px 16px'};
`
```

### 泛型语法

使用插件后，你可以使用更简洁的泛型语法：

```tsx
import styled from '@vue-styled-components/core'

// 使用 TypeScript 接口定义 props
interface ButtonProps {
  primary?: boolean
  size?: 'small' | 'medium' | 'large'
}

// 使用泛型语法创建样式化组件
const Button = styled.button<ButtonProps>`
  background-color: ${props => props.primary ? 'blue' : 'white'};
  padding: ${props => {
    switch (props.size) {
      case 'small': return '4px 8px'
      case 'large': return '12px 24px'
      default: return '8px 16px'
    }
  }};
`
```

## 支持的高级用法

插件支持各种复杂的泛型用例，包括：

### 行内类型定义

```tsx
const Link = styled.a<{ active: boolean; disabled?: boolean }>`
  color: ${props => props.active ? 'red' : 'blue'};
  opacity: ${props => props.disabled ? 0.5 : 1};
`
```

### 嵌套泛型

```tsx
interface BaseProps<T> {
  value?: T
  onChange?: (value: T) => void
}

interface InputProps<T = string> extends BaseProps<T> {
  placeholder?: string
  disabled?: boolean
}

const Input = styled.input<InputProps<string>>`
  border: 1px solid #ccc;
  opacity: ${props => props.disabled ? 0.5 : 1};
`
```

### 多行泛型定义

```tsx
const ComplexButton = styled.button<
  BaseProps & 
  SizeProps & {
    fullWidth?: boolean
    outlined?: boolean
  }
>`
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  padding: 8px 16px;
`
```

### 复杂类型结构

```tsx
type ButtonVariant<T extends Theme> = T extends 'dark' 
  ? { background: 'black'; color: 'white' }
  : { background: 'white'; color: 'black' }

interface ComplexButtonProps<T extends Theme = 'light'> {
  variant?: T
  style?: ButtonVariant<T>
}

const ThemeButton = styled.button<ComplexButtonProps<'dark'>>`
  background-color: black;
  color: white;
`
```

### 特殊字符和模板字符串

```tsx
const Button = styled.button<{
  color: '#fff' | '#000' | `rgba(${number}, ${number}, ${number}, ${number})`;
  'data-id'?: string;
  shadow: `${number}px ${number}px`;
}>`
  color: ${props => props.color};
`
```

## 工作原理

插件在编译阶段拦截源代码，通过以下步骤处理：

1. 使用正则表达式匹配 `styled.tag<Props>` 模式的代码
2. 解析泛型参数，确保类型定义中嵌套的尖括号和模板字符串被正确处理
3. 将匹配到的代码转换为 Vue Styled Components 支持的 `styled('tag', Props)` 格式
4. 转换后的代码保留了完整的 TypeScript 类型检查功能

这种转换完全在编译时进行，不会影响运行时性能，同时保持了完整的 TypeScript 类型检查支持。

## 支持的文件类型

默认情况下，插件会处理以下文件类型：
- `.vue`
- `.tsx`
- `.jsx`
- `.ts`
- `.js`

你可以通过配置选项自定义包含和排除的文件：

```ts
vueStyledComponentsTypescriptSyntax({
  include: ['.vue', '.tsx', '.jsx', '.ts'],
  exclude: ['node_modules', 'dist'],
})
```

## 注意事项

- 插件需要在 Vue 和 JSX 插件之前使用，以确保转换在 Vue 编译之前完成
- 泛型语法仅在编译时转换，不会影响运行时行为
- 确保你的 TypeScript 配置正确，以获得完整的类型检查支持
- 在复杂泛型定义中，确保尖括号和引号匹配正确，避免语法错误 