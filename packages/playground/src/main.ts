/* eslint-disable no-console */

import { configureStyleProcessing, performanceMonitor } from '@vue-styled-components/core'
import { createApp } from 'vue'
import App from './App.vue'

import './style.css'

// 启用所有优化功能
configureStyleProcessing({
  enableCache: true,
  cacheSize: 2000, // 增加缓存大小用于压力测试
  enableBatchUpdates: true,
  batchDelay: 16,
  enablePerformanceMonitoring: true,
})

// 开发环境下启用性能监控报告
if (import.meta.env.DEV) {
  // 每5秒输出一次性能报告
  setInterval(() => {
    try {
      performanceMonitor.printReport()
    }
    catch (error) {
      console.warn('性能监控报告生成失败:', error)
    }
  }, 5000)

  // 在控制台添加全局调试工具
  ;(window as any).__VUE_STYLED_DEBUG__ = {
    performanceMonitor,
    configureStyleProcessing,
    clearCache: () => {
      console.log('清除样式缓存')
      // 这里应该调用实际的缓存清除方法
    },
    getStats: () => {
      return {
        cacheSize: 'N/A',
        hitRate: 'N/A',
        renderCount: 'N/A',
      }
    },
  }

  console.log('🎨 Vue Styled Components Playground 已启动')
  console.log('💡 使用 window.__VUE_STYLED_DEBUG__ 访问调试工具')
}

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 应用错误:', err)
  console.error('错误信息:', info)
}

app.mount('#app')

export default app
