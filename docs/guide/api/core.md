---
outline: deep
---

# Core

### `styled`

It is a factory function.

#### Properties

| Properties | Description                                                                                                                              |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| HTML Tag   | See [Supported HTML Tags](https://github.com/vue-styled-components/vue3-styled-components/blob/master/package/constants/domElements.ts). |
| attrs      | Pass attrs for styled component.                                                                                                         |

#### Arguments

| Params           | Type                    |
|------------------|-------------------------|
| Tag Name         | `SupportedHTMLElements` |
| Props Definition | `Record<string, any>`   |

#### Return

- `Tag Function`, used to create a styled component.

#### Usage

:::demo

```vue

<script setup>
  import { styled } from '@vue3-styled-components/package'

  const StyledDiv = styled('div', { color: String })`
    width: 100%;
    height: 100px;
    border-radius: 4px;
    background-color: #6a488f;
    text-align: center;
    line-height: 100px;
    color: ${props => props.color};
  `
</script>

<template>
  <StyledDiv color="#fff">Hi, I'm styled component.🥺</StyledDiv>
</template>
```

:::

### `.arrts`

It is used for passing attributes to styled component.

#### Arguments

| Params       | Type                               |
|--------------|------------------------------------|
| Attrs Object | `Record<string, number \| string>` |

#### Return

- `Tag Function`, used to create a styled component.