<script setup lang="ts">
import styled from '@vue-styled-components/core'

const Test = styled('div', { color: String }).attrs<{ disabled: boolean }>({ disabled: false })`
  color: ${(props) => props.color};
  background: ${(props) => (props.disabled ? 'gray' : 'red')};
`
const Test2 = styled('div', { color: String }).attrs<{ disabled: boolean }>((props) => ({
  disabled: props.color === 'orange',
}))`
  color: ${(props) => props.color};
  background: ${(props) => (props.disabled ? 'gray' : 'red')};
`
</script>

<template>
  <Test color="orange">666</Test>
  <Test2 color="orange">666</Test2>
</template>

<style>
body {
  background: #222;
}
</style>
