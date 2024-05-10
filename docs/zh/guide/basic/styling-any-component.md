---
title:
outline: deep
---

# 样式化任意组件

## 样式化 Vue 组件

**这是一个链接组件。**

:::demo

```vue
<template>
  <a href="#">This is a link</a>
</template>
```

:::

使用 `styled` 函数来样式化 `Link` 组件，您可以得到一个深红色的 `Link`。

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components'
import Link from '/demo/Link.vue'

const StyledLink = styled(Link)`
  color: darkred !important;
`
</script>

<template>
  <StyledLink>This is a dark red link</StyledLink>
</template>
```

:::

## 样式化Styled组件

您也可以样式化已被样式化的组件。例如，使用 `StyledLink`，使用 `styled` 并传递样式，您可以得到一个蓝色的 `Link`。

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components'

const StyledLink = styled.a`
  color: darkred !important;
`

const StyledBlueLink = styled(StyledLink)`
  color: blue !important;
`
</script>

<template>
  <StyledBlueLink>This is a blue link</StyledBlueLink>
</template>
```

:::

:::tip 注意
**样式化第三方组件或自定义组件也是支持的。**
:::
