---
outline: deep
---

# 核心

## `styled`

这是一个工厂函数。

**参数**

- 标签名，`SupportedHTMLElements | Vue 组件`，`必需`
- 属性定义，`Record<string, any>`

**返回值**

- 标签函数，用于创建样式化组件。

**用法**

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
  <StyledDiv>样式化的 div</StyledDiv>
</template>
```

## `.[HTML Tag]`

**参数**

- 模板字符串，`TemplateStringsArray`，`必需`

**返回值**

- Vue 组件，`DefineSetupFnComponent`

**用法**

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

用于向样式化组件传递 `attributes`。

**参数**

- 属性对象，`Record<string, number | string | boolean>`，`必需`

**返回值**

- 标签函数，用于创建样式化组件。

**用法**


```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const InputWithValue = styled.input.attrs({ value: "I'm input with default value. 🥺" })`
  width: 100%;
  height: 40px;
`
</script>

<template>
  <InputWithValue type="text" />
</template>
```
