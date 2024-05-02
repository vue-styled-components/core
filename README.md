<div align="center">
  <img alt="Owner avatar" src="https://vue-styled-components.com/logo.png" width="220px" />
  <h1>Vue Styled Components</h1>
  A CSS tool similar to `styled-components` and support for vue 3. Help you to develop your apps fastly!

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

✅ Style vue component or styled component

✅ Add default attrs

✅ Passed props

✅ Support theming

✅ Generate keyframes

✅ Generate css mixin

✅ Create global style

✅ Override attrs

✅ Support nesting css. (web only: https://drafts.csswg.org/css-nesting/#nesting)

## 📦Install

```sh
npm i @vvibe/vue-styled-components
```

```sh
yarn add @vvibe/vue-styled-components
```

```sh
pnpm i @vvibe/vue-styled-components
```

## 🔨Usage

### Styled component

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

### Attrs Setting

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

### Control Dynamic Style by Props

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

### Theming

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

### Generate Keyframes

You can use the `keyframes` function to define a keyframe animation and then use the return value from `keyframes` to
apply it to a styled component.

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

A function to create a `style component` that can be used to handle global styles.

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

A function to generate CSS from a template literal with interpolations.

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

### Override Attrs

A function to add attributes to a `ComponentInstance` or `HTMLElements`.

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

**More details see [docs site](https://v-vibe.github.io/vue-styled-components/)**

## Contributors

<a href="https://github.com/v-vibe/vue-styled-components/graphs/contributors">
  <img alt="contributor list" src="https://contrib.rocks/image?repo=v-vibe/vue-styled-components" />
</a>

And thanks [styled-components](https://github.com/styled-components).
