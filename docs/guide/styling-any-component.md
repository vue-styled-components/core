---
title:
outline: deep
---

# Styling Any Compoent

## Styling Vue Component

**This is a link component.**

:::demo

```vue
<template>
  <a href="#">This is a link</a>
</template>
```

:::

Using the `styled` function to style the `Link` component, you can achieve a `dark red link`.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue3-styled-components/package'
import Link from '/demo/Link.vue'

const StyledLink = styled(Link)`
  color: darkred !important;
`
</script>

<template>
  <StyledLink />
</template>
```

:::

## Styling Styled Component

You can also style styled components. For example, with `StyledLink`, using `styled` and passing styles, you can get a `blue link`.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue3-styled-components/package'
import StyledLink from '/demo/StyledLink.vue'

const StyledBlueLink = styled(StyledLink)`
  color: blue !important;
`
</script>

<template>
  <StyledBlueLink />
</template>
```

:::

:::tip NOTE
**Styling third-party component or custom component is also support.**
:::
