---
outline: deep
---

# CSS Objects and Style Functions

Starting from version v1.12.0, `@vue-styled-components/core` supports CSS objects and style functions, providing more flexible ways to define component styles.

## CSS Object Support

You can now pass CSS objects directly to styled components instead of template literals.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'

const StyledDiv = styled.div({
  color: 'red',
  fontSize: '16px',
  backgroundColor: 'blue',
  padding: '10px',
  borderRadius: '8px',
  textAlign: 'center'
})
</script>

<template>
  <StyledDiv>CSS Object Styled Component</StyledDiv>
</template>
```

:::

### Benefits

- **Type Safety**: Better TypeScript support with autocomplete for CSS properties
- **Dynamic Values**: Easier to work with computed values and variables
- **Readability**: More structured and readable for complex styles

## Style Functions

Style functions allow you to create dynamic styles based on component props.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'
import { ref } from 'vue'

const buttonProps = {
  disabled: Boolean,
  size: String
}

const StyledButton = styled.button.props(buttonProps)(({ disabled, size }) => ({
  color: disabled ? '#fff' : '#007bff',
  padding: size === 'large' ? '12px 24px' : size === 'small' ? '4px 8px' : '8px 16px',
  fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: disabled ? '#ccc' : '#f8f9fa',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease'
}))

const disabled = ref(false)
const size = ref<'small' | 'medium' | 'large'>('medium')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
    <StyledButton :disabled="disabled" :size="size">
      Dynamic Button ({{ size }})
    </StyledButton>
    
    <div style="display: flex; gap: 8px;">
      <button @click="size = 'small'">Small</button>
      <button @click="size = 'medium'">Medium</button>
      <button @click="size = 'large'">Large</button>
      <button @click="disabled = !disabled">
        {{ disabled ? 'Enable' : 'Disable' }}
      </button>
    </div>
  </div>
</template>
```

:::

## Props Chain Calling

You can use the `.props()` method to define component props separately, then chain with element methods.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'
import { ref } from 'vue'

const StyledInput = styled
  .input
  .props({
    borderColor: { type: String, default: '#ccc' },
    size: { type: String, default: 'medium' }
  })(({ borderColor, size }) => ({
    border: `1px solid ${borderColor}`,
    padding: size === 'large' ? '12px' : size === 'small' ? '4px' : '8px',
    fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    width: '100%'
  }))

const borderColor = ref('#ccc')
const size = ref('medium')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <StyledInput 
      :borderColor="borderColor" 
      :size="size" 
      placeholder="Type something..."
      @focus="borderColor = '#007bff'"
      @blur="borderColor = '#ccc'"
    />
    
    <div style="display: flex; gap: 8px;">
      <button @click="size = 'small'">Small</button>
      <button @click="size = 'medium'">Medium</button>
      <button @click="size = 'large'">Large</button>
    </div>
  </div>
</template>
```

:::

## Combined Usage

You can combine props definition with style functions for more complex components.

:::demo

```vue
<script setup lang="ts">
import { styled } from '@vue-styled-components/core'
import { ref } from 'vue'

const StyledCard = styled
  .div
  .props({
    elevation: { type: Number, default: 1 },
    rounded: { type: Boolean, default: true },
    variant: { type: String, default: 'default' }
  })(({ elevation, rounded, variant }) => ({
    boxShadow: `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.1)`,
    borderRadius: rounded ? '8px' : '0',
    padding: '16px',
    backgroundColor: variant === 'primary' ? '#007bff' : variant === 'success' ? '#28a745' : 'white',
    color: variant === 'default' ? '#333' : 'white',
    border: variant === 'default' ? '1px solid #e9ecef' : 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }))

const elevation = ref(1)
const rounded = ref(true)
const variant = ref('default')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <StyledCard 
      :elevation="elevation" 
      :rounded="rounded" 
      :variant="variant"
    >
      This is a {{ variant }} card, shadow level {{ elevation }}, rounded: {{ rounded }}
    </StyledCard>
    
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <div>
        <label>阴影级别: </label>
        <input 
          type="range" 
          min="0" 
          max="5" 
          v-model.number="elevation"
        />
        {{ elevation }}
      </div>
      
      <label>
        <input type="checkbox" v-model="rounded" />
        圆角
      </label>
      
      <select v-model="variant">
        <option value="default">默认</option>
        <option value="primary">主要</option>
        <option value="success">成功</option>
      </select>
    </div>
  </div>
</template>
```

:::

## Key Features

1. **CSS Object Conversion**: Automatically converts camelCase CSS properties to kebab-case
2. **Style Functions**: Support functions that receive props and return CSS objects
3. **Props Chain Calling**: Define component props through `.props()` method, then chain with element methods
4. **Type Safety**: Full TypeScript support ensuring type safety for props and styles
5. **Backward Compatibility**: Maintains full compatibility with existing template string syntax