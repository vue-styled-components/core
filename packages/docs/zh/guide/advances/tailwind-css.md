---
outline: deep
---

# 使用 Tailwind CSS

`v1.6.0` 版本起支持使用 `Tailwind CSS` 构建样式。

> 开始前请 [安装及配置 `Tailwind CSS`](https://tailwindcss.com/docs/installation/using-postcss)

## 基础使用

`@vue-style-components/core` 提供了 `tw` 函数，用于将 `Tailwind CSS` 的类名插入为 Vue Component 的 `class` 属性。

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const StyledDiv = styled.div`
  ${tw`w-20 h-20 bg-red-500`}
`
</script>
<template>
  <StyledDiv />
</template>
```

## 动态控制

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const StyledDiv = styled('div', { isRed: true })`
  width: 20px;
  height: 20px;
  ${props => props.isRed && tw`bg-red-500`}
`
</script>
<template>
  <StyledDiv />
</template>
```

## 抽象为公共样式

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const twButton = tw`px-4 py-2 rounded-md`

const StyledSmallButton = styled.div`
  width: 20px;
  height: 20px;
  ${twButton}
`

const StyledLargeButton = styled.div`
  width: 40px;
  height: 20px;
  ${twButton}
`
</script>
<template>
  <StyledSmallButton>small button</StyledSmallButton>
  <StyledLargeButton>large button</StyledLargeButton>
</template>
```

## 动态类名

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const color = 'red'

const StyledDiv = styled('div', { isRed: true })`
  width: 20px;
  height: 20px;
  ${tw`bg-red-500 ${`bg-${color}-500`}`}
`
</script>
<template>
  <StyledDiv />
</template>
```
