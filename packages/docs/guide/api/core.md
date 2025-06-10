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

### CSS Objects

**Augments**

- CSS Object, `Record<string, string | number>`, `required`

**Return**

- Vue Component, `DefineSetupFnComponent`

**Usage**

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
  <StyledDiv>CSS Object Styled Component</StyledDiv>
</template>
```

### Style Functions

**Augments**

- Style Function, `(props: ComponentProps) => Record<string, string | number>`, `required`

**Return**

- Vue Component, `DefineSetupFnComponent`

**Usage**

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
    Dynamic Button
  </StyledButton>
</template>
```

### `.props()`

**Augments**

- Props Definition, `Record<string, any>`, `required`

**Return**

- Styled Factory with Props, used to chain with element methods

**Usage**

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledInput = styled
  .props({
    borderColor: { type: String, default: '#ccc' },
    size: { type: String, default: 'medium' }
  })
  .input(({ borderColor, size }) => ({
    border: `1px solid ${borderColor}`,
    padding: size === 'large' ? '12px' : '8px'
  }))
</script>

<template>
  <StyledInput borderColor="#007bff" size="large" />
</template>
```
