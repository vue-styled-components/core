---
outline: deep
---

# 样式复用

我们提供了一个 `css` 函数用于创建 css 片段，该函数返回值可在 styled 中使用

Such as:

:::demo
```vue
<script setup lang="ts">
  import { styled, css } from '@vvibe/vue-styled-components'
  
  const commonCSS = css`
    padding: 10px 20px;
    border-radius: 8px;
    background: darkred;
    color: #fff;
  `
  const StyledDiv = styled.div`
    ${ commonCSS }
  `
</script>

<template>
  <StyledDiv> Test... </StyledDiv>
</template>
```
:::
