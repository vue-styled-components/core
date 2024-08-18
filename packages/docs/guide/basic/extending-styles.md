---
outline: deep
---

# Extending Styles

## Extending Styled Component

Extending styles allows you to easily create new style variants based on existing components, thereby achieving higher
code reusability and maintainability.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core';

const BlueButton = styled.button`
  width: 120px;
  height: 40px;
  margin-right: 8px;
  padding: 4px 8px;
  border-radius: 9999px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  background-color: skyblue;
  font-weight: bold;
`;
const RedButton = styled(BlueButton)`
  background-color: darkred;
  color: white;
`;
</script>

<template>
  <BlueButton>Blue Button</BlueButton>
  <RedButton>Red Button</RedButton>
</template>
```

:::

In this example, we demonstrate how to extend styles using  `@vue-styled-components/core` . We first define a styled button component
with a blue background called `BlueButton`. Then, we use the styled function to pass the `BlueButton` component as a
parameter to another styled function, creating a new component called `RedButton` with a dark red background and white
text.

## As

For more advanced use cases, you can pass the `as` props to the styled component to change the element type.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core';

const BlueButton = styled.button`
  width: 120px;
  height: 40px;
  margin-right: 8px;
  padding: 4px 8px;
  border-radius: 9999px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  background-color: skyblue;
  font-weight: bold;
`;
const RedButton = styled(BlueButton)`
  background-color: darkred;
  color: white;
`;
const LinkButton = styled(BlueButton)`
  border: none;
  background-color: transparent;
  box-shadow: none;
`;
</script>

<template>
  <BlueButton>Blue Button</BlueButton>
  <RedButton>Red Button</RedButton>
  <LinkButton as="a" href="#">Link Button</LinkButton>
</template>
```

:::
