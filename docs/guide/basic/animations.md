# Keyframes

You can use the `keyframes` function to define a keyframe animation and then use the return value from `keyframes` to
apply it to
a styled component.

:::demo

```vue
<script setup lang="ts">
import { styled, keyframes } from '@vue-styled-components/core'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`
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
`

const StyledBaseDiv = styled.div`
  display: inline-block;
  width: 100px;
  height: 100px;
`

const StyledRotateDiv = styled(StyledBaseDiv)`
  background-color: skyblue;
  animation: ${rotate} 2s linear infinite;
`

const StyledTranslateDiv = styled(StyledBaseDiv)`
  margin-left: 10px;
  background-color: darkred;
  animation: ${translate} 2s ease infinite alternate;
`
</script>

<template>
  <StyledRotateDiv />
  <StyledTranslateDiv />
</template>
```

:::
