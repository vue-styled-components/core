<script setup lang="ts">
import { styled } from '@vue3-styled-components/package'

const StyledDiv = styled.div.attrs<{ class: string }>({ class: 'test' })`
  width: 400px;
  height: 100px;
  background-color: red;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
`
</script>

<template>
  <StyledDiv as="p"></StyledDiv>
</template>
