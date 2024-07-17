<script setup lang="ts">
import { styled, ThemeProvider, keyframes, withAttrs, css, cssClass } from '@vvide/vue-styled-components'
import Component from './Component.vue'
import { ref } from 'vue'

const theme = ref({ primary: 'green', error: 'red' })

const color = ref('red')

const kf = keyframes`
  from {
    margin-left: 100%;
    width: 300%;
  }

  to {
    margin-left: 0%;
    width: 100%;
  }
`

const update = () => {
  theme.value.primary = theme.value.primary === 'red' ? 'green' : 'red'
  color.value = color.value === 'red' ? 'green' : 'red'
}

const StyledComp3 = styled(Component)`
  background: ${(props) => props.theme.primary};
`
const StyledComp4 = styled.div`
  background: ${(props) => props.theme.error};
`
const StyledComp5 = styled.div`
  width: 40px;
  height: 40px;
  background: ${(props) => props.theme.error};
  animation-duration: 3s;
  animation-name: ${kf};
  animation-iteration-count: infinite;
`

const StyledComp6 = styled('button', { color: String })<{
  color: string
}>`
  width: 40px;
  height: 40px;
  color: ${(props) => props.color};
`

const WithAttrsComp = withAttrs(StyledComp6, { disabled: true })

const mixin = css<{
  color: string
}>`
  color: ${(props) => props.color};
`
const cr = styled('button', { color: String })
const StyledComp7 = cr`
  ${mixin}
`
const BlueButton = styled.button`
  width: 120px;
  height: 40px;
  margin-right: 8px;
  padding: 4px 8px;
  border-radius: 9999px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  background-color: skyblue;
  font-weight: bold;
  color: #fff;

  .abc {
    color: red;
  }
`
const LinkButton = styled(BlueButton)`
  border: none;
`

const StyledLink = styled.a`
  color: #ccc;
`

const StyledBlueLink = styled(StyledLink, { color: String })`
  color: ${(props: any) => props.color};
`

const commonCSS = css`
  padding: 10px 20px;
  border-radius: 8px;
`

const commonClass = cssClass`
  ${commonCSS}
  color: #fff;
  background-color: red;
`

const testEmbedCss1 = css`
  margin: 40px;
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
`
const testEmbedCss2 = css`
  margin: 40px;
  background: blue;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
`

const show = ref(true)
const TestEmbedComponent = styled('div', { show: Boolean })`
  ${(props) => {
    return props.show ? testEmbedCss1 : testEmbedCss2
  }}
`

// console.log(testEmbedCss1, testEmbedCss2)
</script>

<template>
  <ThemeProvider :theme="theme">
    <StyledComp3 @click="update">12345</StyledComp3>
    <StyledComp4>12345</StyledComp4>
    <StyledComp5>12345</StyledComp5>
    <WithAttrsComp color="red">123</WithAttrsComp>
    <StyledComp7 color="blue">123</StyledComp7>
    <LinkButton as="a" href="#">Link Button</LinkButton>
    <StyledBlueLink :color="color" href="#" @click="update">Styled Link</StyledBlueLink>
    <div :class="commonClass">test common class</div>

    <TestEmbedComponent :show="show"> White </TestEmbedComponent>
    <TestEmbedComponent :show="!show" @click="show = !show"> Blue </TestEmbedComponent>
  </ThemeProvider>
</template>

<style>
body {
  background: #222;
}
</style>
