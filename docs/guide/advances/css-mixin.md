---
outline: deep
---

# CSS Mixin

## Generate CSS Section

We offer a function named `css` to generate css section and the return value can be used in styled function.

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

## Embedded CSS with Conditional

:::demo

```vue
<script setup lang="ts">
  import { styled, css } from '@vvibe/vue-styled-components'
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

## Using Common CSS with Class

You can also use `cssClass` to generate a common css class. The function will inject your css and return a class name

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
