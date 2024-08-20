---
outline: deep
---

# Use Tailwind CSS

Starting from version `1.6.0`, `@vue-style-components/core` provides a `tw` function to insert `Tailwind CSS` classes into the `class` attribute of a Vue Component.

> Before staring to use `Tailwind CSS`, you need to install it first. ([How to install Tailwind CSS?](https://tailwindcss.com/docs/installation/using-postcss))

## Basic Usage

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const StyledDiv = styled.div`
  ${tw`w-20 h-20 bg-red-500`}
`
</script>
<template>
  <StyledDiv />
</template>
```

## Use tailwind css conditionally

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const StyledDiv = styled('div', { isRed: true })`
  width: 20px;
  height: 20px;
  ${props => props.isRed && tw`bg-red-500`}
`
</script>
<template>
  <StyledDiv />
</template>
```

## Compose Tailwind CSS

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const twButton = tw`px-4 py-2 rounded-md`

const StyledSmallButton = styled.div`
  width: 20px;
  height: 20px;
  ${twButton}
`

const StyledLargeButton = styled.div`
  width: 40px;
  height: 20px;
  ${twButton}
`
</script>
<template>
  <StyledSmallButton>small button</StyledSmallButton>
  <StyledLargeButton>large button</StyledLargeButton>
</template>
```

## Dynamic Tailwind CSS Classes

```vue
<script setup lang="ts">
import styled, { tw } from '@vue-styled-components/core'

const color = 'red'

const StyledDiv = styled('div', { isRed: true })`
  width: 20px;
  height: 20px;
  ${tw`bg-red-500 ${`bg-${color}-500`}`}
`
</script>
<template>
  <StyledDiv />
</template>
```
