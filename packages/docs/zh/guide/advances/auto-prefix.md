---
outline: deep
---

# 自动添加浏览器私有前缀

The `@vue-styled-components/core` package uses the `stylis` library to add vendor prefixes.

这是 `@vue-styled-components/core` 包的一部分。它会自动为 CSS 规则添加浏览器私有前缀。这可以确保你的 CSS 规则在最常见的浏览器中兼容，这有助于提高你的网站兼容性。

`@vue-styled-components/core` 使用 `stylis` 库来编译以及添加浏览器私有前缀。

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