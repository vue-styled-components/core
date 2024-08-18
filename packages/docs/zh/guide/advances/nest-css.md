---
outline: deep
---

# 嵌套 CSS

你可以像 `less`, `sass` 一样使用嵌套 CSS。 `@vue-styled-components/core` 并非使用最新的CSS规范([nest css](https://drafts.csswg.org/css-nesting/#nesting))来实现，而是使用了 `stylis` 编译为最基础的 CSS，因此你不需要担心其兼容性问题。

如下：

```js
import { styled } from '@vue-styled-components/core';
const StyledDiv = styled.div`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  color: #000;
  &:hover {
    background-color: #000;
    color: #fff;
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