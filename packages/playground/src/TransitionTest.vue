<template>
  <button @click="toggle">Toggle</button>
  <transition name="trans">
    <StyledBox v-if="visible" />
  </transition>
</template>

<script setup>
import { styled } from "@vue-styled-components/core";
import { ref } from "vue";

const StyledBox = styled.div`
  width: 100px;
  height: 100px;
  background: red;
`;

const visible = ref(true);
function toggle() {
  visible.value = !visible.value;
}
</script>

<style>
.trans-enter-active,
.trans-leave-active {
  transition: transform 0.5s ease;
}
.trans-enter-from,
.trans-leave-to {
  transform: translateY(100%);
}
</style>
