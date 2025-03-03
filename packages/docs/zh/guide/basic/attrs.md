# Attributes 设置

你可以使用 `.attrs` 属性来设置组件的属性。支持传入一个 attrs 函数或者一个对象。

以下是一个使用例子：

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
