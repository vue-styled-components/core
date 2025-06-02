<script setup lang="ts">
import styled from '@vue-styled-components/core'
import { ref, reactive } from 'vue'
import { TestCss } from '../css'

interface Props {
  debugMode: boolean
}

defineProps<Props>()

// 基础样式组件
const SimpleButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`

// 带属性的组件
const ColoredDiv = styled('div', {
  color: String,
  size: Number
})`
  padding: 1rem;
  background: ${props => props.color};
  color: white;
  border-radius: 8px;
  margin: 0.5rem 0;
  font-size: ${props => props.size ? `${props.size}px` : '16px'};
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
    transform: scale(1.02);
  }
`

// 使用CSS变量的组件
const CssVarComponent = styled.div`
  ${TestCss};
  padding: 1rem;
  border: 2px solid currentColor;
  border-radius: 8px;
  margin: 0.5rem 0;
  background: rgba(255, 0, 0, 0.1);
`

// 嵌套样式组件
const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  .card-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .card-content {
    color: #666;
    line-height: 1.6;
  }
  
  ${SimpleButton} {
    margin-top: 1rem;
    background: linear-gradient(45deg, #28a745, #20c997);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(40, 167, 69, 0.4);
    }
  }
`

// 响应式组件
const ResponsiveBox = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  @media (min-width: 1200px) {
    padding: 2rem;
    font-size: 1.2rem;
  }
`

// 动画组件
const AnimatedBox = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border-radius: 50%;
  margin: 1rem auto;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`

// 伪元素组件
const PseudoElement = styled.div`
  position: relative;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
  color: #333;
  
  &::before {
    content: '💡';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #f8f9fa;
  }
`

// 状态管理
const buttonCount = ref(0)
const selectedColor = ref('#007bff')
const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1']

const incrementCount = () => {
  buttonCount.value++
}

const changeColor = () => {
  const currentIndex = colors.indexOf(selectedColor.value)
  selectedColor.value = colors[(currentIndex + 1) % colors.length]
}
</script>

<template>
  <div>
    <Card>
      <div class="card-header">🧪 基础功能测试</div>
      <div class="card-content">
        <p>这个模块测试 vue-styled-components 的基础功能，包括样式定义、属性传递、嵌套样式等。</p>
      </div>
    </Card>

    <!-- 简单按钮测试 -->
    <Card>
      <div class="card-header">简单样式组件</div>
      <div class="card-content">
        <p>点击次数: {{ buttonCount }}</p>
        <SimpleButton @click="incrementCount">
          点击我 ({{ buttonCount }})
        </SimpleButton>
      </div>
    </Card>

    <!-- 属性传递测试 -->
    <Card>
      <div class="card-header">属性传递测试</div>
      <div class="card-content">
        <p>当前颜色: {{ selectedColor }}</p>
        <ColoredDiv :color="selectedColor" :size="16">
          这是一个带颜色属性的组件
        </ColoredDiv>
        <ColoredDiv :color="selectedColor" :size="20">
          这是一个更大字体的组件
        </ColoredDiv>
        <SimpleButton @click="changeColor">
          切换颜色
        </SimpleButton>
      </div>
    </Card>

    <!-- CSS 变量测试 -->
    <Card>
      <div class="card-header">CSS 变量导入测试</div>
      <div class="card-content">
        <CssVarComponent>
          这个组件使用了从 css.ts 导入的样式
        </CssVarComponent>
      </div>
    </Card>

    <!-- 嵌套样式测试 -->
    <Card>
      <div class="card-header">嵌套样式测试</div>
      <div class="card-content">
        <p>这个卡片本身就是一个嵌套样式的例子，包含了对子元素和其他组件的样式定义。</p>
        <SimpleButton>
          嵌套样式的按钮
        </SimpleButton>
      </div>
    </Card>

    <!-- 响应式测试 -->
    <Card>
      <div class="card-header">响应式设计测试</div>
      <div class="card-content">
        <ResponsiveBox>
          这个盒子在不同屏幕尺寸下会有不同的样式
        </ResponsiveBox>
      </div>
    </Card>

    <!-- 动画测试 -->
    <Card>
      <div class="card-header">CSS 动画测试</div>
      <div class="card-content">
        <AnimatedBox />
        <p style="text-align: center; margin-top: 1rem;">脉冲动画效果</p>
      </div>
    </Card>

    <!-- 伪元素测试 -->
    <Card>
      <div class="card-header">伪元素测试</div>
      <div class="card-content">
        <PseudoElement>
          这个组件使用了 ::before 和 ::after 伪元素
        </PseudoElement>
      </div>
    </Card>

    <!-- 调试信息 -->
    <Card>
      <div class="card-header">🔧 调试信息</div>
      <div class="card-content">
        <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto;">{
  "buttonCount": {{ buttonCount }},
  "selectedColor": "{{ selectedColor }}",
  "availableColors": {{ JSON.stringify(colors, null, 2) }}
}</pre>
      </div>
    </Card>
  </div>
</template>