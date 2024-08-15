---
outline: deep
---

# Auto Prefix Added

This feature is a part of the `@vvibe/vue-styled-components` package. It automatically adds vendor prefixes to CSS rules based on the browser support you specify. This ensures that your CSS rules are compatible with the most widely used browsers, which can help improve the compatibility of your website.

The `@vvibe/vue-styled-components` package uses the `stylis` library to add vendor prefixes.

Here's an example:

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