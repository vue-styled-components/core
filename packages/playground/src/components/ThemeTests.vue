<script setup lang="ts">
import styled, { ThemeProvider } from '@vue-styled-components/core'
import { ref, reactive, computed } from 'vue'

interface Props {
  debugMode: boolean
}

defineProps<Props>()

// 预定义主题
const themes = {
  light: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    colors: {
      lightText: '#6c757d',
      darkText: '#212529'
    },
    spacing: (size: number) => `${size * 8}px`,
    shadows: {
      small: '0 2px 4px rgba(0,0,0,0.1)',
      medium: '0 4px 8px rgba(0,0,0,0.15)',
      large: '0 8px 16px rgba(0,0,0,0.2)'
    }
  },
  dark: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#adb5bd',
    border: '#495057',
    colors: {
      lightText: '#adb5bd',
      darkText: '#ffffff'
    },
    spacing: (size: number) => `${size * 8}px`,
    shadows: {
      small: '0 2px 4px rgba(0,0,0,0.3)',
      medium: '0 4px 8px rgba(0,0,0,0.4)',
      large: '0 8px 16px rgba(0,0,0,0.5)'
    }
  },
  colorful: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    success: '#51cf66',
    danger: '#ff8787',
    warning: '#ffd43b',
    info: '#74c0fc',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.2)',
    colors: {
      lightText: 'rgba(255, 255, 255, 0.8)',
      darkText: '#ffffff'
    },
    spacing: (size: number) => `${size * 8}px`,
    shadows: {
      small: '0 2px 4px rgba(0,0,0,0.2)',
      medium: '0 4px 8px rgba(0,0,0,0.3)',
      large: '0 8px 16px rgba(0,0,0,0.4)'
    }
  }
}

// 当前主题
const currentTheme = ref<keyof typeof themes>('light')
const customTheme = reactive({ ...themes.light })
const useCustomTheme = ref(false)

// 计算当前使用的主题
const activeTheme = computed(() => {
  return useCustomTheme.value ? customTheme : themes[currentTheme.value]
})

// 嵌套主题测试
const nestedTheme = reactive({
  primary: '#e91e63',
  secondary: '#9c27b0',
  background: '#fce4ec',
  text: '#880e4f'
})

// 主题化组件
const ThemeCard = styled.div`
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: ${props => props.theme.shadows?.medium};
  transition: all 0.3s ease;
  
  .card-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${props => props.theme.border};
  }
  
  .card-content {
    color: ${props => props.theme.textSecondary};
    line-height: 1.6;
  }
`

const ThemeButton = styled('button', {
  variant: {type: String, required: false}
})`
  padding: ${props => props.theme.spacing?.(1)} ${props => props.theme.spacing?.(2)};
  margin: 0.25rem;
  background: ${props => {
    const variant = props.variant || 'primary'
    return props.theme[variant] || props.theme.primary
  }};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadows?.small};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows?.medium};
  }
  
  &:active {
    transform: translateY(0);
  }
`

const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`

const ColorSwatch = styled('div', {
  color: String
})`
  background: ${props => props.color};
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  box-shadow: ${props => props.theme?.shadows?.small};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const NestedThemeContainer = styled.div`
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme.primary};
  margin: 1rem 0;
  
  h4 {
    color: ${props => props.theme.primary};
    margin: 0 0 1rem 0;
  }
`

const ResponsiveComponent = styled.div`
  background: ${props => props.theme.primary};
  color: white;
  padding: ${props => props.theme.spacing?.(2)};
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    background: ${props => props.theme.secondary};
    padding: ${props => props.theme.spacing?.(1)};
  }
  
  @media (min-width: 1200px) {
    background: ${props => props.theme.success};
    padding: ${props => props.theme.spacing?.(3)};
  }
`

const AnimatedThemeComponent = styled.div`
  background: linear-gradient(
    45deg,
    ${props => props.theme.primary},
    ${props => props.theme.secondary}
  );
  color: white;
  padding: ${props => props.theme.spacing?.(2)};
  border-radius: 12px;
  margin: 1rem 0;
  text-align: center;
  animation: themeAnimation 3s infinite;
  
  @keyframes themeAnimation {
    0% {
      background: linear-gradient(
        45deg,
        ${props => props.theme.primary},
        ${props => props.theme.secondary}
      );
    }
    50% {
      background: linear-gradient(
        45deg,
        ${props => props.theme.secondary},
        ${props => props.theme.success}
      );
    }
    100% {
      background: linear-gradient(
        45deg,
        ${props => props.theme.primary},
        ${props => props.theme.secondary}
      );
    }
  }
`

// 主题切换
const switchTheme = (themeName: keyof typeof themes) => {
  currentTheme.value = themeName
  useCustomTheme.value = false
}

// 自定义主题颜色更新
const updateCustomColor = (property: string, color: string) => {
  ;(customTheme as any)[property] = color
}

// 随机主题生成
const generateRandomTheme = () => {
  const randomColor = () => {
    const hue = Math.floor(Math.random() * 360)
    return `hsl(${hue}, 70%, 50%)`
  }
  
  customTheme.primary = randomColor()
  customTheme.secondary = randomColor()
  customTheme.success = randomColor()
  customTheme.danger = randomColor()
  customTheme.warning = randomColor()
  customTheme.info = randomColor()
  
  useCustomTheme.value = true
}

// 主题动画测试
const animateTheme = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
  let index = 0
  
  const interval = setInterval(() => {
    customTheme.primary = colors[index % colors.length]
    customTheme.secondary = colors[(index + 1) % colors.length]
    index++
    
    if (index >= colors.length * 2) {
      clearInterval(interval)
    }
  }, 500)
  
  useCustomTheme.value = true
}
</script>

<template>
  <ThemeProvider :theme="activeTheme">
    <div>
      <ThemeCard>
        <div class="card-header">🎨 主题测试</div>
        <div class="card-content">
          <p>这个模块测试主题系统的各种功能，包括主题切换、嵌套主题、动态主题等。</p>
        </div>
      </ThemeCard>

      <!-- 主题切换控制 -->
      <ThemeCard>
        <div class="card-header">主题切换</div>
        <div class="card-content">
          <p>当前主题: <strong>{{ useCustomTheme ? '自定义' : currentTheme }}</strong></p>
          <div style="margin: 1rem 0;">
            <ThemeButton 
              v-for="(theme, name) in themes" 
              :key="name"
              variant="primary"
              @click="switchTheme(name as keyof typeof themes)"
              :style="{ opacity: currentTheme === name && !useCustomTheme ? 1 : 0.7 }"
            >
              {{ name === 'light' ? '浅色' : name === 'dark' ? '深色' : '彩色' }}
            </ThemeButton>
            
            <ThemeButton 
              variant="warning"
              @click="generateRandomTheme"
            >
              随机主题
            </ThemeButton>
            
            <ThemeButton 
              variant="info"
              @click="animateTheme"
            >
              主题动画
            </ThemeButton>
          </div>
        </div>
      </ThemeCard>

      <!-- 颜色调色板 -->
      <ThemeCard>
        <div class="card-header">当前主题色彩</div>
        <ColorPalette>
          <ColorSwatch :color="activeTheme.primary">
            Primary
          </ColorSwatch>
          <ColorSwatch :color="activeTheme.secondary">
            Secondary
          </ColorSwatch>
          <ColorSwatch :color="activeTheme.success">
            Success
          </ColorSwatch>
          <ColorSwatch :color="activeTheme.danger">
            Danger
          </ColorSwatch>
          <ColorSwatch :color="activeTheme.warning">
            Warning
          </ColorSwatch>
          <ColorSwatch :color="activeTheme.info">
            Info
          </ColorSwatch>
        </ColorPalette>
      </ThemeCard>

      <!-- 主题化按钮测试 -->
      <ThemeCard>
        <div class="card-header">主题化组件测试</div>
        <div class="card-content">
          <p>这些按钮会根据当前主题自动调整颜色：</p>
          <div style="margin: 1rem 0;">
            <ThemeButton variant="primary">Primary Button</ThemeButton>
            <ThemeButton variant="secondary">Secondary Button</ThemeButton>
            <ThemeButton variant="success">Success Button</ThemeButton>
            <ThemeButton variant="danger">Danger Button</ThemeButton>
            <ThemeButton variant="warning">Warning Button</ThemeButton>
            <ThemeButton variant="info">Info Button</ThemeButton>
          </div>
        </div>
      </ThemeCard>

      <!-- 响应式主题组件 -->
      <ThemeCard>
        <div class="card-header">响应式主题组件</div>
        <div class="card-content">
          <p>这个组件在不同屏幕尺寸下会使用不同的主题颜色：</p>
          <ResponsiveComponent>
            调整浏览器窗口大小查看效果
          </ResponsiveComponent>
        </div>
      </ThemeCard>

      <!-- 动画主题组件 -->
      <ThemeCard>
        <div class="card-header">动画主题组件</div>
        <div class="card-content">
          <p>这个组件使用主题颜色创建动画效果：</p>
          <AnimatedThemeComponent>
            主题颜色动画效果
          </AnimatedThemeComponent>
        </div>
      </ThemeCard>

      <!-- 嵌套主题测试 -->
      <ThemeCard>
        <div class="card-header">嵌套主题测试</div>
        <div class="card-content">
          <p>测试嵌套 ThemeProvider 的功能：</p>
          <ThemeProvider :theme="nestedTheme">
            <NestedThemeContainer>
              <h4>嵌套主题区域</h4>
              <p>这个区域使用了不同的主题配置</p>
              <ThemeButton variant="primary">嵌套主题按钮</ThemeButton>
            </NestedThemeContainer>
          </ThemeProvider>
        </div>
      </ThemeCard>

      <!-- 自定义主题编辑器 -->
      <ThemeCard v-if="useCustomTheme">
        <div class="card-header">自定义主题编辑器</div>
        <div class="card-content">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Primary:</label>
              <input 
                type="color" 
                :value="customTheme.primary"
                @input="updateCustomColor('primary', ($event.target as HTMLInputElement).value)"
                style="width: 100%; height: 40px; border: none; border-radius: 4px;"
              >
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Secondary:</label>
              <input 
                type="color" 
                :value="customTheme.secondary"
                @input="updateCustomColor('secondary', ($event.target as HTMLInputElement).value)"
                style="width: 100%; height: 40px; border: none; border-radius: 4px;"
              >
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Success:</label>
              <input 
                type="color" 
                :value="customTheme.success"
                @input="updateCustomColor('success', ($event.target as HTMLInputElement).value)"
                style="width: 100%; height: 40px; border: none; border-radius: 4px;"
              >
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Danger:</label>
              <input 
                type="color" 
                :value="customTheme.danger"
                @input="updateCustomColor('danger', ($event.target as HTMLInputElement).value)"
                style="width: 100%; height: 40px; border: none; border-radius: 4px;"
              >
            </div>
          </div>
        </div>
      </ThemeCard>

      <!-- 调试信息 -->
      <ThemeCard>
        <div class="card-header">🔧 调试信息</div>
        <div class="card-content">
          <pre style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">{
  "currentTheme": "{{ currentTheme }}",
  "useCustomTheme": {{ useCustomTheme }},
  "activeTheme": {{ JSON.stringify(activeTheme, null, 2) }}
}</pre>
        </div>
      </ThemeCard>
    </div>
  </ThemeProvider>
</template>