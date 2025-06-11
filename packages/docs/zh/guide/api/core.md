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

- Attrs 对象或构造函数，`Record<string, any> ｜  ((props: Context) => Record<string, any>)`，`必需`

**返回值**

- 标签函数，用于创建样式化组件。

**用法**

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

### CSS 对象

**参数**

- CSS 对象，`Record<string, string | number>`，`必需`

**返回值**

- Vue 组件，`DefineSetupFnComponent`

**用法**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledDiv = styled.div({
  color: 'red',
  fontSize: '16px',
  backgroundColor: 'blue',
  padding: '10px'
})
</script>

<template>
  <StyledDiv>CSS 对象样式化组件</StyledDiv>
</template>
```

### 样式函数

**参数**

- 样式函数，`(props: ComponentProps) => Record<string, string | number>`，`必需`

**返回值**

- Vue 组件，`DefineSetupFnComponent`

**用法**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

interface ButtonProps {
  disabled: boolean
  size: 'small' | 'medium' | 'large'
}

const StyledButton = styled.button<ButtonProps>(({ disabled, size }) => ({
  color: disabled ? '#fff' : '#007bff',
  padding: size === 'large' ? '12px 24px' : '8px 16px',
  backgroundColor: disabled ? '#ccc' : '#f8f9fa'
}))
</script>

<template>
  <StyledButton :disabled="false" size="medium">
    动态按钮
  </StyledButton>
</template>
```

### `.props()`

**参数**

- 属性定义，`Record<string, any>`，`必需`

**返回值**

- 带属性的样式化工厂，用于与元素方法链式调用

**用法**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledInput = styled
  .input
  .props({
    borderColor: { type: String, default: '#ccc' },
    size: { type: String, default: 'medium' }
  })(({ borderColor, size }) => ({
    border: `1px solid ${borderColor}`,
    padding: size === 'large' ? '12px' : '8px'
  }))
</script>

<template>
  <StyledInput borderColor="#007bff" size="large" />
</template>
```
