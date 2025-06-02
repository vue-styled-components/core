<script setup lang="ts">
import styled from '@vue-styled-components/core'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { performanceMonitor } from '@vue-styled-components/core'

interface Props {
  enabled: boolean
}

const props = defineProps<Props>()

// 性能数据
const performanceData = ref({
  renderCount: 0,
  cacheHits: 0,
  cacheMisses: 0,
  averageRenderTime: 0,
  totalRenderTime: 0,
  memoryUsage: 0,
  componentCount: 0,
  styleUpdates: 0
})

// 实时监控数据
const realtimeData = ref({
  fps: 0,
  cpuUsage: 0,
  memoryTrend: [] as number[],
  renderTimeTrend: [] as number[]
})

// 监控状态
const isMonitoring = ref(false)
const autoRefresh = ref(true)
const refreshInterval = ref(1000)

// 定时器
let monitoringInterval: number | null = null
let fpsInterval: number | null = null

// 样式化组件
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

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`

const MetricCard = styled('div', {
  variant: String
})`
  background: ${props => {
    switch (props.variant) {
      case 'success': return 'linear-gradient(135deg, #28a745, #20c997)'
      case 'warning': return 'linear-gradient(135deg, #ffc107, #fd7e14)'
      case 'danger': return 'linear-gradient(135deg, #dc3545, #e83e8c)'
      default: return 'linear-gradient(135deg, #007bff, #6610f2)'
    }
  }};
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .metric-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .metric-label {
    font-size: 0.9rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .metric-description {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-top: 0.5rem;
  }
`

const ControlPanel = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`

const ControlButton = styled('button', {
  variant: String
})`
  padding: 0.75rem 1.5rem;
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
`

const ChartContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const SimpleChart = styled.div`
  width: 100%;
  height: 150px;
  background: white;
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  align-items: end;
  gap: 2px;
  overflow: hidden;
`

const ChartBar = styled('div', {
  height: Number,
  color: String
})`
  flex: 1;
  background: ${props => props.color || '#007bff'};
  height: ${props => props.height}%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
`

const StatusIndicator = styled('div', {
  status: String
})`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'good':
        return `
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.2);
        `
      case 'warning':
        return `
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.2);
        `
      case 'danger':
        return `
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.2);
        `
    }
  }}
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`

// 计算性能状态
const performanceStatus = computed(() => {
  const cacheHitRate = performanceData.value.cacheHits + performanceData.value.cacheMisses > 0 
    ? (performanceData.value.cacheHits / (performanceData.value.cacheHits + performanceData.value.cacheMisses)) * 100 
    : 0
  
  const avgRenderTime = performanceData.value.averageRenderTime
  
  if (cacheHitRate > 80 && avgRenderTime < 5) return 'good'
  if (cacheHitRate > 60 && avgRenderTime < 10) return 'warning'
  return 'danger'
})

const cacheHitRate = computed(() => {
  const total = performanceData.value.cacheHits + performanceData.value.cacheMisses
  return total > 0 ? Math.round((performanceData.value.cacheHits / total) * 100) : 0
})

// 开始监控
const startMonitoring = () => {
  if (!props.enabled) return
  
  isMonitoring.value = true
  
  // 定期更新性能数据
  monitoringInterval = setInterval(() => {
    updatePerformanceData()
  }, refreshInterval.value)
  
  // FPS 监控
  startFPSMonitoring()
}

// 停止监控
const stopMonitoring = () => {
  isMonitoring.value = false
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }
  
  if (fpsInterval) {
    clearInterval(fpsInterval)
    fpsInterval = null
  }
}

// 更新性能数据
const updatePerformanceData = () => {
  try {
    // 这里应该调用实际的性能监控 API
    // const report = performanceMonitor.getReport()
    
    // 模拟数据更新
    performanceData.value = {
      renderCount: performanceData.value.renderCount + Math.floor(Math.random() * 5),
      cacheHits: performanceData.value.cacheHits + Math.floor(Math.random() * 10),
      cacheMisses: performanceData.value.cacheMisses + Math.floor(Math.random() * 2),
      averageRenderTime: Math.random() * 15 + 2,
      totalRenderTime: performanceData.value.totalRenderTime + Math.random() * 50,
      memoryUsage: Math.random() * 100 + 50,
      componentCount: Math.floor(Math.random() * 50) + 20,
      styleUpdates: performanceData.value.styleUpdates + Math.floor(Math.random() * 3)
    }
    
    // 更新趋势数据
    realtimeData.value.memoryTrend.push(performanceData.value.memoryUsage)
    realtimeData.value.renderTimeTrend.push(performanceData.value.averageRenderTime)
    
    // 保持趋势数据长度
    if (realtimeData.value.memoryTrend.length > 20) {
      realtimeData.value.memoryTrend.shift()
    }
    if (realtimeData.value.renderTimeTrend.length > 20) {
      realtimeData.value.renderTimeTrend.shift()
    }
  } catch (error) {
    console.warn('性能数据更新失败:', error)
  }
}

// FPS 监控
const startFPSMonitoring = () => {
  let frameCount = 0
  let lastTime = performance.now()
  
  const countFrame = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      realtimeData.value.fps = Math.round(frameCount * 1000 / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
    }
    
    if (isMonitoring.value) {
      requestAnimationFrame(countFrame)
    }
  }
  
  requestAnimationFrame(countFrame)
}

// 清除所有数据
const clearData = () => {
  performanceData.value = {
    renderCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    styleUpdates: 0
  }
  
  realtimeData.value = {
    fps: 0,
    cpuUsage: 0,
    memoryTrend: [],
    renderTimeTrend: []
  }
}

// 导出报告
const exportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    performance: performanceData.value,
    realtime: realtimeData.value,
    status: performanceStatus.value,
    cacheHitRate: cacheHitRate.value
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 生命周期
onMounted(() => {
  if (props.enabled && autoRefresh.value) {
    startMonitoring()
  }
})

onUnmounted(() => {
  stopMonitoring()
})

// 监听 enabled 属性变化
const handleEnabledChange = () => {
  if (props.enabled && autoRefresh.value) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

// 监听属性变化
const unwatchEnabled = () => {
  // Vue 3 的 watch 会在组件卸载时自动清理
}
</script>

<template>
  <div>
    <Card>
      <div class="card-header">📊 性能监控面板</div>
      <div style="color: #666; line-height: 1.6;">
        <p>实时监控 vue-styled-components 的性能指标，包括渲染时间、缓存命中率、内存使用等。</p>
        <StatusIndicator :status="performanceStatus">
          {{ performanceStatus === 'good' ? '性能良好' : performanceStatus === 'warning' ? '性能一般' : '性能较差' }}
        </StatusIndicator>
      </div>
    </Card>

    <!-- 控制面板 -->
    <Card>
      <div class="card-header">控制面板</div>
      <ControlPanel>
        <div>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
            <input v-model="autoRefresh" type="checkbox" @change="handleEnabledChange">
            自动刷新
          </label>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">刷新间隔:</label>
          <select v-model="refreshInterval" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
            <option :value="500">500ms</option>
            <option :value="1000">1s</option>
            <option :value="2000">2s</option>
            <option :value="5000">5s</option>
          </select>
        </div>
        
        <ControlButton 
          v-if="!isMonitoring" 
          variant="primary" 
          @click="startMonitoring"
          :disabled="!enabled"
        >
          开始监控
        </ControlButton>
        <ControlButton 
          v-else 
          variant="danger" 
          @click="stopMonitoring"
        >
          停止监控
        </ControlButton>
        
        <ControlButton @click="clearData">
          清除数据
        </ControlButton>
        
        <ControlButton variant="success" @click="exportReport">
          导出报告
        </ControlButton>
      </ControlPanel>
    </Card>

    <!-- 核心性能指标 -->
    <Card>
      <div class="card-header">核心性能指标</div>
      <MetricGrid>
        <MetricCard variant="primary">
          <div class="metric-value">{{ performanceData.renderCount }}</div>
          <div class="metric-label">渲染次数</div>
          <div class="metric-description">组件渲染总次数</div>
        </MetricCard>
        
        <MetricCard variant="success">
          <div class="metric-value">{{ cacheHitRate }}%</div>
          <div class="metric-label">缓存命中率</div>
          <div class="metric-description">{{ performanceData.cacheHits }}/{{ performanceData.cacheHits + performanceData.cacheMisses }}</div>
        </MetricCard>
        
        <MetricCard variant="warning">
          <div class="metric-value">{{ performanceData.averageRenderTime.toFixed(1) }}ms</div>
          <div class="metric-label">平均渲染时间</div>
          <div class="metric-description">单次渲染平均耗时</div>
        </MetricCard>
        
        <MetricCard variant="danger">
          <div class="metric-value">{{ performanceData.memoryUsage.toFixed(1) }}MB</div>
          <div class="metric-label">内存使用</div>
          <div class="metric-description">当前内存占用</div>
        </MetricCard>
      </MetricGrid>
    </Card>

    <!-- 实时监控 -->
    <Card v-if="isMonitoring">
      <div class="card-header">实时监控</div>
      <MetricGrid>
        <MetricCard>
          <div class="metric-value">{{ realtimeData.fps }}</div>
          <div class="metric-label">FPS</div>
          <div class="metric-description">每秒帧数</div>
        </MetricCard>
        
        <MetricCard variant="success">
          <div class="metric-value">{{ performanceData.componentCount }}</div>
          <div class="metric-label">活跃组件</div>
          <div class="metric-description">当前渲染的组件数量</div>
        </MetricCard>
        
        <MetricCard variant="warning">
          <div class="metric-value">{{ performanceData.styleUpdates }}</div>
          <div class="metric-label">样式更新</div>
          <div class="metric-description">样式更新次数</div>
        </MetricCard>
        
        <MetricCard variant="danger">
          <div class="metric-value">{{ performanceData.totalRenderTime.toFixed(0) }}ms</div>
          <div class="metric-label">总渲染时间</div>
          <div class="metric-description">累计渲染耗时</div>
        </MetricCard>
      </MetricGrid>
    </Card>

    <!-- 性能趋势图 -->
    <Card v-if="realtimeData.memoryTrend.length > 0">
      <div class="card-header">性能趋势</div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <ChartContainer>
          <div style="width: 100%;">
            <h4 style="margin: 0 0 1rem 0; text-align: center; color: #666;">内存使用趋势</h4>
            <SimpleChart>
              <ChartBar 
                v-for="(value, index) in realtimeData.memoryTrend" 
                :key="index"
                :height="(value / Math.max(...realtimeData.memoryTrend)) * 100"
                color="#28a745"
              />
            </SimpleChart>
          </div>
        </ChartContainer>
        
        <ChartContainer>
          <div style="width: 100%;">
            <h4 style="margin: 0 0 1rem 0; text-align: center; color: #666;">渲染时间趋势</h4>
            <SimpleChart>
              <ChartBar 
                v-for="(value, index) in realtimeData.renderTimeTrend" 
                :key="index"
                :height="(value / Math.max(...realtimeData.renderTimeTrend)) * 100"
                color="#007bff"
              />
            </SimpleChart>
          </div>
        </ChartContainer>
      </div>
    </Card>

    <!-- 性能建议 -->
    <Card>
      <div class="card-header">性能建议</div>
      <div style="color: #666; line-height: 1.6;">
        <div v-if="performanceStatus === 'good'" style="color: #28a745;">
          <h4>✅ 性能表现良好</h4>
          <ul>
            <li>缓存命中率高，样式复用效果好</li>
            <li>渲染时间在合理范围内</li>
            <li>继续保持当前的使用模式</li>
          </ul>
        </div>
        
        <div v-else-if="performanceStatus === 'warning'" style="color: #ffc107;">
          <h4>⚠️ 性能有待优化</h4>
          <ul>
            <li>考虑增加样式复用，减少重复定义</li>
            <li>检查是否有不必要的重新渲染</li>
            <li>优化复杂的样式计算</li>
          </ul>
        </div>
        
        <div v-else style="color: #dc3545;">
          <h4>❌ 性能需要改进</h4>
          <ul>
            <li>缓存命中率较低，建议重构样式定义</li>
            <li>渲染时间过长，检查样式复杂度</li>
            <li>考虑使用样式预处理或缓存策略</li>
            <li>减少动态样式的使用</li>
          </ul>
        </div>
      </div>
    </Card>
  </div>
</template>