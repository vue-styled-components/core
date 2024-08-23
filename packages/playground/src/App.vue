<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const TestProps = styled.div<{
  color: string
}>`
  color: ${(props) => props.color};
`

const Test = styled('div', { color: String })`
  color: ${(props) => props.color};
`
</script>

<template>
  <Test color="orange">666</Test>

  <TestProps
    :props="{
      color: 'red',
    }"
  >
    tttttttt
  </TestProps>
</template>

<style>
body {
  background: #222;
}
</style>
