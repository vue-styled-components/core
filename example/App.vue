<script setup lang="ts">
import { styled } from '@vue3-styled-components/package'

const StyledComp = styled('div').attrs({ primary: false })`
  background: ${(props: Record<string, any>) => (props.primary ? ' red ' : 'blue')};
`
</script>

<template>
  <StyledComp abc>12345</StyledComp>
</template>
