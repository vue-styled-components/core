---
outline: deep
---

# Hook

## `useStyledClassName`

**返回**

- `getStyledClassName`, `styledComponentInstance => string`
- `styledClassNameMap`, `Record<string, string>`, `{[componentName]: className}`

**用法**

```vue
<script setup lang="ts">
  import { styled, useStyledClassName } from '@vvibe/vue-styled-components'

  const StyledDiv = styled.div`
    background: #ccc;
  `
  const { getStyledClassName } = useStyledClassName()
  console.log(getStyledClassName(StyledDiv)) // styled-xxx(unique id)
</script>
```