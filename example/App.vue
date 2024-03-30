<script setup lang="ts">
import {styled} from "../src/styled";

const StyledDiv = styled('div')`
  width: 400px;
  height: 100px;
  background-color: red;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;
const StyledButton = styled('button')`
  width: 100px;
  height: 100px;
  background-color: blue;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const StyledSpan = styled.span`
  width: 100px;
  height: 100px;
  background-color: yellow;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
`
</script>

<template>
  <StyledDiv>
    <div>1221222ww32</div>
    <div>1221222ww32</div>
    <div>1221222ww32</div>
  </StyledDiv>
  <StyledButton>哈哈哈哈</StyledButton>
  <button>123</button>
  <StyledSpan />
</template>
