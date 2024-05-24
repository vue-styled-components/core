<div align="center">
  <img alt="Owner avatar" src="https://vue-styled-components.com/logo.png" width="220px" />
  <h1>Vue Styled Components</h1>
  一个类似于 styled-components 的 CSS in JS 库，支持 Vue 3，并帮助您快速开发应用程序！

  <br>
  <br>

  [![CI status][github-action-image]][github-action-url]
  [![NPM version][npm-version]][npm-url]
  [![minzip size][npm-bundle-size]][npm-url]
  [![Coverage Status][coverage]][codecov-url]
  [![chat on discord][discord]][discord-url]

  [github-action-image]: https://github.com/v-vibe/vue-styled-components/workflows/Code%20Check/badge.svg
  [github-action-url]: https://github.com/v-vibe/vue-styled-components/actions/workflows/code-check.yml
  [npm-version]: https://img.shields.io/npm/v/%40vvibe%2Fvue-styled-components
  [npm-bundle-size]: https://img.shields.io/bundlephobia/minzip/%40vvibe%2Fvue-styled-components
  [npm-url]: http://npmjs.org/package/@vvibe/vue-styled-components
  [coverage]: https://coveralls.io/repos/github/v-vibe/vue-styled-components/badge.svg?branch=main
  [codecov-url]: https://coveralls.io/github/v-vibe/vue-styled-components?branch=main
  [discord]: https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true
  [discord-url]: https://discord.gg/UbJxnvt2UH

  [Changelog](./CHANGELOG.md) · [English](./README.md) · 中文
</div>

## ✨特性

✅ 样式化 Vue 组件或原生组件

✅ 设置默认 Attributes

✅ 传递 Props

✅ 支持主题化

✅ 生成 keyframes

✅ 生成可复用 CSS 片段

✅ 创建全局样式

✅ 添加或覆盖 Attributes

✅ 支持 CSS 嵌套。（仅支持 web: https://drafts.csswg.org/css-nesting/#nesting）

## 文档

详细的介绍和使用方法，请参考[官方文档](https://vue-styled-components.com)

## 快速开始

### 📦安装

```sh
npm i @vvibe/vue-styled-components
```

```sh
yarn add @vvibe/vue-styled-components
```

```sh
pnpm i @vvibe/vue-styled-components
```

### 🔨用法

#### 基本使用

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

#### Attributes 设置

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

#### 通过 Props 动态控制样式

如果要在样式中传递 props，则必须在 styled 函数中定义这些属性。因为 Vue 组件需要显式声明 props，以便 Vue 知道应如何处理传递给组件的外部 props（请参阅 [Props Declaration](https://vuejs.org/guide/components/props.html#props-declaration)）

```vue
<script setup lang="ts">
import { styled } from '@vvibe/vue-styled-components';

const StyledDiv = styled('div', {
  color: String
})`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: ${(props) => props.color};
`;
</script>

<template>
  <StyledDiv color="red">Styled Div</StyledDiv>
</template>
```

#### 主题

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

#### 生成 keyframes

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

**更多细节请查看 [官方文档](https://vue-styled-components.com)**

## 贡献者

<a href="https://github.com/v-vibe/vue-styled-components/graphs/contributors">
  <img alt="contributor list" src="https://contrib.rocks/image?repo=v-vibe/vue-styled-components" />
</a>

<br>

另外，感谢 [styled-components](https://github.com/styled-components).
