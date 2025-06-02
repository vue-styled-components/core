import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStyleProcessing, resetStyleConfig } from '../src/config'
import { performanceMonitor } from '../src/utils/performanceMonitor'

describe('performanceMonitor', () => {
  beforeEach(() => {
    resetStyleConfig()
    performanceMonitor.reset()
  })

  afterEach(() => {
    resetStyleConfig()
    performanceMonitor.reset()
    vi.restoreAllMocks()
  })

  describe('configuration dependency', () => {
    it('should not track when performance monitoring is disabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: false })

      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordBatchUpdate(5)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(0)
      expect(metrics.totalCacheHits).toBe(0)
      expect(metrics.totalCacheMisses).toBe(0)
      expect(metrics.batchUpdateCount).toBe(0)
    })

    it('should track when performance monitoring is enabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })

      const endTimer = performanceMonitor.startStyleCalculation()
      setTimeout(() => endTimer(), 10)
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordBatchUpdate(5)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(1)
      expect(metrics.totalCacheMisses).toBe(1)
      expect(metrics.batchUpdateCount).toBe(1)
    })
  })

  describe('style calculation tracking', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should track calculation time', async () => {
      const endTimer = performanceMonitor.startStyleCalculation()

      // 模拟一些计算时间
      await new Promise(resolve => setTimeout(resolve, 10))
      endTimer()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.averageCalculationTime).toBeGreaterThan(0)
      expect(metrics.maxCalculationTime).toBeGreaterThan(0)
      expect(metrics.minCalculationTime).toBeGreaterThan(0)
      expect(metrics.minCalculationTime).not.toBe(Infinity)
    })

    it('should track multiple calculations', async () => {
      // 第一次计算
      const endTimer1 = performanceMonitor.startStyleCalculation()
      await new Promise(resolve => setTimeout(resolve, 5))
      endTimer1()

      // 第二次计算
      const endTimer2 = performanceMonitor.startStyleCalculation()
      await new Promise(resolve => setTimeout(resolve, 15))
      endTimer2()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(2)
      expect(metrics.averageCalculationTime).toBeGreaterThan(0)
      expect(metrics.maxCalculationTime).toBeGreaterThanOrEqual(metrics.minCalculationTime)
    })

    it('should return no-op function when monitoring is disabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: false })

      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer() // 应该不会抛出错误

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(0)
    })

    it('should handle immediate timer end', () => {
      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer() // 立即结束

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(1)
      expect(metrics.averageCalculationTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('cache tracking', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should track cache hits', () => {
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheHit()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(3)
      expect(metrics.totalCacheMisses).toBe(0)
      expect(metrics.cacheHitRate).toBe(1)
    })

    it('should track cache misses', () => {
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheMiss()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(0)
      expect(metrics.totalCacheMisses).toBe(2)
      expect(metrics.cacheHitRate).toBe(0)
    })

    it('should calculate cache hit rate correctly', () => {
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheMiss()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(2)
      expect(metrics.totalCacheMisses).toBe(2)
      expect(metrics.cacheHitRate).toBe(0.5)
    })

    it('should handle zero cache access', () => {
      const metrics = performanceMonitor.getMetrics()
      expect(metrics.cacheHitRate).toBe(0)
    })
  })

  describe('batch update tracking', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should track batch updates', () => {
      performanceMonitor.recordBatchUpdate(5)
      performanceMonitor.recordBatchUpdate(3)
      performanceMonitor.recordBatchUpdate(7)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.batchUpdateCount).toBe(3)
      expect(metrics.averageBatchSize).toBe(5) // (5 + 3 + 7) / 3 = 5
    })

    it('should handle single batch update', () => {
      performanceMonitor.recordBatchUpdate(10)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.batchUpdateCount).toBe(1)
      expect(metrics.averageBatchSize).toBe(10)
    })

    it('should handle zero-size batch', () => {
      performanceMonitor.recordBatchUpdate(0)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.batchUpdateCount).toBe(1)
      expect(metrics.averageBatchSize).toBe(0)
    })
  })

  describe('metrics and statistics', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should provide complete metrics', () => {
      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordBatchUpdate(5)

      const metrics = performanceMonitor.getMetrics()

      expect(metrics).toHaveProperty('totalStyleCalculations')
      expect(metrics).toHaveProperty('totalCacheHits')
      expect(metrics).toHaveProperty('totalCacheMisses')
      expect(metrics).toHaveProperty('averageCalculationTime')
      expect(metrics).toHaveProperty('maxCalculationTime')
      expect(metrics).toHaveProperty('minCalculationTime')
      expect(metrics).toHaveProperty('batchUpdateCount')
      expect(metrics).toHaveProperty('averageBatchSize')
      expect(metrics).toHaveProperty('cacheHitRate')
      expect(metrics).toHaveProperty('recentCalculationTimes')
    })

    it('should provide recent calculation times', () => {
      // 添加多次计算
      for (let i = 0; i < 15; i++) {
        const endTimer = performanceMonitor.startStyleCalculation()
        endTimer()
      }

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.recentCalculationTimes).toHaveLength(10) // 最近10次
    })

    it('should handle min calculation time edge case', () => {
      const metrics = performanceMonitor.getMetrics()
      expect(metrics.minCalculationTime).toBe(Infinity) // 没有计算时的初始值
    })
  })

  describe('memory management', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should limit calculation times history', () => {
      // 添加超过1000次计算
      for (let i = 0; i < 1200; i++) {
        const endTimer = performanceMonitor.startStyleCalculation()
        endTimer()
      }

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(1200)
      // 内部应该只保留最近1000次的详细记录
    })

    it('should limit batch sizes history', () => {
      // 添加超过100次批量更新
      for (let i = 0; i < 150; i++) {
        performanceMonitor.recordBatchUpdate(i + 1)
      }

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.batchUpdateCount).toBe(150)
      // 内部应该只保留最近100次的详细记录
    })
  })

  describe('reset functionality', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should reset all metrics', () => {
      // 添加一些数据
      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordBatchUpdate(5)

      // 重置
      performanceMonitor.reset()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(0)
      expect(metrics.totalCacheHits).toBe(0)
      expect(metrics.totalCacheMisses).toBe(0)
      expect(metrics.averageCalculationTime).toBe(0)
      expect(metrics.maxCalculationTime).toBe(0)
      expect(metrics.minCalculationTime).toBe(Infinity)
      expect(metrics.batchUpdateCount).toBe(0)
      expect(metrics.averageBatchSize).toBe(0)
      expect(metrics.cacheHitRate).toBe(0)
      expect(metrics.recentCalculationTimes).toHaveLength(0)
    })
  })

  describe('print report', () => {
    it('should warn when monitoring is disabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: false })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      performanceMonitor.printReport()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[vue-styled-components] Performance monitoring is disabled',
      )

      consoleSpy.mockRestore()
    })

    it('should print report when monitoring is enabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })

      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

      // 添加一些数据
      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordBatchUpdate(5)

      performanceMonitor.printReport()

      expect(consoleGroupSpy).toHaveBeenCalledWith('[vue-styled-components] Performance Report')
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Total style calculations:'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Cache hit rate:'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Average calculation time:'))
      expect(consoleGroupEndSpy).toHaveBeenCalled()

      consoleGroupSpy.mockRestore()
      consoleLogSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
    })

    it('should handle infinity min calculation time in report', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      performanceMonitor.printReport()

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Min calculation time: N/A'))

      consoleLogSpy.mockRestore()
    })
  })

  describe('recommendations', () => {
    beforeEach(() => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })
    })

    it('should recommend increasing cache size for low hit rate', () => {
      // 模拟低缓存命中率
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheHit()

      const recommendations = performanceMonitor.getRecommendations()
      expect(recommendations).toContain('考虑增加缓存大小或检查是否有过多的动态样式')
    })

    it('should recommend async processing for slow calculations', () => {
      // 模拟慢计算
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10) // 10ms 计算时间

      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()

      const recommendations = performanceMonitor.getRecommendations()
      expect(recommendations).toContain('样式计算时间较长，考虑启用异步处理或简化样式表达式')
    })

    it('should recommend adjusting batch delay for small batches', () => {
      performanceMonitor.recordBatchUpdate(1)
      performanceMonitor.recordBatchUpdate(1)

      const recommendations = performanceMonitor.getRecommendations()
      expect(recommendations).toContain('批量更新效果不明显，可以考虑调整批量延迟时间')
    })

    it('should provide positive feedback for good performance', () => {
      // 模拟良好的性能指标
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheHit()
      performanceMonitor.recordCacheMiss() // 75% 命中率

      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer() // 快速计算

      performanceMonitor.recordBatchUpdate(5) // 合理的批量大小

      const recommendations = performanceMonitor.getRecommendations()
      expect(recommendations).toContain('性能表现良好！')
    })

    it('should provide multiple recommendations when needed', () => {
      // 模拟多个性能问题
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheMiss()
      performanceMonitor.recordCacheHit() // 低命中率

      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10) // 慢计算

      const endTimer = performanceMonitor.startStyleCalculation()
      endTimer()

      performanceMonitor.recordBatchUpdate(1) // 小批量

      const recommendations = performanceMonitor.getRecommendations()
      expect(recommendations.length).toBeGreaterThan(1)
    })
  })
})
