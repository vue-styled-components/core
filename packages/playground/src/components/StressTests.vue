<script setup lang="ts">
import styled from '@vue-styled-components/core'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  debugMode: boolean
}

defineProps<Props>()

// 性能测试状态
const isRunning = ref(false)
const componentCount = ref(100)
const renderTime = ref(0)
const updateTime = ref(0)
const memoryUsage = ref(0)
const fps = ref(0)

// FPS 监控
let fpsCounter = 0
let lastTime = performance.now()
let fpsInterval: number | null = null

// 样式化组件 - 简单版本
const SimpleItem = styled('div', {
  index: Number
})`
  padding: 0.5rem;
  margin: 0.25rem;
  background: hsl(${props => (props.index * 137.5) % 360}, 70%, 50%);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  display: inline-block;
  min-width: 60px;
  text-align: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

// 复杂样式组件
const ComplexItem = styled('div', {
  index: Number,
  active: Boolean
})`
  position: relative;
  padding: 1rem;
  margin: 0.5rem;
  background: linear-gradient(
    ${props => props.index % 2 === 0 ? '45deg' : '135deg'},
    hsl(${props => (props.index * 137.5) % 360}, 70%, 50%),
    hsl(${props => ((props.index + 1) * 137.5) % 360}, 70%, 60%)
  );
  color: white;
  border-radius: 12px;
  box-shadow: ${props => props.active ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)'};
  transform: ${props => props.active ? 'scale(1.05)' : 'scale(1)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
    border-radius: 14px;
    z-index: -1;
    opacity: ${props => props.active ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  }
  
  .item-content {
    position: relative;
    z-index: 1;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .item-index {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 0.25rem;
  }
`

// 网格容器
const GridContainer = styled('div', {
  columns: Number
})`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin: 1rem 0;
`

// 卡片容器
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
`

// 控制按钮
const ControlButton = styled('button', {
  variant: String
})`
  padding: 0.75rem 1.5rem;
  margin: 0.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: linear-gradient(45deg, #dc3545, #c82333);
          color: white;
          &:hover { background: linear-gradient(45deg, #c82333, #a71e2a); }
        `
      case 'success':
        return `
          background: linear-gradient(45deg, #28a745, #20c997);
          color: white;
          &:hover { background: linear-gradient(45deg, #20c997, #17a2b8); }
        `
      default:
        return `
          background: linear-gradient(45deg, #007bff, #0056b3);
          color: white;
          &:hover { background: linear-gradient(45deg, #0056b3, #004085); }
        `
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// 性能指标显示
const MetricCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 0.5rem;
  text-align: center;
  
  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .metric-label {
    font-size: 0.875rem;
    opacity: 0.9;
  }
`

// 测试数据
const testItems = computed(() => {
  return Array.from({ length: componentCount.value }, (_, index) => ({
    id: index,
    active: index % 10 === 0,
    content: `Item ${index + 1}`
  }))
})

// 测试类型
const testType = ref<'simple' | 'complex'>('simple')
const gridColumns = ref(10)
const autoUpdate = ref(false)
let updateInterval: number | null = null

// 开始性能测试
const startStressTest = async () => {
  isRunning.value = true
  
  // 测量渲染时间
  const startTime = performance.now()
  await nextTick()
  renderTime.value = Math.round(performance.now() - startTime)
  
  // 开始 FPS 监控
  startFPSMonitoring()
  
  // 开始内存监控
  startMemoryMonitoring()
  
  // 自动更新测试
  if (autoUpdate.value) {
    startAutoUpdate()
  }
}

// 停止测试
const stopStressTest = () => {
  isRunning.value = false
  stopFPSMonitoring()
  stopAutoUpdate()
}

// FPS 监控
const startFPSMonitoring = () => {
  fpsCounter = 0
  lastTime = performance.now()
  
  const countFPS = () => {
    fpsCounter++
    const currentTime = performance.now()
    if (currentTime - lastTime >= 1000) {
      fps.value = Math.round(fpsCounter * 1000 / (currentTime - lastTime))
      fpsCounter = 0
      lastTime = currentTime
    }
    if (isRunning.value) {
      requestAnimationFrame(countFPS)
    }
  }
  
  requestAnimationFrame(countFPS)
}

const stopFPSMonitoring = () => {
  fps.value = 0
}

// 内存监控
const startMemoryMonitoring = () => {
  if ('memory' in performance) {
    const updateMemory = () => {
      // @ts-ignore
      memoryUsage.value = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      if (isRunning.value) {
        setTimeout(updateMemory, 1000)
      }
    }
    updateMemory()
  }
}

// 自动更新测试
const startAutoUpdate = () => {
  updateInterval = setInterval(async () => {
    const startTime = performance.now()
    
    // 随机更新一些组件的状态
    testItems.value.forEach((item, index) => {
      if (Math.random() < 0.1) {
        item.active = !item.active
      }
    })
    
    await nextTick()
    updateTime.value = Math.round(performance.now() - startTime)
  }, 100)
}

const stopAutoUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

// 批量操作测试
const batchUpdate = async () => {
  const startTime = performance.now()
  
  // 批量更新所有组件
  testItems.value.forEach((item, index) => {
    item.active = index % 5 === 0
  })
  
  await nextTick()
  updateTime.value = Math.round(performance.now() - startTime)
}

// 清理
onUnmounted(() => {
  stopStressTest()
})
</script>

<template>
  <div>
    <Card>
      <div class="card-header">⚡ 压力测试</div>
      <div style="color: #666; line-height: 1.6;">
        <p>这个模块用于测试大批量渲染的性能，包括渲染时间、FPS、内存使用等指标。</p>
      </div>
    </Card>

    <!-- 控制面板 -->
    <Card>
      <div class="card-header">控制面板</div>
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">组件数量:</label>
          <input 
            v-model.number="componentCount" 
            type="range" 
            min="10" 
            max="2000" 
            step="10"
            style="width: 200px;"
            :disabled="isRunning"
          >
          <span style="margin-left: 0.5rem; font-weight: bold;">{{ componentCount }}</span>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">网格列数:</label>
          <input 
            v-model.number="gridColumns" 
            type="range" 
            min="5" 
            max="20" 
            step="1"
            style="width: 150px;"
          >
          <span style="margin-left: 0.5rem; font-weight: bold;">{{ gridColumns }}</span>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">测试类型:</label>
          <select v-model="testType" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
            <option value="simple">简单组件</option>
            <option value="complex">复杂组件</option>
          </select>
        </div>
        
        <div>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
            <input v-model="autoUpdate" type="checkbox">
            自动更新
          </label>
        </div>
      </div>
      
      <div style="margin-top: 1rem;">
        <ControlButton 
          v-if="!isRunning" 
          variant="primary" 
          @click="startStressTest"
        >
          开始压力测试
        </ControlButton>
        <ControlButton 
          v-else 
          variant="danger" 
          @click="stopStressTest"
        >
          停止测试
        </ControlButton>
        
        <ControlButton 
          variant="success" 
          @click="batchUpdate"
          :disabled="!isRunning"
        >
          批量更新
        </ControlButton>
      </div>
    </Card>

    <!-- 性能指标 -->
    <Card v-if="isRunning">
      <div class="card-header">📊 性能指标</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <MetricCard>
          <div class="metric-value">{{ renderTime }}ms</div>
          <div class="metric-label">初始渲染时间</div>
        </MetricCard>
        
        <MetricCard>
          <div class="metric-value">{{ updateTime }}ms</div>
          <div class="metric-label">更新时间</div>
        </MetricCard>
        
        <MetricCard>
          <div class="metric-value">{{ fps }}</div>
          <div class="metric-label">FPS</div>
        </MetricCard>
        
        <MetricCard v-if="memoryUsage > 0">
          <div class="metric-value">{{ memoryUsage }}MB</div>
          <div class="metric-label">内存使用</div>
        </MetricCard>
      </div>
    </Card>

    <!-- 测试组件渲染区域 -->
    <Card>
      <div class="card-header">
        {{ testType === 'simple' ? '🔹 简单组件测试' : '🔸 复杂组件测试' }} 
        ({{ componentCount }} 个组件)
      </div>
      
      <GridContainer :columns="gridColumns">
        <template v-if="testType === 'simple'">
          <SimpleItem 
            v-for="item in testItems" 
            :key="item.id"
            :index="item.id"
          >
            {{ item.content }}
          </SimpleItem>
        </template>
        
        <template v-else>
          <ComplexItem 
            v-for="item in testItems" 
            :key="item.id"
            :index="item.id"
            :active="item.active"
          >
            <div class="item-content">{{ item.content }}</div>
            <div class="item-index">#{{ item.id }}</div>
          </ComplexItem>
        </template>
      </GridContainer>
    </Card>

    <!-- 调试信息 -->
    <Card v-if="debugMode">
      <div class="card-header">🔧 调试信息</div>
      <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">{
  "isRunning": {{ isRunning }},
  "componentCount": {{ componentCount }},
  "testType": "{{ testType }}",
  "gridColumns": {{ gridColumns }},
  "autoUpdate": {{ autoUpdate }},
  "performance": {
    "renderTime": "{{ renderTime }}ms",
    "updateTime": "{{ updateTime }}ms",
    "fps": {{ fps }},
    "memoryUsage": "{{ memoryUsage }}MB"
  }
}</pre>
    </Card>
  </div>
</template>