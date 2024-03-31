<script setup lang="ts">
import { styled } from '@vue3-styled-components/package'

console.log(styled.div, `abc: ${(props) => (props.primary ? ' palevioletred ' : ' white ')}`)
const StyledComp = styled.div`
  background: ${(props) => (props.primary ? ' palevioletred ' : ' white ')};
`
</script>

<template>
  <StyledComp abc>12345</StyledComp>
</template>
