# Attributes setting

You can use the `.attrs` prop to set attributes to the styled components. support passing a attrs function or an object.

Here is an example:

:::demo
```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const InputWithValue = styled
  .input
  .attrs({ value: "I'm input with default value. 🥺" })`
    width: 100%;
    height: 40px;
    color: #333;
  `

const StyledInput = styled(InputWithValue, { canInput: Boolean })
  .attrs(props => ({
    disabled: !props.canInput,
    style: {
      background: !props.canInput ? '#f1f1f1' : '#fff',
      color: !props.canInput ? '#999' : '#000'
    }
  }))`
    padding: 0 8px;
    border-radius: 4px;
  `
</script>

<template>
  <InputWithValue />
  <StyledInput :canInput="false" />
</template>
```
:::
