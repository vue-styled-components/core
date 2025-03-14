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

const Container = styled.div`
  ${Button} {
    color: #fff;
  }
`

const StyledDiv = styled.div<{
  color: string
}>`
  color: ${(props) => props.color || 'white'};
`

type StyledDivProps = {
  color: string
}

const StyledDiv2 = styled.div<StyledDivProps>`
  color: ${(props) => props.color || 'white'};
`

type StyledDiv3Props = {
  size: number
} & StyledDivProps

const StyledDiv3 = styled.div<StyledDiv3Props>`
  color: ${(props) => props.color || 'white'};
  font-size: ${(props) => props.size}px;
`

const StyledInput = styled.input.attrs<{color: string, inputType: string}>((props) => ({
  type: props.inputType,
}))`
  background: ${(props) => props.color};
  color: blue;
`

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

    <StyledDiv color="red">999</StyledDiv>
    <StyledDiv2 color="red">999</StyledDiv2>
    <StyledDiv3 color="red" :size="100">999</StyledDiv3>
    <StyledInput color="red" input-type="password" />
  </ThemeProvider>
</template>

<style>
body {
  background: #222;
}
</style>
