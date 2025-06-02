---
outline: deep
---

# Performance Optimization <Badge type="tip" text="^1.2.0" />

`vue-styled-components` provides comprehensive performance optimization features, including style caching, batch updates, and performance monitoring to help you build high-performance applications.

## Overview

### Core Features

- **Style Caching**: Automatically cache computed styles with LRU eviction strategy
- **Batch Updates**: Merge multiple style updates into a single render frame
- **Performance Monitoring**: Real-time performance metrics and optimization suggestions
- **Async Processing**: Optional async style processing for complex scenarios

### Performance Benefits

- Style calculation time **reduced by up to 80%**
- Cache hit rate **improved by 50-90%**
- DOM operation frequency **significantly reduced**
- **Smoother** animations and interactions for better user experience

## Quick Setup

### Environment-based Configuration

```vue
<script setup lang="ts">
import { configureStyleProcessing } from '@vue-styled-components/core'

// Auto-configure based on environment
function setupPerformanceOptimization() {
  if (process.env.NODE_ENV === 'development') {
    // Development: Enable monitoring, disable aggressive optimizations
    configureStyleProcessing({
      enableCache: true,
      cacheSize: 1000,
      enableBatchUpdates: true,
      batchDelay: 16,
      enablePerformanceMonitoring: true
    })
  } else if (process.env.NODE_ENV === 'production') {
    // Production: Maximize performance, disable monitoring
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

### Preset Configurations

You can choose preset configurations based on different scenarios to achieve optimal performance.

```vue
<script setup lang="ts">
import {
  setupDevelopmentConfiguration,
  setupProductionConfiguration,
  setupHighPerformanceConfiguration,
  setupMemoryOptimizedConfiguration
} from 'your-preset-part'

// Choose the configuration that best fits your needs
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

// Example: Configure for high-performance scenario
configureForScenario('high-performance')
</script>

<template>
  <div>Scenario-based configuration applied!</div>
</template>
```

## Practical Examples

### Dynamic Theme Switching with Performance Monitoring

:::demo

```vue
<script setup lang="ts">
import { configureStyleProcessing, styled, ThemeProvider, performanceMonitor, styleCache, batchUpdater } from '@vue-styled-components/core'
import { ref, onMounted, onUnmounted } from 'vue'

// Theme state
const theme = ref({ primary: 'blue', secondary: 'gray' })

// Performance monitoring state
const metrics = ref(null)
const cacheStats = ref(null)
const recommendations = ref([])
let intervalId = null

// Theme switching button styles
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

// Main container
const Container = styled.div`
  padding: 20px;
  border: 1px solid ${props => props.theme.secondary};
  border-radius: 8px;
  margin: 10px 0;
`

// Performance monitoring dashboard
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

// Theme switching functionality
function switchTheme() {
  theme.value = {
    primary: theme.value.primary === 'blue' ? 'red' : 'blue',
    secondary: theme.value.secondary === 'gray' ? 'green' : 'gray'
  }
  
  // Update metrics after theme switch
  setTimeout(() => {
    updateMetrics()
  }, 100)
}

// Performance monitoring functionality
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

// Lifecycle
onMounted(() => {
  // Configure performance optimization
  configureStyleProcessing({
    enableCache: true,
    cacheSize: 1000,
    enableBatchUpdates: true,
    batchDelay: 16,
    enableAsync: false,
    enablePerformanceMonitoring: true
  })
  
  // Initialize metrics and set up periodic updates
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
      <h3>Dynamic Theme Switching with Performance Monitoring</h3>
      <p>This example demonstrates how performance optimization helps with dynamic theme switching while providing real-time performance monitoring.</p>
      
      <div style="margin: 16px 0;">
        <StyledButton @click="switchTheme">
          Switch Theme (Current: {{ theme.primary }})
        </StyledButton>
        <span style="font-size: 12px; color: #666;">Click the button to switch themes and observe performance metrics changes</span>
      </div>
      
      <Dashboard>
        <MetricCard v-if="metrics">
          <MetricTitle>Cache Hit Rate</MetricTitle>
          <MetricValue>{{ (metrics.cacheHitRate * 100).toFixed(1) }}%</MetricValue>
        </MetricCard>
        
        <MetricCard v-if="metrics">
          <MetricTitle>Average Calculation Time</MetricTitle>
          <MetricValue>{{ metrics.averageCalculationTime.toFixed(2) }}ms</MetricValue>
        </MetricCard>
        
        <MetricCard v-if="cacheStats">
          <MetricTitle>Cache Size</MetricTitle>
          <MetricValue>{{ cacheStats.size }}</MetricValue>
        </MetricCard>
        
        <MetricCard v-if="metrics">
          <MetricTitle>Batch Updates</MetricTitle>
          <MetricValue>{{ metrics.batchUpdateCount }}</MetricValue>
        </MetricCard>
        
        <ActionCard>
          <MetricTitle>Cache Actions</MetricTitle>
          <ActionButton @click="clearCache">Clear Cache</ActionButton>
          <ActionButton @click="flushUpdates">Flush Updates</ActionButton>
        </ActionCard>
        
        <MetricCard v-if="recommendations.length > 0">
          <MetricTitle>Optimization Recommendations</MetricTitle>
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

## Advanced Optimizations

### Cache Prewarming

```typescript
import { CacheManager } from '@vue-styled-components/core/examples'

// Prewarm cache with common styles at application startup
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

// Call during application initialization
prewarmStyleCache()
```

### Adaptive Performance Tuning

```typescript
import { configureStyleProcessing, performanceMonitor } from '@vue-styled-components/core'

// Automatically adjust configuration based on performance metrics
function adaptivePerformanceTuning() {
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics()
    
    if (metrics.cacheHitRate < 0.7) {
      // Low cache hit rate - increase cache size
      configureStyleProcessing({
        cacheSize: Math.min(5000, getCurrentCacheSize() * 1.5)
      })
    }
    
    if (metrics.averageCalculationTime > 10) {
      // Slow calculation - enable async processing
      configureStyleProcessing({
        enableAsync: true,
        batchDelay: Math.max(4, getCurrentBatchDelay() * 0.8)
      })
    }
  }, 30000) // Check every 30 seconds
}
```

### Memory Management

```typescript
import { styleCache, performanceMonitor } from '@vue-styled-components/core'

// Implement memory-aware cache management
function memoryAwareCacheManagement() {
  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memoryInfo = (performance as any).memory
      const usedMemory = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
      
      if (usedMemory > 0.8) {
        // High memory usage - clear cache
        styleCache.clear()
        console.warn('High memory usage detected, cache cleared')
      }
    }, 60000) // Check every minute
  }
}
```

## Performance Best Practices

### 1. Optimize Style Expressions

```typescript
// ✅ Good: Stable style expressions
const StyledButton = styled.button`
  color: ${props => props.theme.primary};
  padding: ${props => props.size === 'large' ? '12px 24px' : '8px 16px'};
`

// ❌ Avoid: Frequently changing unstable expressions
const StyledButton = styled.button`
  color: ${props => Math.random() > 0.5 ? 'red' : 'blue'};
  transform: rotate(${Math.random() * 360}deg);
`
```

### 2. Regular Performance Monitoring

```typescript
// Set up performance monitoring in development environment
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics()
    
    if (metrics.cacheHitRate < 0.6) {
      console.warn('Low cache hit rate:', metrics.cacheHitRate)
    }
    
    if (metrics.averageCalculationTime > 15) {
      console.warn('Slow style calculation:', metrics.averageCalculationTime)
    }
  }, 10000)
}
```

## Troubleshooting

### Common Performance Issues

1. **Low Cache Hit Rate**
   - **Cause**: Too many dynamic or unstable style expressions
   - **Solution**: Use stable theme objects, avoid random values in styles

2. **High Memory Usage**
   - **Cause**: Cache size too large or memory leaks
   - **Solution**: Reduce cache size or implement periodic cache cleanup

3. **Slow Style Updates**
   - **Cause**: Synchronous processing of complex styles
   - **Solution**: Enable async processing and optimize batch delay

### Debugging Tools

```typescript
// Enable debug mode for detailed logging
configureStyleProcessing({
  enablePerformanceMonitoring: true
})

// Export performance data for analysis
function exportPerformanceData() {
  const data = {
    timestamp: Date.now(),
    metrics: performanceMonitor.getMetrics(),
    cacheStats: styleCache.getStats(),
    recommendations: performanceMonitor.getRecommendations()
  }
  
  console.log('Performance data:', JSON.stringify(data, null, 2))
  return data
}
```

::: tip Optimization Tips
- Start with default settings and optimize gradually based on your specific use case
- Monitor performance metrics regularly during development
- Use preset configurations for common scenarios
- Consider memory constraints when setting cache size
:::