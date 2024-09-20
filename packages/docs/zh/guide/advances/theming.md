---
outline: deep
---

# 主题

`vue-styled-components` 提供了一个 `ThemeProvider` 组件，用于为您的组件设置主题。此组件通过 props 将主题传递给其所有后代 Vue 组件。渲染树中的所有样式化组件都可以访问提供的主题。

## 基本使用

`ThemeProvider` 包裹其子组件并向它们传递一个主题对象。`ThemeProvider` 范围内的所有样式化组件都可以访问此主题对象。

:::demo

```vue
<script setup lang="ts">
import { styled, ThemeProvider } from '@vue-styled-components/core'

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`

const StyledLink = styled.a`
  margin-right: 8px;
  color: ${(props) => props.theme.primary} !important;
  font-weight: bold;
`
</script>

<template>
  <StyledWrapper>
    <a>This a normal link</a>
    <ThemeProvider :theme="{ primary: 'red' }">
      <StyledLink>This a theming link</StyledLink>
    </ThemeProvider>
  </StyledWrapper>
</template>
```

:::

在此示例中，`StyledLink` 组件使用了提供的主题中的主色。

## 响应式主题

您还可以基于 Vue 的响应性系统使主题具有响应性。这使您可以动态更改主题。

:::demo

```vue
<script setup lang="ts">
import { styled, ThemeProvider } from '@vue-styled-components/core'
import { ref } from 'vue'

const theme = ref<Record<string, string>>({ primary: 'blue' })

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledLink = styled.a`
  color: ${(props) => props.theme.primary} !important;
`

const StyledButton = styled.button`
  width: 140px;
  height: 36px;
  margin-left: 20px;
  padding: 4px 12px;
  border-radius: 9999px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  background-color: skyblue;
  font-weight: bold;
`

const changeTheme = () => {
  if (theme.value.primary === 'red') {
    theme.value.primary = 'blue'
  } else {
    theme.value.primary = 'red'
  }
}
</script>

<template>
  <ThemeProvider :theme="theme">
    <StyledWrapper>
      <StyledLink>This a theming link</StyledLink>
      <StyledButton @click="changeTheme">Change Theme</StyledButton>
    </StyledWrapper>
  </ThemeProvider>
</template>
```

:::

## 在非 Styled 组件中使用主题

通过在 `ThemeProvider` 中定义主题，您确保所有组件都可以访问相同的主题样式，从而实现全局一致的视觉外观。即使在 Vue 中的 `非Styled组件` 也可以通过注入 `$theme` 并使用主题中定义的属性来访问主题，从而为其样式设置使用主题。

:::demo

```vue
<script setup lang="ts">
import { ThemeProvider } from '@vue-styled-components/core'
import { defineComponent, h, inject } from 'vue'

const Link = defineComponent(() => {
  const theme = inject('$theme')
  return () => h('a', { style: { color: theme.primary } }, 'This is a link')
})
</script>

<template>
  <ThemeProvider :theme="{ primary: 'green' }">
    <Link />
  </ThemeProvider>
</template>
```

:::

## 通过 Hook 获取主题

你还可以通过 `useTheme` 获取主题，但前提是必须属于 `ThemeProvider` 的组件树内。

使用方法参考 [useTheme](/zh/guide/api/hook)

## 如何通过 TypeScript 获取主题提示？

在使用 styled 组件时，你可能会通过 `${props => props.theme.primary}` 引用你的主题上下文。为了让 TypeScript 能够提供自动补全提示并进行类型检查，你可以扩展 `DefaultTheme` 接口。

```ts
// xxx.d.ts
import '@vue-styled-components/core';

export {};

interface Theme {
  primary: string;
}

declare module '@vue-styled-components/core' {
  export interface DefaultTheme extends Theme {}
}
```

通过定义并扩展 `Theme` 接口，TypeScript 将能够识别你的自定义主题属性，并在你使用 `${props => props.theme.primary}` 时提供相应的提示。