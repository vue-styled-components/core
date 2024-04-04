<script setup lang="tsx">
import { styled, ThemeProvider } from '@vue3-styled-components/package'
import Component from './Component.vue'
import { ref } from 'vue'

const theme = ref({ primary: 'green', error: 'red' })

const update = () => {
  theme.value.primary = theme.value.primary === 'red' ? 'green' : 'red'
}

const StyledComp3 = styled(Component)`
  background: ${(props) => props.theme.primary};
`
const StyledComp4 = styled.div`
  background: ${(props) => props.theme.error};
`
const StyledComp5 = styled(StyledComp4)`
  background: ${(props) => props.theme.error};
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
