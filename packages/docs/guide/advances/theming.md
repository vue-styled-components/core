---
outline: deep
---

# Theming

`vue-styled-components` provides a `ThemeProvider` component for theming your components. This component passes a theme
to all its descendant Vue components via props. All styled components within the render tree will have access to the
provided theme.

## Basic Theming

The `ThemeProvider` wraps its children components and passes a theme object to them. All styled components within
the `ThemeProvider`'s scope can access this theme object.

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

In this example, the `StyledLink` component uses the primary color from the provided theme.

## Reactive Theming

You can also make your theme reactive by using Vue's reactivity system. This allows you to dynamically change the theme
and see the updates reflected in your styled components.

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

## Using Theme in Non-Styled Components

By defining themes within the `ThemeProvider`, you ensure that all components have access to the
same theme styles, achieving
a globally consistent visual appearance. Even `non-styled components` in Vue can access the theme by injecting `$theme`
and use properties defined in the theme for their styles.

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
