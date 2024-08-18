---
outline: deep
---

# Passed Props

You can pass props to the styled component, similar to Vue components. For instance, you can pass a placeholder to the
styled input.

:::demo

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { styled } from '@vue-styled-components/core'

const borderColor = ref('darkred')
const inputProps = { borderColor: String }
const StyledInput = styled('input', inputProps)`
  width: 100%;
  height: 40px;
  padding: 4px 8px;
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 8px;
`

const input = () => (borderColor.value = 'forestgreen')
const focus = () => (borderColor.value = 'skyblue ')
const blur = () => (borderColor.value = 'darkred')
</script>

<template>
  <StyledInput placeholder="Type something" :borderColor="borderColor" @input="input" @focus="focus" @blur="blur" />
</template>
```

:::

And you can also use props in the styles. For example, you can use the `borderColor` prop to change the border color of
the input.

::: tip NOTE

You must define the props in the `styled` function if you want to use them in the style. Because Vue components
require explicit props declaration so that Vue knows what external props passed to the component should be treated as
fallthrough attributes.(see [Props Declaration](https://vuejs.org/guide/components/props.html#props-declaration))

:::
