---
outline: deep
---

# Auto Prefix Added

This feature is a part of the `@vue-styled-components/core` package. It automatically adds vendor prefixes to CSS rules. This ensures that your CSS rules are compatible with the most widely used browsers, which can help improve the compatibility of your website.

The `@vue-styled-components/core` package uses the `stylis` library to add vendor prefixes.

Here's an example:

```js
import { styled } from '@vue-styled-components/core'
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
