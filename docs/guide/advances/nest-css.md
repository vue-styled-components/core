---
outline: deep
---

# Nest CSS

In Vue Styled Components, you can write CSS in the same way as `less` or `sass`. `@vvibe/vue-styled-components` is based on `stylis` compiling CSS to basic css, so you needn't worry about the compatibility.

For example, you can write CSS like this:

```js
import { styled } from '@vvibe/vue-styled-components';
const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  &:hover {
    background-color: #000;
    &:active {
      background-color: #fff;
    }
  }
}`

// output:
// .styled-xxx {
//     width: 100px;
//     height: 100px;
// }
// .styled-xxx:hover {
//     background-color: #000;
// }
// .styled-xxx:hover:active {
//     background-color: #fff;
// }
```