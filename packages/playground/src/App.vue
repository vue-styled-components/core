<script setup lang="ts">
import styled, { ThemeProvider } from '@vue-styled-components/core'
import { reactive } from 'vue'

const Button = styled.button`
  color: ${(props) => props.theme.fg};
  background: ${(props) => props.theme.bg};
`

const theme = reactive({
  fg: 'red',
  bg: 'blue',
})

const changeTheme = () => {
  if (theme.fg === 'red') {
    theme.fg = 'blue'
    theme.bg = 'red'
  } else {
    theme.fg = 'red'
    theme.bg = 'blue'
  }
}
</script>

<template>
  <ThemeProvider :theme="theme">
    <Button @click="changeTheme">666</Button>
    <ThemeProvider
      :theme="
        (t) => {
          return { fg: t.bg, bg: t.fg, aa: 2111 }
        }
      "
    >
      <Button>777</Button>
    </ThemeProvider>
  </ThemeProvider>
</template>

<style>
body {
  background: #222;
}
</style>
