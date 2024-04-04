# Vue3 Styled Components

**A CSS tool similar with `styled-components`. Help you to develop your apps fastly!**

## Feature

✅ Support all HTML elements

✅ Add attrs

✅ Control dynamic style by props

✅ Style vue component or styled component

✅ Theme provider

## Usage

### Styled component

```vue
<script setup lang="ts">
import { styled } from 'vue3-styled-components'
import OtherComponent from './VueComponent.vue'

const StyledDiv = styled('div')`
    width: 100px;
    height: 100px;
    background-color: #ccc;
    color: #000;
`
const StyledStyledDiv = styled(StyledDiv)`
    width: 100px;
    height: 100px;
    background-color: #000;
    color: #fff;
`
const StyledOtherComponent = styled(OtherComponent)`
    width: 100px;
    height: 100px;
    background-color: red;
    color: #fff;
`
</script>

<template>
    <StyledDiv>Styled Div</StyledDiv>
    <StyledStyledDiv>Styled Styled Div</StyledStyledDiv>
    <StyledOtherComponent>Styled Other Vue Component</StyledOtherComponent>
</template>
```

### Attrs

```vue
<script setup lang="ts">
import { styled } from 'vue3-styled-components'

const StyledDiv = styled.div.attrs({
    class: 'styled-div',
})`
    width: 100px;
    height: 100px;
    background-color: #ccc;
    color: #000;
`
</script>

<template>
    <StyledDiv>Styled Div</StyledDiv>
    <!-- <div class="styled-div">Styled Div</div> -->
</template>
```

### Control Dynamic Style by Props

```vue
<script setup lang="ts">
import { styled } from 'vue3-styled-components'

const StyledDiv = styled('div', {
    color: '#fff'
})`
    width: 100px;
    height: 100px;
    background-color: #ccc;
    color: ${props => props.color};
`
</script>

<template>
    <StyledDiv>Styled Div</StyledDiv>
</template>
```

### Theme Provider

```vue
<script setup lang="ts">
import { styled, ThemeProvider } from 'vue3-styled-components'

const StyledDiv = styled.div`
    width: 100px;
    height: 100px;
    background-color: #ccc;
    color: ${props => props.theme.color};
`
</script>

<template>
    <ThemeProvider :theme="{ color: '#fff' }">
        <StyledDiv>Styled Div</StyledDiv>
    </ThemeProvider>
</template>
```