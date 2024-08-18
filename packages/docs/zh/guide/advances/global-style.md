---
outline: deep
---

# 全局样式

你可以使用 `createGlobalStyle` 来创建全局样式.

例如:

:::demo
```vue
<script setup lang="ts">
  import { createGlobalStyle } from '@vue-styled-components/core'

  const GlobalStyle = createGlobalStyle`
    .global-style-test {
      padding: 10px 20px;
      background: #ccc;
    }
  `
</script>

<template>
  <GlobalStyle />
  <div class="global-style-test">
    Test...
  </div>
</template>
```
:::
