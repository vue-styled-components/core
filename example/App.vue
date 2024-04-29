<script setup lang="tsx">
import { styled, ThemeProvider, keyframes, useStyledClassName, withAttrs, css } from '@vue-styled-components/core'
import Component from './Component.vue'
import { ref } from 'vue'

const theme = ref({ primary: 'green', error: 'red' })

const kf = keyframes`
  from {
    margin-left: 100%;
    width: 300%;
  }

  to {
    margin-left: 0%;
    width: 100%;
  }
`

const update = () => {
  theme.value.primary = theme.value.primary === 'red' ? 'green' : 'red'
}

const StyledComp3 = styled(Component)`
  background: ${(props: any) => props.theme.primary};
`
const StyledComp4 = styled.div`
  background: ${(props: any) => props.theme.error};
`
const StyledComp5 = styled.div`
  width: 40px;
  height: 40px;
  background: ${(props: any) => props.theme.error};
  animation-duration: 3s;
  animation-name: ${kf};
  animation-iteration-count: infinite;
`

const StyledComp6 = styled('button', { color: String })`
  width: 40px;
  height: 40px;
  color: ${(props: any) => props.color};
`

const WithAttrsComp = withAttrs(StyledComp6, { disabled: true })

console.log(useStyledClassName().getStyledClassName(StyledComp6))

const mixin = css`
  color: ${(props) => props.color};
`
const StyledComp7 = styled('button', { color: String })`
  ${mixin}
`
</script>

<template>
  <ThemeProvider :theme="theme">
    <StyledComp3 @click="update">12345</StyledComp3>
    <StyledComp4>12345</StyledComp4>
    <StyledComp5>12345</StyledComp5>
    <WithAttrsComp color="red">123</WithAttrsComp>
    <StyledComp7 color="blue">123</StyledComp7>
  </ThemeProvider>
</template>

<style>
body {
  background: #222;
}
</style>
