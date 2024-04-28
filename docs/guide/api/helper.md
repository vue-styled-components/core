---
outline: deep
---

# Helper

## `createGlobalStyle`

A function to create a `style component` that can be used to handle global styles.

**Augments**

- Tagged Template Literal, `TemplateStringsArray`, `required`

**Return**

- Vue Component, `DefineSetupFnComponent`

**Usage**

```vue
<script setup>
import { createGlobalStyle } from '@vue3-styled-components/package'

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

A function to generate keyframes. It takes a template literal as an argument and returns a animation name.

**Augments**

- Tagged Template Literal, `TemplateStringsArray`, `required`

**Return**

- Animation Name, `string`

**Usage**

```vue
<script setup lang="ts">
import { styled, keyframes } from '@vue3-styled-components/package'

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

## `withAttrs`

A function to add attributes to a `ComponentInstance` or `HTMLElements`.
**Augments**

- Component or Html Tag, `ComponentInstance | SupportedHTMLElements`, `required`
- Attributes, `Record<string, any>`, `required`

**Return**

- Vue Component, `DefineSetupFnComponent`

**Usage**

```vue
<script setup lang="ts">
import { withAttrs } from '@vue3-styled-components/package'

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
