---
outline: deep
---

# Nest CSS

## Basic Usage

In Vue Styled Components, you can write CSS in the same way as `less` or `sass`. `@vue-styled-components/core` is based on `stylis` compiling CSS to basic css, so you needn't worry about the compatibility.

For example, you can write CSS like this:

```js
import { styled } from '@vue-styled-components/core'
const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  &:hover {
    background-color: #000;
    &:active {
      background-color: #fff;
    }
  }
}`

// output:
// .styled-xxx {
//     width: 100px;
//     height: 100px;
// }
// .styled-xxx:hover {
//     background-color: #000;
// }
// .styled-xxx:hover:active {
//     background-color: #fff;
// }
```

## Use `Component` as Selector

You can use `StyledComponent` as selector. For example:

:::demo
```vue
<script setup lang="ts">
import styled, { ThemeProvider } from '@vue-styled-components/core'
import { reactive } from 'vue'

const Container = styled.div`
  display: inline-block;
  padding: 4px 12px;
`

const Button = styled.button`
  padding: 8px 24px;
  border-radius: 24px;
  color: white;
  background: black;
`

const NewContainer = styled(Container)`
  ${Button} {
    color: black;
    background: gray;
  }
`
</script>

<template>
<Container>
  <Button>Button</Button>
</Container>
<NewContainer>
  <Button>Button</Button>
</NewContainer>
</template>
```
:::
