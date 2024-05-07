---
outline: deep
---

# Quick Start

## Installation

Npm

```shell
npm i @vvibe/vue-styled-components
```

Yarn

```shell
yarn add @vvibe/vue-styled-components
```

Pnpm

```shell
pnpm i @vvibe/vue-styled-components
```

## Getting Started

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components'

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
