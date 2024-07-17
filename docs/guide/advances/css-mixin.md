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
