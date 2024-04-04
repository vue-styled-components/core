<script setup lang="tsx">
import { styled } from '@vue3-styled-components/package'
import Component from './Component.vue'

const StyledComp = styled('div').attrs({
  primary: true
})`
  background: ${(props) => (props.primary ? ' red ' : 'blue')};
`
const StyledComp3 = styled(StyledComp).attrs({
  primary: false
})`
  background: ${(props) => (props.primary ? ' red ' : 'blue')};
`
const StyledComp2 = styled(Component).attrs({
  primary: false
})`
  color: white;
  background: ${(props) => (props.primary ? ' red ' : 'blue')};
`
</script>

<template>
  <StyledComp>12345</StyledComp>
  <StyledComp3>
    <div>永远永远</div>
  </StyledComp3>
  <StyledComp2>哇哈哈</StyledComp2>
</template>
