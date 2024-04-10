---
outline: deep
---

## Installation

```shell
npm i vue3-styled-components
```

```shell
yarn add vue3-styled-components
```

```shell
pnpm i vue3-styled-components
```

## Getting Started

:::demo

```vue

<script setup lang="ts">
  import { styled } from '@vue3-styled-components/package'

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