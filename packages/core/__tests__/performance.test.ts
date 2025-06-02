import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  batchUpdater,
  configureStyleProcessing,
  getStyleConfig,
  performanceMonitor,
  resetStyleConfig,
  styleCache,
} from '../index'

describe('performance Optimization', () => {
  beforeEach(() => {
    // 重置配置和状态
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
  })

  describe('configuration', () => {
    it('should use default configuration', () => {
      const config = getStyleConfig()
      expect(config.enableCache).toBe(true)
      expect(config.cacheSize).toBe(1000)
      expect(config.enableBatchUpdates).toBe(true)
      expect(config.batchDelay).toBe(16)
      expect(config.enableAsync).toBe(false)
      expect(config.enablePerformanceMonitoring).toBe(false)
    })

    it('should update configuration', () => {
      configureStyleProcessing({
        enableCache: false,
        cacheSize: 500,
        enableBatchUpdates: false,
      })

      const config = getStyleConfig()
      expect(config.enableCache).toBe(false)
      expect(config.cacheSize).toBe(500)
      expect(config.enableBatchUpdates).toBe(false)
      expect(config.batchDelay).toBe(16) // 未修改的保持默认值
    })

    it('should reset configuration', () => {
      configureStyleProcessing({ enableCache: false })
      resetStyleConfig()

      const config = getStyleConfig()
      expect(config.enableCache).toBe(true)
    })
  })

  describe('style Cache', () => {
    it('should cache and retrieve styles', () => {
      const expressions = ['color: red;']
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      // 设置缓存
      styleCache.set(expressions, context, css, tailwindClasses)

      // 获取缓存
      const cached = styleCache.get(expressions, context)
      expect(cached).not.toBeNull()
      expect(cached!.css).toBe(css)
      expect(cached!.tailwindClasses).toEqual(tailwindClasses)
    })

    it('should return null for cache miss', () => {
      const expressions = ['color: red;']
      const context = { theme: { primary: 'blue' } }

      const cached = styleCache.get(expressions, context)
      expect(cached).toBeNull()
    })

    it('should handle cache size limit', () => {
      configureStyleProcessing({ cacheSize: 2 })

      // 添加3个缓存项
      styleCache.set(['style1'], {}, 'css1', [])
      styleCache.set(['style2'], {}, 'css2', [])
      styleCache.set(['style3'], {}, 'css3', [])

      // 第一个应该被淘汰
      const cached1 = styleCache.get(['style1'], {})
      const cached3 = styleCache.get(['style3'], {})

      expect(cached1).toBeNull()
      expect(cached3).not.toBeNull()
    })

    it('should provide cache statistics', () => {
      styleCache.set(['style1'], {}, 'css1', [])
      styleCache.get(['style1'], {}) // hit
      styleCache.get(['style2'], {}) // miss

      const stats = styleCache.getStats()
      expect(stats.size).toBe(1)
      expect(stats.totalHits).toBe(1)
    })
  })

  describe('batch Updater', () => {
    it('should schedule updates when batch updates enabled', () => {
      configureStyleProcessing({ enableBatchUpdates: true })

      const mockInsert = vi.fn()
      batchUpdater.setInsertFunction(mockInsert)

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(batchUpdater.getPendingCount()).toBe(1)
      expect(mockInsert).not.toHaveBeenCalled() // 应该还未执行
    })

    it('should execute immediately when batch updates disabled', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      const mockInsert = vi.fn()
      batchUpdater.setInsertFunction(mockInsert)

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(mockInsert).toHaveBeenCalledWith('test-class', '.test { color: red; }')
    })

    it('should flush updates synchronously', () => {
      configureStyleProcessing({ enableBatchUpdates: true })

      const mockInsert = vi.fn()
      batchUpdater.setInsertFunction(mockInsert)

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      batchUpdater.flushSync()

      expect(mockInsert).toHaveBeenCalledWith('test-class', '.test { color: red; }')
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should replace duplicate class updates', () => {
      configureStyleProcessing({ enableBatchUpdates: true })

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      batchUpdater.scheduleUpdate('test-class', '.test { color: blue; }')

      expect(batchUpdater.getPendingCount()).toBe(1) // 应该只有一个更新
    })
  })

  describe('performance Monitor', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should track style calculations', () => {
      const endTimer = performanceMonitor.startStyleCalculation()

      // 模拟一些计算时间
      setTimeout(() => {
        endTimer()

        const metrics = performanceMonitor.getMetrics()
        expect(metrics.totalStyleCalculations).toBe(1)
        expect(metrics.averageCalculationTime).toBeGreaterThan(0)
      }, 10)
    })

    it('should track cache hits and misses', () => {
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(2)
      expect(metrics.totalCacheMisses).toBe(1)
      expect(metrics.cacheHitRate).toBe(2 / 3)
    })

    it('should track batch updates', () => {
      performanceMonitor.recordBatchUpdate(5)
      performanceMonitor.recordBatchUpdate(3)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.batchUpdateCount).toBe(2)
      expect(metrics.averageBatchSize).toBe(4)
    })

    it('should provide performance recommendations', () => {
      // 模拟低缓存命中率
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheHit()

      const recommendations = performanceMonitor.getRecommendations()
      expect(recommendations).toContain('考虑增加缓存大小或检查是否有过多的动态样式')
    })

    it('should reset metrics', () => {
      performanceMonitor.recordCacheHit()
      performanceMonitor.reset()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(0)
    })

    it('should not track when monitoring disabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: false })

      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(0)
    })
  })

  describe('integration', () => {
    it('should work together with all optimizations enabled', () => {
      configureStyleProcessing({
        enableCache: true,
        enableBatchUpdates: true,
        enablePerformanceMonitoring: true,
      })

      const mockInsert = vi.fn()
      batchUpdater.setInsertFunction(mockInsert)

      // 第一次调用应该计算并缓存
      const expressions = ['color: red;']
      const context = { theme: {} }

      // 模拟 injectStyle 的行为
      const cached = styleCache.get(expressions, context)
      if (!cached) {
        performanceMonitor.recordCacheMiss()
        const endTimer = performanceMonitor.startStyleCalculation()

        // 模拟样式计算
        const css = '.test { color: red; }'
        const tailwindClasses: string[] = []

        styleCache.set(expressions, context, css, tailwindClasses)
        batchUpdater.scheduleUpdate('test-class', css)

        endTimer()
      }
      else {
        performanceMonitor.recordCacheHit()
      }

      // 第二次调用应该从缓存获取
      const cached2 = styleCache.get(expressions, context)
      if (cached2) {
        performanceMonitor.recordCacheHit()
        batchUpdater.scheduleUpdate('test-class-2', cached2.css)
      }

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheMisses).toBe(1)
      expect(metrics.totalCacheHits).toBe(1)
      expect(metrics.totalStyleCalculations).toBe(1)
      expect(batchUpdater.getPendingCount()).toBe(2)
    })
  })
})
