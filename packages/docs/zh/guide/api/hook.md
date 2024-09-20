---
outline: deep
---

# Hook

## `useTheme`

**Return**

- `DefaultTheme`

**使用**

```vue
<script setup lang="ts">
  import styled, { useTheme } from '@vue-styled-components/core'
  
  const theme = useTheme()

  const StyledDiv = styled.div`
    background: ${ theme.bg };
  `
</script>
```