<div align="center">
  <img alt="Owner avatar" src="https://vue-styled-components.com/logo.png" width="220px" />
  <h1>Vue Styled Components</h1>
  A CSS tool similar to styled-components and support for vue 3. Help you to develop your apps fastly!

  <br>
  <br>

  [![CI status][github-action-image]][github-action-url]
  [![NPM version][npm-version]][npm-url]
  [![minified size][npm-bundle-size]][npm-url]
  [![Coverage Status][coverage]][codecov-url]
  [![chat on discord][discord]][discord-url]

  [github-action-image]: https://github.com/vue-styled-components/core/workflows/Code%20Check/badge.svg
  [github-action-url]: https://github.com/vue-styled-components/core/actions/workflows/code-check.yml
  [npm-version]: https://img.shields.io/npm/v/%40vue-styled-components%2Fcore
  [npm-bundle-size]: https://img.shields.io/bundlejs/size/%40vue-styled-components%2Fcore
  [npm-url]: http://npmjs.org/package/@vue-styled-components/core
  [coverage]: https://coveralls.io/repos/github/vue-styled-components/core/badge.svg?branch=main
  [codecov-url]: https://coveralls.io/github/vue-styled-components/core?branch=main
  [discord]: https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true
  [discord-url]: https://discord.gg/UbJxnvt2UH

[Changelog](./CHANGELOG.md) · English · [中文](./README.zh_CN.md)

</div>

## ✨Feature

✅ Style vue component or styled component

✅ Set default attrs

✅ Passed props

✅ Support theming

✅ Generate keyframes

✅ Generate css mixin

✅ Create global style

✅ Add or override attrs

✅ Support nesting css.

✅ Auto-prefix css.

...

## 📖Documentation

For detailed introduction and usage instructions, please refer to [the documentation website](https://vue-styled-components.com)

## 🚀Getting Start

### 📦Install

```sh
npm i @vue-styled-components/core
```

```sh
yarn add @vue-styled-components/core
```

```sh
pnpm i @vue-styled-components/core
```

### 💅Basic

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core';
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

### 🔧Attrs Setting

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core';

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

### 🕹️Control Dynamic Style by Props

You must define the props in the `styled` function if you want to use them in the style. Because Vue components
require explicit props declaration so that Vue knows what external props passed to the component should be treated as
fallthrough attributes.(see [Props Declaration](https://vuejs.org/guide/components/props.html#props-declaration))

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core';

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

### 🧙Theming

```vue
<script setup lang="ts">
import { styled, ThemeProvider } from '@vue-styled-components/core';

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

**More details see [docs site](https://v-vibe.github.io/vue-styled-components/)**

## 🧑‍🤝‍🧑Contributors

<a href="https://github.com/vue-styled-components/core/graphs/contributors">
  <img alt="contributor list" src="https://contrib.rocks/image?repo=vue-styled-components/core" />
</a>

<br>

## ❤ Thanks

- [styled-components](https://github.com/styled-components).
- [stylis](https://github.com/thysultan/stylis)

## Worker性能测试

`vue-styled-components`使用Web Worker进行复杂样式计算，以避免阻塞主线程。我们提供了性能测试工具来比较Worker和主线程在不同场景下的性能差异。

### 运行测试

```bash
# 在浏览器中运行可视化性能测试
npm run test:worker

# 在命令行中运行性能测试
npm run benchmark:worker
```

### 测试代码结构

性能测试相关的代码位于项目根目录的`worker-benchmark`文件夹中：

- `worker-benchmark.ts` - 核心的基准测试实现
- `worker-performance.ts` - 单元测试形式的性能测试
- `api.ts` - 提供用于基准测试和可视化的API
- `worker-demo.html` - 带有图表显示的可视化测试页面

### 测试场景

测试覆盖以下几个场景：

1. **简单样式计算** - 少量简单的CSS规则
2. **复杂样式计算** - 多个复杂的CSS规则
3. **大量样式计算** - 大量的CSS规则，模拟大型应用场景
4. **混合样式计算** - 混合简单和复杂的CSS规则
5. **阈值边界测试** - 测试接近复杂度阈值的场景
6. **Worker不可用场景** - 模拟Worker不可用时的回退机制

### 性能优化

根据测试结果，我们实现了智能的样式计算策略：

- 对于简单样式（规则数量少于阈值），直接在主线程中计算，避免Worker创建和通信开销
- 对于复杂样式，使用Worker异步计算，避免阻塞主线程
- 当Worker不可用时，自动回退到主线程计算

这种策略在保持良好性能的同时，确保了样式计算的可靠性和兼容性。
