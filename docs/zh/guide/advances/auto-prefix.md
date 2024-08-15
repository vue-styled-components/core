---
outline: deep
---

# 自动添加浏览器私有前缀

The `@vvibe/vue-styled-components` package uses the `stylis` library to add vendor prefixes.

这是 `@vvibe/vue-styled-components` 包的一部分。它会自动为 CSS 规则添加浏览器私有前缀。这可以确保你的 CSS 规则在最常见的浏览器中兼容，这有助于提高你的网站兼容性。

`@vvibe/vue-styled-components` 使用 `stylis` 库来编译以及添加浏览器私有前缀。

```js
import { styled } from '@vvibe/vue-styled-components';
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