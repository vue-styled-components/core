# Vue Styled Components TypeScript 语法糖插件

这个 Vite 插件为 Vue Styled Components 提供了类似 React styled-components 的 TypeScript 泛型语法支持。

## 功能

- 允许使用 `styled.tag<Props>` 的语法，而不是原来必须使用的 `styled('tag', { props })` 语法
- 在编译时自动转换，不影响运行时性能
- 完全兼容 TypeScript 类型系统

## 安装

```bash
# npm
npm install @vue-styled-components/plugin-typescript-syntax --save-dev

# yarn
yarn add @vue-styled-components/plugin-typescript-syntax --dev

# pnpm
pnpm add @vue-styled-components/plugin-typescript-syntax -D
```

## 使用方法

### 在 Vite 配置中添加插件

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

### 配置选项

```ts
vueStyledComponentsTypescriptSyntax({
  // 包含的文件扩展名，默认为 ['.vue', '.tsx', '.jsx', '.ts', '.js']
  include: ['.vue', '.tsx', '.jsx', '.ts', '.js'],
  
  // 排除的文件路径，默认为 ['node_modules']
  exclude: ['node_modules'],
})
```

## 示例

### 使用泛型语法

```tsx
import styled from '@vue-styled-components/core'

interface IconProps {
  color?: string
  size?: number
}

// 使用新的泛型语法
const Icon = styled.span<IconProps>`
  color: ${props => props.color || 'currentColor'};
  font-size: ${props => `${props.size || 16}px`};
`

// 等同于原来的语法
const IconOriginal = styled('span', {
  color: String,
  size: Number,
})`
  color: ${props => props.color || 'currentColor'};
  font-size: ${props => `${props.size || 16}px`};
`
```

## 工作原理

插件在编译阶段拦截源代码，使用 AST 解析器分析代码，查找 `styled.tag<Props>` 模式的代码，并将其转换为 Vue Styled Components 支持的 `styled('tag', Props)` 格式。

## 许可证

Apache-2.0
