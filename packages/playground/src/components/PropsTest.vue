<script setup lang="ts">
import styled from '@vue-styled-components/core'

// 测试第一种模式：{ variant: String }
const Button1 = styled('button', {
  variant: String
})`
  background: ${props => props.variant === 'primary' ? 'blue' : 'gray'};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  margin: 4px;
`

// 测试第二种模式：{ variant: { type: String } }
const Button2 = styled('button', {
  variant: { type: String, required: false }
})`
  background: ${props => props.variant === 'secondary' ? 'green' : 'orange'};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  margin: 4px;
`

// 测试混合模式
const Button3 = styled('button', {
  variant: String,
  size: { type: String, required: false },
  disabled: { type: Boolean, default: false }
})`
  background: ${props => props.disabled ? 'gray' : (props.variant === 'danger' ? 'red' : 'purple')};
  color: white;
  padding: ${props => props.size === 'large' ? '12px 24px' : '8px 16px'};
  border: none;
  border-radius: 4px;
  margin: 4px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`
</script>

<template>
  <div>
    <h3>Props 定义模式测试</h3>
    
    <div>
      <h4>模式1: { variant: String }</h4>
      <Button1 variant="primary">Primary Button</Button1>
      <Button1 variant="other">Other Button</Button1>
    </div>
    
    <div>
      <h4>模式2: { variant: { type: String, required: false } }</h4>
      <Button2 variant="secondary">Secondary Button</Button2>
      <Button2 variant="other">Other Button</Button2>
    </div>
    
    <div>
      <h4>混合模式</h4>
      <Button3 variant="danger" size="large">Large Danger</Button3>
      <Button3 variant="danger" size="small">Small Danger</Button3>
      <Button3 variant="other" :disabled="true">Disabled</Button3>
    </div>
  </div>
</template>