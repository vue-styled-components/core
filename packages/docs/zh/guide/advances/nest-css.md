---
outline: deep
---

# 嵌套 CSS

## 基础用法

你可以像 `less`, `sass` 一样使用嵌套 CSS。 `@vue-styled-components/core` 并非使用最新的CSS规范([nest css](https://drafts.csswg.org/css-nesting/#nesting))来实现，而是使用了 `stylis` 编译为最基础的 CSS，因此你不需要担心其兼容性问题。

如下：

```js
import { styled } from '@vue-styled-components/core'
const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: #000;
  &:hover {
    background-color: #000;
    color: #fff;
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

## 使用组件作为选择器

你可以使用 `StyledComponent` 作为选择器，会自动转换为类选择器。例如：

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
