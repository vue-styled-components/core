---
outline: deep
---

# 辅助函数

## `createGlobalStyle`

用于创建全局样式的函数。

**参数**

- 模板字符串，`TemplateStringsArray`，`必需`

**返回值**

- Vue 组件，`DefineSetupFnComponent`

**用法**

```vue

<script setup>
  import { createGlobalStyle } from '@vue-styled-components/core'

  const GlobalStyle = createGlobalStyle`
    body {
      color: ${(props) => props.color};
    }
  `
</script>
<template>
  <GlobalStyle color="white" />
</template>
```

## `keyframes`

一个用于生成 `keyframes` 的函数。它接受模板字符串作为参数，并返回 `keyframes` 的名称。

**参数**

- 模板字符串，`TemplateStringsArray`，`必需`

**返回值**

- keyframes名称，`string`

**用法**

```vue

<script setup lang="ts">
  import { styled, keyframes } from '@vue-styled-components/core'

  const animation = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `
  const DivWithAnimation = styled('div')`
  width: 100%;
  height: 40px;
  animation: ${animation} 2s ease-in infinite;
`
</script>
<template>
  <DivWithAnimation>Div with animation</DivWithAnimation>
</template>
```

## `css`

一个用于从带有插值的模板字符串生成 CSS 的函数。

**参数**

- 模板字符串，`TemplateStringsArray`，`必需`

**返回值**

- 插值，`(string | function)[]`

**用法**

```vue

<script setup lang="ts">
  import { styled, css } from '@vue-styled-components/core'

  const mixin = css`
    color: red;
    background-color: blue;
  `
  const DivWithStyles = styled('div')`
    ${mixin}
  `
</script>

<template>
  <DivWithStyles>Div with mixin</DivWithStyles>
</template>
```



## `cssClass`

一个使用模板字符串生成 CSS 并返回 class 类名的函数。

**参数**

- 模板字符串，`TemplateStringsArray`，`必需`

**返回值**

- class 名称，`string`

**用法**

```vue

<script setup lang="ts">
  import { cssClass } from '@vue-styled-components/core'

  const commonClass = cssClass`
    padding: 20px;
    color: #fff;
    background-color: red;
  `
</script>

<template>
  <div :class="commonClass">Test</div>
</template>
```

## `withAttrs`

一个用于向 `ComponentInstance` 或 `HTMLElements` 添加 `attributes` 的函数。

**参数**

- 组件或 HTML 标签，`ComponentInstance | SupportedHTMLElements`，`必需`
- 属性对象，`Record<string, any>`，`必需`

**返回值**

- Vue 组件，`DefineSetupFnComponent`

**用法**

```vue

<script setup lang="ts">
  import { withAttrs } from '@vue-styled-components/core'

  const DivWithAttrs = withAttrs('div', {
    class: 'div-with-attrs'
  })

  const DivWithAttrs2 = withAttrs(DivWithAttrs, {
    class: 'div-with-attrs-2'
  })
</script>

<template>
  <DivWithAttrs>Div with attrs</DivWithAttrs>
  <DivWithAttrs2>Div with attrs 2</DivWithAttrs2>
</template>

<style scope>
  .div-with-attrs {
    color: red;
  }

  .div-with-attrs-2 {
    color: blue;
  }
</style>
```
