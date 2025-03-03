---
outline: deep
---

# 传递属性

您可以向样式化组件传递属性，类似于 Vue 组件。例如，您可以向样式化的输入框传递一个占位符。

## 基础用法

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

您还可以在样式中使用属性。例如，您可以使用 `borderColor` 属性来更改输入框的边框颜色。

::: tip 注意

如果要在样式中使用属性，则需要在 styled 函数中定义这些属性。因为 Vue 组件需要显式声明 props，以便 Vue 知道应如何处理传递给组件的外部 props（请参阅 [Props Declaration](https://vuejs.org/guide/components/props.html#props-declaration)）

:::

## 使用 `attributes`

:::demo
```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledInput = styled
  .input
  .attrs({ disabled: true })`
    width: 100%;
    height: 40px;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 8px;
    cursor: ${ props => props.disabled ? 'not-allowed' : 'pointer'};
  `
</script>

<template>
  <StyledInput value="Type something..." :canInput="false" />
</template>
```
:::

## 新的 props 选项

从 `v1.7.0` 开始，您可以使用 `props` 选项将属性传递给样式化的组件。

:::demo
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { styled } from '@vue-styled-components/core'

const borderColor = ref('darkred')
const StyledInput = styled.input`
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
  <StyledInput
    placeholder="Type something"
    :props="{ borderColor }"
    @input="input"
    @focus="focus"
    @blur="blur"
  />
</template>
