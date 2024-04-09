<script setup lang="tsx">
import { styled, ThemeProvider, keyframes } from '@vue3-styled-components/package'
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
</script>

<template>
  <ThemeProvider :theme="theme">
    <StyledComp3 @click="update">12345</StyledComp3>
    <StyledComp4>12345</StyledComp4>
    <StyledComp5>12345</StyledComp5>
  </ThemeProvider>
</template>

<style>
body {
  background: #222;
}
</style>
