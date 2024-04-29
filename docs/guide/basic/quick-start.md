---
outline: deep
---

# Getting Started

## Installation

Npm

```shell
npm i vue-styled-components
```

Yarn

```shell
yarn add vue-styled-components
```

Pnpm

```shell
pnpm i vue-styled-components
```

## Getting Started

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-radius: 9999px;
  background-color: #4c5a6d;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
`
</script>

<template>
  <StyledDiv>Hello World!</StyledDiv>
</template>
```

:::
