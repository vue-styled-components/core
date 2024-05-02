<div align="center">
  <img alt="Owner avatar" src="https://vue-styled-components.com/logo.png" width="220px" />
  <h1>Vue Styled Components</h1>
  一个类似于 styled-components 的 CSS 工具，支持 Vue 3，并帮助您快速开发应用程序！

  <br>
  <br>

  [![CI status][github-action-image]][github-action-url]
  [![NPM version][npm-version]][npm-url]
  [![minzip size][npm-bundle-size]][npm-url]

  [github-action-image]: https://github.com/v-vibe/vue-styled-components/workflows/Code%20Check/badge.svg
  [github-action-url]: https://github.com/v-vibe/vue-styled-components/actions/workflows/code-check.yml
  [npm-version]: https://img.shields.io/npm/v/%40vvibe%2Fvue-styled-components
  [npm-bundle-size]: https://img.shields.io/bundlephobia/minzip/%40vvibe%2Fvue-styled-components
  [npm-url]: http://npmjs.org/package/@vvibe/vue-styled-components
</div>

## ✨Feature

✅ 样式化 Vue 组件或样式化组件

✅ 添加默认属性

✅ 传递属性

✅ 支持主题化

✅ 生成关键帧

✅ 生成 CSS 混合

✅ 创建全局样式

✅ 覆盖属性

✅ 支持 CSS 嵌套。（仅支持 web: https://drafts.csswg.org/css-nesting/#nesting）

## 📦安装

```sh
npm i @vvibe/vue-styled-components
```

```sh
yarn add @vvibe/vue-styled-components
```

```sh
pnpm i @vvibe/vue-styled-components
```

## 🔨使用

### 样式化组件

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components';
import OtherComponent from './VueComponent.vue';

const StyledDiv = styled('div')`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: #000;
`;
const StyledStyledDiv = styled(StyledDiv)`
  width: 100px;
  height: 100px;
  background-color: #000;
  color: #fff;
`;
const StyledOtherComponent = styled(OtherComponent)`
  width: 100px;
  height: 100px;
  background-color: red;
  color: #fff;
`;
</script>

<template>
  <StyledDiv>Styled Div</StyledDiv>
  <StyledStyledDiv>Styled Styled Div</StyledStyledDiv>
  <StyledOtherComponent>Styled Other Vue Component</StyledOtherComponent>
</template>
```

### Attributes 设置

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components';

const StyledDiv = styled.div.attrs({
  class: 'styled-div'
})`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: #000;
`;
</script>

<template>
  <StyledDiv>Styled Div</StyledDiv>
  <!-- <div class="styled-div">Styled Div</div> -->
</template>
```

### 通过 Props 动态控制样式

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components';

const StyledDiv = styled('div', {
  color: '#fff'
})`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: ${(props) => props.color};
`;
</script>

<template>
  <StyledDiv>Styled Div</StyledDiv>
</template>
```

### 主题

```vue
<script setup lang="ts">
import { styled, ThemeProvider } from '@vvibe/vue-styled-components';

const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: ${(props) => props.theme.color};
`;
</script>

<template>
  <ThemeProvider :theme="{ color: '#fff' }">
    <StyledDiv>Styled Div</StyledDiv>
  </ThemeProvider>
</template>
```

### 生成 keyframes

您可以使用 `keyframes` 函数来定义关键帧动画，然后使用 `keyframes` 的返回值将其应用于样式化组件。

```vue
<script setup lang="ts">
import { styled, keyframes } from '@vvibe/vue-styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
const translate = keyframes`
  0 {
    transform: translateX(0);
  }
  50% {
    transform: translateX(250%);
  }
  60% {
    transform: rotate(360deg);
  }
`;

const StyledBaseDiv = styled.div`
  display: inline-block;
  width: 100px;
  height: 100px;
`;

const StyledRotateDiv = styled(StyledBaseDiv)`
  background-color: skyblue;
  animation: ${rotate} 2s linear infinite;
`;

const StyledTranslateDiv = styled(StyledBaseDiv)`
  margin-left: 10px;
  background-color: darkred;
  animation: ${translate} 2s ease infinite alternate;
`;
</script>

<template>
  <StyledRotateDiv />
  <StyledTranslateDiv />
</template>
```

### Create Global Style

一个用于创建全局样式的函数。

```vue
<script setup>
import { createGlobalStyle } from '@vvibe/vue-styled-components';

const GlobalStyle = createGlobalStyle`
    body {
      color: ${(props) => props.color};
    }
  `;
</script>
<template>
  <GlobalStyle color="white" />
</template>
```

### Generate CSS Mixin

一个用于从带有插值的模板字符串生成 CSS 的函数。

```vue
<script setup lang="ts">
import { styled, css } from '@vvibe/vue-styled-components';

const mixin = css`
  color: red;
  background-color: blue;
`;
const DivWithStyles = styled('div')`
  ${mixin}
`;
</script>

<template>
  <DivWithStyles>Div with mixin</DivWithStyles>
</template>
```

### 添加或覆盖 Attributes

一个向 `ComponentInstance` or `HTMLElements` 添加或覆盖 `Attributes` 的函数.

```vue
<script setup lang="ts">
import { withAttrs } from '@vvibe/vue-styled-components';

const DivWithAttrs = withAttrs('div', {
  class: 'div-with-attrs'
});

const DivWithAttrs2 = withAttrs(DivWithAttrs, {
  class: 'div-with-attrs-2'
});
</script>

<template>
  <DivWithAttrs>Div with attrs</DivWithAttrs>
  <DivWithAttrs2>Div with attrs 2</DivWithAttrs2>
</template>

<style scope>
.div-with-attrs {
  color: red;
}

.div-with-attrs-2 {
  color: blue;
}
</style>
```

**更多细节请查看 [官方文档](https://v-vibe.github.io/vue-styled-components/)**

## 贡献者

<a href="https://github.com/v-vibe/vue-styled-components/graphs/contributors">
  <img alt="contributor list" src="https://contrib.rocks/image?repo=v-vibe/vue-styled-components" />
</a>

另外，感谢 [styled-components](https://github.com/styled-components).
