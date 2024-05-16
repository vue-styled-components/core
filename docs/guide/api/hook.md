---
outline: deep
---

# Hook

## `useStyledClassName`

**Return**

- `getStyledClassName`, `styledComponentInstance => string`
- `styledClassNameMap`, `Record<string, string>`, `{[componentName]: className}`

**Usage**

```vue
<script setup lang="ts">
  import { styled, useStyledClassName } from '@vvibe/vue-styled-components'

  const StyledDiv = styled.div`
    background: #ccc;
  `
  console.log(useStyledClassName(StyledDiv)) // styled-xxx(unique id)
</script>
```