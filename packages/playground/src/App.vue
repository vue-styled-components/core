<script setup lang="ts">
import styled, { ThemeProvider } from '@vue-styled-components/core'
import { reactive, ref } from 'vue'

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

const Container = styled.div`
  ${Button} {
    color: #fff;
  }
`

const Test = styled('div', { color: String })`
  color: ${(props) => props.color};
`

const StyledInput = styled('input', { color: String })`
  color: ${(props) => props.color};
`

const colors = ['red', 'blue', 'green']

const inputValue = ref(0)
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

    <Container>
      <Button>888</Button>
    </Container>

    <div v-for="c in colors" :key="c">
      <Test :color="c">
        {{ c }}
      </Test>
    </div>

    <StyledInput v-model:value="inputValue" />
    <button @click="inputValue++">click</button>
  </ThemeProvider>
</template>

<style>
body {
  background: #222;
}
</style>
