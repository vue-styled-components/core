---
outline: deep
---

# 扩展样式

## 扩展 Styled 组件

`styled` 函数允许您基于现有组件轻松创建新的样式变体，从而实现更高的代码可重用性和可维护性。

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components';

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

在此示例中，我们演示了如何使用 `@vvibe/vue-styled-components` 扩展样式。我们首先定义了一个具有蓝色背景的样式化按钮组件称为 `BlueButton`。然后，我们使用 `styled` 函数将 `BlueButton` 组件作为参数传递给另一个 `styled` 函数，创建了一个新组件称为 `RedButton`，其背景为深红色，文本为白色。

## As

对于更高级的用例，您可以向样式化组件传递 `as` 属性以更改元素类型。

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components';

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
