---
outline: deep
---

# 样式复用

我们提供了一个 `css` 函数用于创建 css 片段，该函数返回值可在 styled 中使用

Such as:

:::demo
```vue
<script setup lang="ts">
  import { styled, css } from '@vue-styled-components/core'
  
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

## 有条件地嵌套 CSS


:::demo

```vue
<script setup lang="ts">
  import { styled, css } from '@vue-styled-components/core'
  import { ref } from 'vue'

  const status = ref<boolean>(false)

  const StyledButton = styled.button`
    height: 36px;
    margin-left: 20px;
    padding: 4px 12px;
    border-radius: 8px;
    background-color: skyblue;
  `

  const testCss1 = css`
    color: #fff;
    background: darkred;
  `
  const testCss2 = css`
    color: #000;
    background: orange;
  `
  const TestEmbedComponent = styled('div', { status: Boolean })`
    width: 200px;
    border-radius: 8px;
    text-align: center;
    line-height: 40px;
    ${(props) => props.status ? testCss1 : testCss2}
  `
</script>
<template>
  <div style="display: flex; align-items: center;">
    <TestEmbedComponent :status="status">Test</TestEmbedComponent>
    <StyledButton @click="status = !status">Change Status</StyledButton>
  </div>
</template>
```
:::

# 公共 CSS 类

你还可以使用 `cssClass` 来生成一个可公用的样式类，该函数会创建你传入的 CSS 并返回一个类名。

:::demo
```vue
<script setup lang="ts">
  import { css, cssClass } from '@vue-styled-components/core'
  
  const commonCSS = css`
    padding: 10px 20px;
    border-radius: 8px;
  `

  const commonClass = cssClass`
    ${commonCSS}
    color: #fff;
    background-color: red;
  `
</script>

<template>
  <div :class="commonClass">Test</div>
</template>
```
:::
