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

## 有条件地嵌套 CSS

```vue
<script setup lang="ts">
  import { styled, css } from '@vvibe/vue-styled-components'

  const testCss1 = css`
    background: white;
  `
  const testCss2 = css`
    background: blue;
  `
  const TestEmbedComponent = styled('div', { status: Boolean })`
    ${(props) => props.status ? testCss1 : testCss2}
  `
</script>
```

# 公共 CSS 类

你还可以使用 `cssClass` 来生成一个可公用的样式类，该函数会创建你传入的 CSS 并返回一个类名。

:::demo
```vue
<script setup lang="ts">
  import { css, cssClass } from '@vvibe/vue-styled-components'
  
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
