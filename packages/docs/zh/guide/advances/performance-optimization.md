---
outline: deep
---

# 性能优化 <Badge type="tip" text="^1.2.0" />

`vue-styled-components` 提供了全面的性能优化功能，包括样式缓存、批量更新和性能监控，帮助您构建高性能应用程序。

## 概述

### 核心功能

- **样式缓存**: 自动缓存计算的样式，采用 LRU 淘汰策略
- **批量更新**: 将多个样式更新合并到单个渲染帧中执行
- **性能监控**: 实时性能指标和优化建议
- **异步处理**: 可选的异步样式处理，适用于复杂场景

### 性能收益

- 样式计算时间**减少高达 80%**
- 缓存命中率**提升 50-90%**
- DOM 操作频率**显著降低**
- 动画和交互**更加流畅**的用户体验

## 快速设置

### 基于环境的配置

```vue
<script setup lang="ts">
import { configureStyleProcessing } from '@vue-styled-components/core'

// 根据环境自动配置
function setupPerformanceOptimization() {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：启用监控，禁用激进优化
    configureStyleProcessing({
      enableCache: true,
      cacheSize: 1000,
      enableBatchUpdates: true,
      batchDelay: 16,
      enablePerformanceMonitoring: true
    })
  } else if (process.env.NODE_ENV === 'production') {
    // 生产环境：最大化性能，禁用监控
    configureStyleProcessing({
      enableCache: true,
      cacheSize: 2000,
      enableBatchUpdates: true,
      batchDelay: 8,
      enableAsync: true,
      enablePerformanceMonitoring: false
    })
  }
}

setupPerformanceOptimization()
</script>
```

### 预设配置

你可以基于不同的场景选择预设配置，以获得最佳性能表现。

```vue
<script setup lang="ts">
import {
  setupDevelopmentConfiguration,
  setupProductionConfiguration,
  setupHighPerformanceConfiguration,
  setupMemoryOptimizedConfiguration
} from 'your-preset-part'

// 选择最适合您需求的配置
function configureForScenario(scenario: string) {
  switch (scenario) {
    case 'development':
      setupDevelopmentConfiguration()
      break
    case 'production':
      setupProductionConfiguration()
      break
    case 'high-performance':
      setupHighPerformanceConfiguration()
      break
    case 'memory-optimized':
      setupMemoryOptimizedConfiguration()
      break
  }
}

// 示例：配置为高性能场景
configureForScenario('high-performance')
</script>
```

## 实际应用示例

:::demo

```vue
<script setup lang="ts">
import { configureStyleProcessing, styled, ThemeProvider, performanceMonitor, styleCache, batchUpdater } from '@vue-styled-components/core'
import { ref, onMounted, onUnmounted } from 'vue'

// 主题状态
const theme = ref({ primary: 'blue', secondary: 'gray' })

// 性能监控状态
const metrics = ref(null)
const cacheStats = ref(null)
const recommendations = ref([])
let intervalId = null

// 主题切换按钮样式
const StyledButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: ${props => props.theme.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
  
  &:hover {
    opacity: 0.8;
  }
`

// 主容器
const Container = styled.div`
  padding: 20px;
  border: 1px solid ${props => props.theme.secondary};
  border-radius: 8px;
  margin: 10px 0;
`

// 性能监控仪表板
const Dashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
`

const MetricCard = styled.div`
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 3px solid ${props => props.theme.primary};
`

const MetricTitle = styled.h5`
  margin: 0 0 6px 0;
  color: #333;
  font-size: 12px;
  font-weight: 600;
`

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.primary};
`

const ActionCard = styled.div`
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.primary};
  border-radius: 4px;
  background: white;
  color: ${props => props.theme.primary};
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.theme.primary};
    color: white;
  }
`

const RecommendationList = styled.ul`
  margin: 6px 0 0 0;
  padding-left: 16px;
  font-size: 11px;
  color: #666;
`

// 主题切换功能
function switchTheme() {
  theme.value = {
    primary: theme.value.primary === 'blue' ? 'red' : 'blue',
    secondary: theme.value.secondary === 'gray' ? 'green' : 'gray'
  }
  
  // 主题切换后更新指标
  setTimeout(() => {
    updateMetrics()
  }, 100)
}

// 性能监控功能
function updateMetrics() {
  metrics.value = performanceMonitor.getMetrics()
  cacheStats.value = styleCache.getStats()
  recommendations.value = performanceMonitor.getRecommendations()
}

function clearCache() {
  styleCache.clear()
  updateMetrics()
}

function flushUpdates() {
  batchUpdater.flushSync()
  updateMetrics()
}

// 生命周期
onMounted(() => {
  // 配置性能优化
  configureStyleProcessing({
    enableCache: true,
    cacheSize: 1000,
    enableBatchUpdates: true,
    batchDelay: 16,
    enableAsync: false,
    enablePerformanceMonitoring: true
  })
  
  // 初始化指标并设置定时更新
  updateMetrics()
  intervalId = setInterval(updateMetrics, 2000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <ThemeProvider :theme="theme">
    <Container>
      <h3>动态主题切换与性能监控综合示例</h3>
      <p>此示例演示了性能优化如何帮助动态主题切换，同时提供实时性能监控功能。</p>
      
      <div style="margin: 16px 0;">
        <StyledButton @click="switchTheme">
          切换主题 (当前: {{ theme.primary }})
        </StyledButton>
        <span style="font-size: 12px; color: #666;">点击按钮切换主题并观察性能指标变化</span>
      </div>
      
      <Dashboard>
        <MetricCard v-if="metrics">
          <MetricTitle>缓存命中率</MetricTitle>
          <MetricValue>{{ (metrics.cacheHitRate * 100).toFixed(1) }}%</MetricValue>
        </MetricCard>
        
        <MetricCard v-if="metrics">
          <MetricTitle>平均计算时间</MetricTitle>
          <MetricValue>{{ metrics.averageCalculationTime.toFixed(2) }}ms</MetricValue>
        </MetricCard>
        
        <MetricCard v-if="cacheStats">
          <MetricTitle>缓存大小</MetricTitle>
          <MetricValue>{{ cacheStats.size }}</MetricValue>
        </MetricCard>
        
        <MetricCard v-if="metrics">
          <MetricTitle>批量更新</MetricTitle>
          <MetricValue>{{ metrics.batchUpdateCount }}</MetricValue>
        </MetricCard>
        
        <ActionCard>
          <MetricTitle>缓存操作</MetricTitle>
          <ActionButton @click="clearCache">清空缓存</ActionButton>
          <ActionButton @click="flushUpdates">刷新更新</ActionButton>
        </ActionCard>
        
        <MetricCard v-if="recommendations.length > 0">
          <MetricTitle>优化建议</MetricTitle>
          <RecommendationList>
            <li v-for="rec in recommendations" :key="rec">{{ rec }}</li>
          </RecommendationList>
        </MetricCard>
      </Dashboard>
    </Container>
  </ThemeProvider>
</template>
```

:::

## 高级优化

### 缓存预热

```typescript
import { CacheManager } from '@vue-styled-components/core/examples'

// 在应用启动时预热常用样式的缓存
function prewarmStyleCache() {
  const commonStyles = [
    {
      expressions: ['color: #333;', 'font-size: 16px;'],
      context: { theme: { primary: 'blue' } }
    },
    {
      expressions: ['padding: 8px 16px;', 'border-radius: 4px;'],
      context: { theme: { primary: 'blue' } }
    }
  ]
  
  CacheManager.warmupCache(commonStyles)
}

// 在应用初始化时调用
prewarmStyleCache()
```

### 自适应性能调优

```typescript
import { configureStyleProcessing, performanceMonitor } from '@vue-styled-components/core'

// 根据性能指标自动调整配置
function adaptivePerformanceTuning() {
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics()
    
    if (metrics.cacheHitRate < 0.7) {
      // 缓存命中率低 - 增加缓存大小
      configureStyleProcessing({
        cacheSize: Math.min(5000, getCurrentCacheSize() * 1.5)
      })
    }
    
    if (metrics.averageCalculationTime > 10) {
      // 计算缓慢 - 启用异步处理
      configureStyleProcessing({
        enableAsync: true,
        batchDelay: Math.max(4, getCurrentBatchDelay() * 0.8)
      })
    }
  }, 30000) // 每30秒检查一次
}
```

### 内存管理

```typescript
import { styleCache, performanceMonitor } from '@vue-styled-components/core'

// 实现内存感知的缓存管理
function memoryAwareCacheManagement() {
  // 监控内存使用（如果可用）
  if ('memory' in performance) {
    setInterval(() => {
      const memoryInfo = (performance as any).memory
      const usedMemory = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
      
      if (usedMemory > 0.8) {
        // 内存使用率高 - 清空缓存
        styleCache.clear()
        console.warn('检测到高内存使用率，缓存已清空')
      }
    }, 60000) // 每分钟检查一次
  }
}
```

## 性能最佳实践

### 1. 优化样式表达式

```typescript
// ✅ 好的做法：稳定的样式表达式
const StyledButton = styled.button`
  color: ${props => props.theme.primary};
  padding: ${props => props.size === 'large' ? '12px 24px' : '8px 16px'};
`

// ❌ 避免：频繁变化的不稳定表达式
const StyledButton = styled.button`
  color: ${props => Math.random() > 0.5 ? 'red' : 'blue'};
  transform: rotate(${Math.random() * 360}deg);
`
```

### 2. 定期监控性能

```typescript
// 在开发环境中设置性能监控
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics()
    
    if (metrics.cacheHitRate < 0.6) {
      console.warn('缓存命中率低:', metrics.cacheHitRate)
    }
    
    if (metrics.averageCalculationTime > 15) {
      console.warn('样式计算缓慢:', metrics.averageCalculationTime)
    }
  }, 10000)
}
```

## 故障排除

### 常见性能问题

1. **缓存命中率低**
   - **原因**: 过多动态或不稳定的样式表达式
   - **解决方案**: 使用稳定的主题对象，避免在样式中使用随机值

2. **内存使用率高**
   - **原因**: 缓存大小过大或内存泄漏
   - **解决方案**: 减小缓存大小或实现定期缓存清理

3. **样式更新缓慢**
   - **原因**: 复杂样式的同步处理
   - **解决方案**: 启用异步处理并优化批量延迟

### 调试工具

```typescript
// 启用调试模式以获得详细日志
configureStyleProcessing({
  enablePerformanceMonitoring: true
})

// 导出性能数据用于分析
function exportPerformanceData() {
  const data = {
    timestamp: Date.now(),
    metrics: performanceMonitor.getMetrics(),
    cacheStats: styleCache.getStats(),
    recommendations: performanceMonitor.getRecommendations()
  }
  
  console.log('性能数据:', JSON.stringify(data, null, 2))
  return data
}
```

::: tip 优化提示
- 从默认设置开始，根据具体用例逐步优化
- 在开发中定期监控性能指标
- 对常见场景使用预设配置
- 设置缓存大小时考虑内存限制
:::