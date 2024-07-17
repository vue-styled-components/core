---
outline: deep
---

# Hook

## useStyledClassName  <div style="display: inline-flex; align-items: center;"><Badge type="info" text="deprecated at v1.3.0.beta.1" /></div>

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