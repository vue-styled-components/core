---
outline: deep
---

# Global Styles

You can use `createGlobalStyle` to generate global style.

Such as:

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
