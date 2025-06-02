import type { StyleConfig } from '../src/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  configureStyleProcessing,
  getStyleConfig,
  resetStyleConfig,

} from '../src/config'
import { batchUpdater, performanceMonitor, styleCache } from '../src/utils'

describe('config', () => {
  beforeEach(() => {
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
  })

  afterEach(() => {
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
  })

  describe('getStyleConfig', () => {
    it('should return default configuration', () => {
      const config = getStyleConfig()

      expect(config).toEqual({
        enableCache: true,
        cacheSize: 1000,
        enableBatchUpdates: true,
        batchDelay: 16,
        enableAsync: false,
        enablePerformanceMonitoring: false,
      })
    })

    it('should return a copy of the configuration', () => {
      const config1 = getStyleConfig()
      const config2 = getStyleConfig()

      expect(config1).not.toBe(config2)
      expect(config1).toEqual(config2)
    })
  })

  describe('configureStyleProcessing', () => {
    it('should update configuration with partial options', () => {
      configureStyleProcessing({
        enableCache: false,
        cacheSize: 2000,
      })

      const config = getStyleConfig()
      expect(config.enableCache).toBe(false)
      expect(config.cacheSize).toBe(2000)
      // 其他配置应保持默认值
      expect(config.enableBatchUpdates).toBe(true)
      expect(config.batchDelay).toBe(16)
      expect(config.enableAsync).toBe(false)
      expect(config.enablePerformanceMonitoring).toBe(false)
    })

    it('should update all configuration options', () => {
      const newConfig: StyleConfig = {
        enableCache: false,
        cacheSize: 5000,
        enableBatchUpdates: false,
        batchDelay: 32,
        enableAsync: true,
        enablePerformanceMonitoring: true,
      }

      configureStyleProcessing(newConfig)

      const config = getStyleConfig()
      expect(config).toEqual(newConfig)
    })

    it('should handle empty configuration object', () => {
      const originalConfig = getStyleConfig()

      configureStyleProcessing({})

      const config = getStyleConfig()
      expect(config).toEqual(originalConfig)
    })

    it('should handle undefined configuration', () => {
      const originalConfig = getStyleConfig()

      configureStyleProcessing(undefined as any)

      const config = getStyleConfig()
      expect(config).toEqual(originalConfig)
    })

    it('should handle null configuration', () => {
      const originalConfig = getStyleConfig()

      configureStyleProcessing(null as any)

      const config = getStyleConfig()
      expect(config).toEqual(originalConfig)
    })

    describe('cache configuration', () => {
      it('should enable cache when enableCache is true', () => {
        configureStyleProcessing({ enableCache: true })

        const config = getStyleConfig()
        expect(config.enableCache).toBe(true)
      })

      it('should disable cache when enableCache is false', () => {
        configureStyleProcessing({ enableCache: false })

        const config = getStyleConfig()
        expect(config.enableCache).toBe(false)
      })

      it('should update cache size', () => {
        configureStyleProcessing({ cacheSize: 3000 })

        const config = getStyleConfig()
        expect(config.cacheSize).toBe(3000)
      })

      it('should handle zero cache size', () => {
        configureStyleProcessing({ cacheSize: 0 })

        const config = getStyleConfig()
        expect(config.cacheSize).toBe(0)
      })

      it('should handle negative cache size', () => {
        configureStyleProcessing({ cacheSize: -100 })

        const config = getStyleConfig()
        expect(config.cacheSize).toBe(-100)
      })
    })

    describe('batch updates configuration', () => {
      it('should enable batch updates when enableBatchUpdates is true', () => {
        configureStyleProcessing({ enableBatchUpdates: true })

        const config = getStyleConfig()
        expect(config.enableBatchUpdates).toBe(true)
      })

      it('should disable batch updates when enableBatchUpdates is false', () => {
        configureStyleProcessing({ enableBatchUpdates: false })

        const config = getStyleConfig()
        expect(config.enableBatchUpdates).toBe(false)
      })

      it('should update batch delay', () => {
        configureStyleProcessing({ batchDelay: 50 })

        const config = getStyleConfig()
        expect(config.batchDelay).toBe(50)
      })

      it('should handle zero batch delay', () => {
        configureStyleProcessing({ batchDelay: 0 })

        const config = getStyleConfig()
        expect(config.batchDelay).toBe(0)
      })

      it('should handle negative batch delay', () => {
        configureStyleProcessing({ batchDelay: -10 })

        const config = getStyleConfig()
        expect(config.batchDelay).toBe(-10)
      })
    })

    describe('async configuration', () => {
      it('should enable async when enableAsync is true', () => {
        configureStyleProcessing({ enableAsync: true })

        const config = getStyleConfig()
        expect(config.enableAsync).toBe(true)
      })

      it('should disable async when enableAsync is false', () => {
        configureStyleProcessing({ enableAsync: false })

        const config = getStyleConfig()
        expect(config.enableAsync).toBe(false)
      })
    })

    describe('performance monitoring configuration', () => {
      it('should enable performance monitoring when enablePerformanceMonitoring is true', () => {
        configureStyleProcessing({ enablePerformanceMonitoring: true })

        const config = getStyleConfig()
        expect(config.enablePerformanceMonitoring).toBe(true)
      })

      it('should disable performance monitoring when enablePerformanceMonitoring is false', () => {
        configureStyleProcessing({ enablePerformanceMonitoring: false })

        const config = getStyleConfig()
        expect(config.enablePerformanceMonitoring).toBe(false)
      })
    })
  })

  describe('resetStyleConfig', () => {
    it('should reset configuration to default values', () => {
      // 修改配置
      configureStyleProcessing({
        enableCache: false,
        cacheSize: 5000,
        enableBatchUpdates: false,
        batchDelay: 100,
        enableAsync: true,
        enablePerformanceMonitoring: true,
      })

      // 重置配置
      resetStyleConfig()

      // 验证配置已重置为默认值
      const config = getStyleConfig()
      expect(config).toEqual({
        enableCache: true,
        cacheSize: 1000,
        enableBatchUpdates: true,
        batchDelay: 16,
        enableAsync: false,
        enablePerformanceMonitoring: false,
      })
    })

    it('should not automatically clear utilities when reset', () => {
      // resetStyleConfig only resets the configuration, not the utilities
      // The utilities need to be cleared manually in tests
      const clearCacheSpy = vi.spyOn(styleCache, 'clear')
      const clearBatchSpy = vi.spyOn(batchUpdater, 'clear')
      const resetPerfSpy = vi.spyOn(performanceMonitor, 'reset')

      resetStyleConfig()

      expect(clearCacheSpy).not.toHaveBeenCalled()
      expect(clearBatchSpy).not.toHaveBeenCalled()
      expect(resetPerfSpy).not.toHaveBeenCalled()

      clearCacheSpy.mockRestore()
      clearBatchSpy.mockRestore()
      resetPerfSpy.mockRestore()
    })
  })

  describe('configuration persistence', () => {
    it('should maintain configuration across multiple calls', () => {
      configureStyleProcessing({ enableCache: false })

      const config1 = getStyleConfig()
      const config2 = getStyleConfig()

      expect(config1.enableCache).toBe(false)
      expect(config2.enableCache).toBe(false)
    })

    it('should allow incremental configuration updates', () => {
      configureStyleProcessing({ enableCache: false })
      configureStyleProcessing({ cacheSize: 2000 })
      configureStyleProcessing({ enableBatchUpdates: false })

      const config = getStyleConfig()
      expect(config.enableCache).toBe(false)
      expect(config.cacheSize).toBe(2000)
      expect(config.enableBatchUpdates).toBe(false)
      // 其他配置应保持默认值
      expect(config.batchDelay).toBe(16)
      expect(config.enableAsync).toBe(false)
      expect(config.enablePerformanceMonitoring).toBe(false)
    })
  })

  describe('configuration validation', () => {
    it('should handle boolean values correctly', () => {
      configureStyleProcessing({
        enableCache: true,
        enableBatchUpdates: false,
        enableAsync: true,
        enablePerformanceMonitoring: false,
      })

      const config = getStyleConfig()
      expect(typeof config.enableCache).toBe('boolean')
      expect(typeof config.enableBatchUpdates).toBe('boolean')
      expect(typeof config.enableAsync).toBe('boolean')
      expect(typeof config.enablePerformanceMonitoring).toBe('boolean')
    })

    it('should handle number values correctly', () => {
      configureStyleProcessing({
        cacheSize: 1500,
        batchDelay: 25,
      })

      const config = getStyleConfig()
      expect(typeof config.cacheSize).toBe('number')
      expect(typeof config.batchDelay).toBe('number')
      expect(config.cacheSize).toBe(1500)
      expect(config.batchDelay).toBe(25)
    })

    it('should handle extreme values', () => {
      configureStyleProcessing({
        cacheSize: Number.MAX_SAFE_INTEGER,
        batchDelay: Number.MIN_SAFE_INTEGER,
      })

      const config = getStyleConfig()
      expect(config.cacheSize).toBe(Number.MAX_SAFE_INTEGER)
      expect(config.batchDelay).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle floating point values', () => {
      configureStyleProcessing({
        cacheSize: 1000.5,
        batchDelay: 16.7,
      })

      const config = getStyleConfig()
      expect(config.cacheSize).toBe(1000.5)
      expect(config.batchDelay).toBe(16.7)
    })
  })

  describe('integration with utilities', () => {
    it('should work with style cache configuration', () => {
      configureStyleProcessing({ enableCache: true, cacheSize: 500 })

      // 测试缓存是否按配置工作
      const config = getStyleConfig()
      expect(config.enableCache).toBe(true)
      expect(config.cacheSize).toBe(500)
    })

    it('should work with batch updater configuration', () => {
      configureStyleProcessing({ enableBatchUpdates: true, batchDelay: 50 })

      const config = getStyleConfig()
      expect(config.enableBatchUpdates).toBe(true)
      expect(config.batchDelay).toBe(50)
    })

    it('should work with performance monitor configuration', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })

      const config = getStyleConfig()
      expect(config.enablePerformanceMonitoring).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle configuration with extra properties', () => {
      const configWithExtra = {
        enableCache: false,
        cacheSize: 2000,
        extraProperty: 'should be ignored',
        anotherExtra: 123,
      } as any

      configureStyleProcessing(configWithExtra)

      const config = getStyleConfig()
      expect(config.enableCache).toBe(false)
      expect(config.cacheSize).toBe(2000)
      // Extra properties are copied by the spread operator
      expect((config as any).extraProperty).toBe('should be ignored')
      expect((config as any).anotherExtra).toBe(123)
    })

    it('should handle configuration with missing properties', () => {
      const partialConfig = {
        enableCache: false,
      }

      configureStyleProcessing(partialConfig)

      const config = getStyleConfig()
      expect(config.enableCache).toBe(false)
      // 其他属性应保持默认值
      expect(config.cacheSize).toBe(1000)
      expect(config.enableBatchUpdates).toBe(true)
      expect(config.batchDelay).toBe(16)
      expect(config.enableAsync).toBe(false)
      expect(config.enablePerformanceMonitoring).toBe(false)
    })

    it('should handle rapid configuration changes', () => {
      for (let i = 0; i < 100; i++) {
        configureStyleProcessing({
          enableCache: i % 2 === 0,
          cacheSize: i * 10,
        })
      }

      const config = getStyleConfig()
      expect(config.enableCache).toBe(false) // 99 % 2 === 1, so false
      expect(config.cacheSize).toBe(990) // 99 * 10
    })

    it('should maintain type safety', () => {
      const config = getStyleConfig()

      // TypeScript 应该确保这些属性存在且类型正确
      expect(typeof config.enableCache).toBe('boolean')
      expect(typeof config.cacheSize).toBe('number')
      expect(typeof config.enableBatchUpdates).toBe('boolean')
      expect(typeof config.batchDelay).toBe('number')
      expect(typeof config.enableAsync).toBe('boolean')
      expect(typeof config.enablePerformanceMonitoring).toBe('boolean')
    })
  })
})
