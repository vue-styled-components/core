---
outline: deep
---

# CSS 对象和样式函数

从 v1.12.0 版本开始，`@vue-styled-components/core` 支持 CSS 对象和样式函数，提供更灵活的组件样式定义方式。

## CSS 对象支持

现在您可以直接向样式化组件传递 CSS 对象，而不是模板字符串。

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
  <StyledDiv>CSS 对象样式化组件</StyledDiv>
</template>
```

:::

### 优势

- **类型安全**: 更好的 TypeScript 支持，CSS 属性自动补全
- **动态值**: 更容易处理计算值和变量
- **可读性**: 复杂样式更结构化和可读

## 样式函数

样式函数允许您基于组件属性创建动态样式。

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
      动态按钮 ({{ size }})
    </StyledButton>
    
    <div style="display: flex; gap: 8px;">
      <button @click="size = 'small'">小</button>
      <button @click="size = 'medium'">中</button>
      <button @click="size = 'large'">大</button>
      <button @click="disabled = !disabled">
        {{ disabled ? '启用' : '禁用' }}
      </button>
    </div>
  </div>
</template>
```

:::

## Props 链式调用

您可以使用 `.props()` 方法单独定义组件属性，然后与元素方法链式调用。

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
      placeholder="输入内容..."
      @focus="borderColor = '#007bff'"
      @blur="borderColor = '#ccc'"
    />
    
    <div style="display: flex; gap: 8px;">
      <button @click="size = 'small'">小</button>
      <button @click="size = 'medium'">中</button>
      <button @click="size = 'large'">大</button>
    </div>
  </div>
</template>
```

:::

## 组合使用

您可以将属性定义与样式函数结合使用，创建更复杂的组件。

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
      这是一个 {{ variant }} 卡片，阴影级别 {{ elevation }}
      {{ rounded ? '，圆角' : '，直角' }}
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

## 核心特性

1. **CSS 对象转换**: 自动将驼峰命名的 CSS 属性转换为 kebab-case
2. **样式函数**: 支持接收 props 参数并返回 CSS 对象的函数
3. **Props 链式调用**: 通过 `.props()` 方法定义组件 props，然后链式调用元素方法
4. **类型安全**: 完整的 TypeScript 类型支持，确保 props 和样式的类型安全
5. **向后兼容**: 保持与现有模板字符串语法的完全兼容