---
outline: deep
---

# 自动添加浏览器私有前缀

`@vue-styled-components/core` 会自动为 CSS 规则添加浏览器私有前缀。这可以确保你的 CSS 规则在最常见的浏览器中兼容，这有助于提高你的网站兼容性。

`@vue-styled-components/core` 通过 `stylis` 来编译以及添加浏览器私有前缀。

```js
import { styled } from '@vue-styled-components/core';
const StyledDiv = styled.div`
  display: flex;
}`

// output:
// .styled-div {
//   display: -webkit-box;
//   display: -webkit-flex;
//   display: -ms-flexbox;
//   display: flex;
// }
```