import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStyleProcessing, getStyleConfig, resetStyleConfig } from '../src/config'
import {
  BatchUpdateManager,
  CacheManager,
  PerformanceAnalyzer,
  setupDevelopmentConfiguration,
  setupHighPerformanceConfiguration,
  setupMemoryOptimizedConfiguration,
  setupOptimizedConfiguration,
  setupProductionConfiguration,
} from '../src/examples/optimizationExample'
import { batchUpdater, performanceMonitor, styleCache } from '../src/utils'

describe('optimizationExample', () => {
  beforeEach(() => {
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('configuration presets', () => {
    describe('setupOptimizedConfiguration', () => {
      it('should configure optimized settings', () => {
        setupOptimizedConfiguration()

        const config = getStyleConfig()
        expect(config.enableCache).toBe(true)
        expect(config.cacheSize).toBe(2000)
        expect(config.enableBatchUpdates).toBe(true)
        expect(config.batchDelay).toBe(8)
        expect(config.enableAsync).toBe(false)
        expect(config.enablePerformanceMonitoring).toBe(true)
      })
    })

    describe('setupHighPerformanceConfiguration', () => {
      it('should configure high performance settings', () => {
        setupHighPerformanceConfiguration()

        const config = getStyleConfig()
        expect(config.enableCache).toBe(true)
        expect(config.cacheSize).toBe(5000)
        expect(config.enableBatchUpdates).toBe(true)
        expect(config.batchDelay).toBe(4)
        expect(config.enableAsync).toBe(true)
        expect(config.enablePerformanceMonitoring).toBe(true)
      })
    })

    describe('setupMemoryOptimizedConfiguration', () => {
      it('should configure memory optimized settings', () => {
        setupMemoryOptimizedConfiguration()

        const config = getStyleConfig()
        expect(config.enableCache).toBe(true)
        expect(config.cacheSize).toBe(500)
        expect(config.enableBatchUpdates).toBe(true)
        expect(config.batchDelay).toBe(16)
        expect(config.enableAsync).toBe(false)
        expect(config.enablePerformanceMonitoring).toBe(false)
      })
    })

    describe('setupDevelopmentConfiguration', () => {
      it('should configure development settings', () => {
        setupDevelopmentConfiguration()

        const config = getStyleConfig()
        expect(config.enableCache).toBe(true)
        expect(config.cacheSize).toBe(1000)
        expect(config.enableBatchUpdates).toBe(true)
        expect(config.batchDelay).toBe(16)
        expect(config.enableAsync).toBe(false)
        expect(config.enablePerformanceMonitoring).toBe(true)
      })

      it('should setup periodic performance reporting in browser environment', () => {
        // 模拟浏览器环境
        Object.defineProperty(globalThis, 'window', {
          value: {},
          writable: true,
        })

        vi.useFakeTimers()
        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
        const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
        const printReportSpy = vi.spyOn(performanceMonitor, 'printReport').mockImplementation(() => {})
        const getRecommendationsSpy = vi.spyOn(performanceMonitor, 'getRecommendations').mockReturnValue(['test recommendation'])

        setupDevelopmentConfiguration()

        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000)

        // 触发定时器
        vi.advanceTimersByTime(30000)

        expect(printReportSpy).toHaveBeenCalled()
        expect(getRecommendationsSpy).toHaveBeenCalled()
        expect(consoleGroupSpy).toHaveBeenCalledWith('[vue-styled-components] Performance Recommendations')
        expect(consoleLogSpy).toHaveBeenCalledWith('• test recommendation')
        expect(consoleGroupEndSpy).toHaveBeenCalled()

        setIntervalSpy.mockRestore()
        consoleGroupSpy.mockRestore()
        consoleLogSpy.mockRestore()
        consoleGroupEndSpy.mockRestore()
        printReportSpy.mockRestore()
        getRecommendationsSpy.mockRestore()
      })

      it('should not setup periodic reporting in non-browser environment', () => {
        // 确保没有 window 对象
        delete (globalThis as any).window

        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

        setupDevelopmentConfiguration()

        expect(setIntervalSpy).not.toHaveBeenCalled()

        setIntervalSpy.mockRestore()
      })
    })

    describe('setupProductionConfiguration', () => {
      it('should configure production settings', () => {
        setupProductionConfiguration()

        const config = getStyleConfig()
        expect(config.enableCache).toBe(true)
        expect(config.cacheSize).toBe(1500)
        expect(config.enableBatchUpdates).toBe(true)
        expect(config.batchDelay).toBe(16)
        expect(config.enableAsync).toBe(false)
        expect(config.enablePerformanceMonitoring).toBe(false)
      })
    })
  })

  describe('performanceAnalyzer', () => {
    let analyzer: PerformanceAnalyzer

    beforeEach(() => {
      analyzer = new PerformanceAnalyzer()
    })

    describe('start and stop', () => {
      it('should track analysis duration', () => {
        vi.useFakeTimers()

        analyzer.start()

        vi.advanceTimersByTime(100)

        const result = analyzer.stop()

        expect(result.totalDuration).toBeGreaterThanOrEqual(100)
        expect(result).toHaveProperty('styleMetrics')
        expect(result).toHaveProperty('cacheStats')
        expect(result).toHaveProperty('recommendations')
      })

      it('should reset performance monitor on start', () => {
        const resetSpy = vi.spyOn(performanceMonitor, 'reset')

        analyzer.start()

        expect(resetSpy).toHaveBeenCalled()

        resetSpy.mockRestore()
      })

      it('should collect metrics on stop', () => {
        const getMetricsSpy = vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
          totalStyleCalculations: 5,
          totalCacheHits: 3,
          totalCacheMisses: 2,
          averageCalculationTime: 1.5,
          maxCalculationTime: 3.0,
          minCalculationTime: 0.5,
          batchUpdateCount: 2,
          averageBatchSize: 4,
          cacheHitRate: 0.6,
          recentCalculationTimes: [1.0, 1.5, 2.0],
        })

        const getStatsSpy = vi.spyOn(styleCache, 'getStats').mockReturnValue({
          size: 10,
          totalHits: 15,
          averageHits: 1.5,
        })

        const getRecommendationsSpy = vi.spyOn(performanceMonitor, 'getRecommendations').mockReturnValue(['recommendation 1'])

        analyzer.start()
        const result = analyzer.stop()

        expect(getMetricsSpy).toHaveBeenCalled()
        expect(getStatsSpy).toHaveBeenCalled()
        expect(getRecommendationsSpy).toHaveBeenCalled()
        expect(result.styleMetrics.totalStyleCalculations).toBe(5)
        expect(result.cacheStats.size).toBe(10)
        expect(result.recommendations).toEqual(['recommendation 1'])

        getMetricsSpy.mockRestore()
        getStatsSpy.mockRestore()
        getRecommendationsSpy.mockRestore()
      })
    })

    describe('analyzeComponent', () => {
      it('should analyze component performance', async () => {
        const testFunction = vi.fn().mockResolvedValue(undefined)

        const result = await analyzer.analyzeComponent(testFunction)

        expect(testFunction).toHaveBeenCalled()
        expect(result).toHaveProperty('totalDuration')
        expect(result).toHaveProperty('styleMetrics')
        expect(result).toHaveProperty('cacheStats')
        expect(result).toHaveProperty('recommendations')
      })

      it('should handle async component test functions', async () => {
        const testFunction = vi.fn(async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
        })

        const result = await analyzer.analyzeComponent(testFunction)

        expect(testFunction).toHaveBeenCalled()
        expect(result.totalDuration).toBeGreaterThan(0)
      })

      it('should handle errors in test function', async () => {
        const testFunction = vi.fn().mockRejectedValue(new Error('Test error'))

        await expect(analyzer.analyzeComponent(testFunction)).rejects.toThrow('Test error')
      })
    })
  })

  describe('cacheManager', () => {
    describe('warmupCache', () => {
      it('should accept warmup styles array', () => {
        const commonStyles = [
          {
            expressions: ['color: red;'],
            context: { theme: { primary: 'blue' } },
          },
          {
            expressions: ['font-size: 16px;'],
            context: { theme: { secondary: 'green' } },
          },
        ]

        expect(() => {
          CacheManager.warmupCache(commonStyles)
        }).not.toThrow()
      })

      it('should handle empty warmup array', () => {
        expect(() => {
          CacheManager.warmupCache([])
        }).not.toThrow()
      })
    })

    describe('cleanupCache', () => {
      it('should clear the style cache', () => {
        const clearSpy = vi.spyOn(styleCache, 'clear')

        CacheManager.cleanupCache()

        expect(clearSpy).toHaveBeenCalled()

        clearSpy.mockRestore()
      })
    })

    describe('getCacheUsage', () => {
      it('should return cache statistics', () => {
        const mockStats = {
          size: 5,
          totalHits: 20,
          averageHits: 4,
        }

        const getStatsSpy = vi.spyOn(styleCache, 'getStats').mockReturnValue(mockStats)

        const usage = CacheManager.getCacheUsage()

        expect(getStatsSpy).toHaveBeenCalled()
        expect(usage).toEqual(mockStats)

        getStatsSpy.mockRestore()
      })
    })
  })

  describe('batchUpdateManager', () => {
    describe('flushUpdates', () => {
      it('should flush pending updates', () => {
        const flushSyncSpy = vi.spyOn(batchUpdater, 'flushSync')

        BatchUpdateManager.flushUpdates()

        expect(flushSyncSpy).toHaveBeenCalled()

        flushSyncSpy.mockRestore()
      })
    })

    describe('getPendingUpdatesCount', () => {
      it('should return pending updates count', () => {
        const mockCount = 3
        const getPendingCountSpy = vi.spyOn(batchUpdater, 'getPendingCount').mockReturnValue(mockCount)

        const count = BatchUpdateManager.getPendingUpdatesCount()

        expect(getPendingCountSpy).toHaveBeenCalled()
        expect(count).toBe(mockCount)

        getPendingCountSpy.mockRestore()
      })
    })

    describe('clearPendingUpdates', () => {
      it('should clear pending updates', () => {
        const clearSpy = vi.spyOn(batchUpdater, 'clear')

        BatchUpdateManager.clearPendingUpdates()

        expect(clearSpy).toHaveBeenCalled()

        clearSpy.mockRestore()
      })
    })
  })

  describe('integration scenarios', () => {
    it('should work with different configuration combinations', () => {
      // 测试高性能配置
      setupHighPerformanceConfiguration()
      let config = getStyleConfig()
      expect(config.enableAsync).toBe(true)
      expect(config.cacheSize).toBe(5000)

      // 切换到内存优化配置
      setupMemoryOptimizedConfiguration()
      config = getStyleConfig()
      expect(config.enablePerformanceMonitoring).toBe(false)
      expect(config.cacheSize).toBe(500)

      // 切换到生产配置
      setupProductionConfiguration()
      config = getStyleConfig()
      expect(config.enablePerformanceMonitoring).toBe(false)
      expect(config.cacheSize).toBe(1500)
    })

    it('should handle performance analysis workflow', async () => {
      setupDevelopmentConfiguration()

      const analyzer = new PerformanceAnalyzer()

      const result = await analyzer.analyzeComponent(async () => {
        // 模拟组件渲染过程
        const endTimer = performanceMonitor.startStyleCalculation()
        performanceMonitor.recordCacheHit()
        performanceMonitor.recordBatchUpdate(3)
        endTimer()
      })

      expect(result.styleMetrics.totalStyleCalculations).toBe(1)
      expect(result.styleMetrics.totalCacheHits).toBe(1)
      expect(result.styleMetrics.batchUpdateCount).toBe(1)
    })

    it('should handle cache management workflow', () => {
      // 预热缓存
      const commonStyles = [
        { expressions: ['color: red;'], context: { theme: {} } },
      ]
      CacheManager.warmupCache(commonStyles)

      // 检查使用情况
      const usage = CacheManager.getCacheUsage()
      expect(usage).toHaveProperty('size')
      expect(usage).toHaveProperty('totalHits')
      expect(usage).toHaveProperty('averageHits')

      // 清理缓存
      CacheManager.cleanupCache()

      const usageAfterCleanup = CacheManager.getCacheUsage()
      expect(usageAfterCleanup.size).toBe(0)
    })

    it('should handle batch update management workflow', () => {
      configureStyleProcessing({ enableBatchUpdates: true })

      // 模拟添加一些待处理的更新
      batchUpdater.scheduleUpdate('class1', '.class1 { color: red; }')
      batchUpdater.scheduleUpdate('class2', '.class2 { color: blue; }')

      // 检查待处理更新数量
      const pendingCount = BatchUpdateManager.getPendingUpdatesCount()
      expect(pendingCount).toBe(2)

      // 强制刷新
      BatchUpdateManager.flushUpdates()

      // 检查更新已被处理
      const pendingCountAfterFlush = BatchUpdateManager.getPendingUpdatesCount()
      expect(pendingCountAfterFlush).toBe(0)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null/undefined inputs', () => {
      // CacheManager.warmupCache expects an array, so null/undefined will throw
      expect(() => {
        CacheManager.warmupCache(null as any)
      }).toThrow()

      expect(() => {
        CacheManager.warmupCache(undefined as any)
      }).toThrow()
    })

    it('should handle performance analyzer with no operations', () => {
      const analyzer = new PerformanceAnalyzer()

      analyzer.start()
      const result = analyzer.stop()

      expect(result.totalDuration).toBeGreaterThanOrEqual(0)
      expect(result.styleMetrics.totalStyleCalculations).toBe(0)
    })

    it('should handle configuration changes during analysis', async () => {
      const analyzer = new PerformanceAnalyzer()

      const result = await analyzer.analyzeComponent(async () => {
        setupHighPerformanceConfiguration()
        setupMemoryOptimizedConfiguration()
        setupProductionConfiguration()
      })

      expect(result).toHaveProperty('totalDuration')

      // 确保最终配置是生产配置
      const config = getStyleConfig()
      expect(config.enablePerformanceMonitoring).toBe(false)
    })
  })
})
