---
outline: deep
---

# 快速入门

## 安装

### 核心库

Npm

```shell
npm i @vue-styled-components/core
```

Yarn

```shell
yarn add @vue-styled-components/core
```

Pnpm

```shell
pnpm i @vue-styled-components/core
```

<!-- ### Vite 插件


Npm

```shell
npm i @vue-styled-components/plugin
```

Yarn

```shell
yarn add @vue-styled-components/plugin
```

Pnpm

```shell
pnpm i @vue-styled-components/plugin
```

Vite 配置

```ts
import vueStyledPlugin from "@vue-styled-components/plugin"
// ...

export default defineConfig({
  // ...
  plugins: [
    vueStyledPlugin()
    // ...
  ]
})
``` -->

## 开始使用

:::demo

```vue
<script setup lang="ts">
  import { styled } from '@vue-styled-components/core'

  const StyledDiv = styled.div<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-radius: 9999px;
  background-color: #4c5a6d;
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.color || '#fff'};
`
</script>

<template>
  <StyledDiv>Hello World!</StyledDiv>
</template>
```

:::
