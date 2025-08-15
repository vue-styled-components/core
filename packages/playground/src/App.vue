<script setup lang="ts">
import styled, { css, ThemeProvider } from '@vue-styled-components/core'
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import PerformancePanel from './components/PerformancePanel.vue'
import BasicTests from './components/BasicTests.vue'
import StressTests from './components/StressTests.vue'
import ThemeTests from './components/ThemeTests.vue'
import PropsTest from './components/PropsTest.vue'
import DebugPanel from './components/DebugPanel.vue'
import TransitionTest from './TransitionTest.vue'

// 主题配置
const theme = reactive({
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  colors: {
    lightText: '#6c757d',
    darkText: '#212529'
  },
  spacing: (size: number) => `${size * 8}px`,
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  }
})

// 当前活动的测试标签
const activeTab = ref('basic')

// 性能监控状态
const performanceEnabled = ref(true)
const debugMode = ref(false)

// 样式化组件
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  
  h1 {
    color: white;
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
  }
  
  .subtitle {
    color: rgba(255, 255, 255, 0.8);
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
  }
`

const MainContent = styled.main`
  display: flex;
  min-height: calc(100vh - 120px);
`

const Sidebar = styled.aside`
  width: 250px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
`

const TabButton = styled.button<{ active: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`

const ContentArea = styled.div.props({
  color: 'red'
})(({ color, theme }) => ({
  flex: 1,
  padding: '2rem',
  color: color,
  'overflow-y': 'auto',
}))

const ControlPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background: ${props => props.active ? props.theme.success : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: 1px solid ${props => props.active ? props.theme.success : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  
  &:hover {
    opacity: 0.8;
  }
`

// 标签页配置
const tabs = [
  { id: 'basic', label: '基础测试', icon: '🧪' },
  { id: 'stress', label: '压力测试', icon: '⚡' },
  { id: 'theme', label: '主题测试', icon: '🎨' },
  { id: 'props', label: 'Props测试', icon: '🔧' },
  { id: 'performance', label: '性能监控', icon: '📊' },
  { id: 'debug', label: '调试面板', icon: '🛠️' }
]

// 切换标签页
const switchTab = (tabId: string) => {
  activeTab.value = tabId
}

// 切换性能监控
const togglePerformance = () => {
  performanceEnabled.value = !performanceEnabled.value
}

// 切换调试模式
const toggleDebug = () => {
  debugMode.value = !debugMode.value
}

// 清除所有缓存
const clearCache = () => {
  // 这里可以调用 vue-styled-components 的缓存清除方法
  console.log('缓存已清除')
}

// 导出性能报告
const exportReport = () => {
  // 这里可以导出性能数据
  console.log('性能报告已导出')
}
</script>

<template>
  <ThemeProvider :theme="theme">
    <TransitionTest />

    <AppContainer>
      <Header>
        <h1>Vue Styled Components Playground</h1>
        <p class="subtitle">调试和性能测试环境</p>
      </Header>
      
      <MainContent>
        <Sidebar>
          <ControlPanel>
            <h3 style="color: white; margin: 0 0 1rem 0; font-size: 1rem;">控制面板</h3>
            <ToggleButton 
              :active="performanceEnabled" 
              @click="togglePerformance"
            >
              {{ performanceEnabled ? '关闭' : '开启' }} 性能监控
            </ToggleButton>
            <ToggleButton 
              :active="debugMode" 
              @click="toggleDebug"
            >
              {{ debugMode ? '关闭' : '开启' }} 调试模式
            </ToggleButton>
            <ToggleButton 
              :active="false" 
              @click="clearCache"
            >
              清除缓存
            </ToggleButton>
            <ToggleButton 
              :active="false" 
              @click="exportReport"
            >
              导出报告
            </ToggleButton>
          </ControlPanel>
          
          <div>
            <h3 style="color: white; margin: 0 0 1rem 0; font-size: 1rem;">测试模块</h3>
            <TabButton
              v-for="tab in tabs"
              :key="tab.id"
              :active="activeTab === tab.id"
              @click="switchTab(tab.id)"
            >
              {{ tab.icon }} {{ tab.label }}
            </TabButton>
          </div>
        </Sidebar>
        
        <ContentArea color="red">
          <BasicTests v-if="activeTab === 'basic'" :debug-mode="debugMode" />
          <StressTests v-if="activeTab === 'stress'" :debug-mode="debugMode" />
          <ThemeTests v-if="activeTab === 'theme'" :debug-mode="debugMode" />
          <PropsTest v-if="activeTab === 'props'" />
          <PerformancePanel v-if="activeTab === 'performance'" :enabled="performanceEnabled" />
          <DebugPanel v-if="activeTab === 'debug'" />
        </ContentArea>
      </MainContent>
    </AppContainer>
  </ThemeProvider>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: #1a1a1a;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
