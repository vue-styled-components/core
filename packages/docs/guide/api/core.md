---
outline: deep
---

# Core

## `styled`

It is a factory function.

**Augments**

- Tag Name, `SupportedHTMLElements | Vue Component`, `required`
- Props Definition, `Record<string, any>`

**Return**

- Tag Function, used to create a styled component.

**Usage**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledDiv = styled('div', { color: String })`
  width: 100%;
  padding: 0 10px;
  border-radius: 4px;
  text-align: center;
`
</script>

<template>
  <StyledDiv>Styled Div</StyledDiv>
</template>
```

### `.[HTML Tag]`

**Augments**

- Tagged Template Literal, `TemplateStringsArray`, `required`

**Return**

- Vue Component, `DefineSetupFnComponent`

**Usage**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledDiv = styled.div`
  width: 40px;
  height: 40px;
`
</script>

<template>
  <StyledDiv>Styled Component</StyledDiv>
</template>
```

### `.arrts`

It is used for passing attributes to styled component.

**Augments**

- Attrs Object or Factory Function, `Record<string, any> | ((props: Context) => Record<string, any>)`, `required`

**Return**

- Tag Function, used to create a styled component.

**Usage**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const InputWithValue = styled
  .input
  .attrs({ value: "I'm input with default value. 🥺" })`
    width: 100%;
    height: 40px;
  `

const StyledInput = styled('input', { canInput: Boolean })
  .attrs(props => { disabled: !props.canInput })`
    width: 100%;
    height: 40px;
  `
</script>
```
