import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStyleProcessing, resetStyleConfig } from '../src/config'
import { batchUpdater } from '../src/utils/batchUpdater'
import { performanceMonitor } from '../src/utils/performanceMonitor'
import { styleCache } from '../src/utils/styleCache'
import { injectStyle, removeStyle } from '../src/utils/styleManagement'

// Mock DOM environment
Object.defineProperty(globalThis, 'document', {
  value: {
    createElement: vi.fn(() => ({
      appendChild: vi.fn(),
    })),
    head: {
      appendChild: vi.fn(),
    },
    createTextNode: vi.fn(() => ({
      data: '',
      remove: vi.fn(),
    })),
  },
  writable: true,
})

describe('styleManagement', () => {
  beforeEach(() => {
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetStyleConfig()
    styleCache.clear()
    batchUpdater.clear()
    performanceMonitor.reset()
    vi.restoreAllMocks()
  })

  describe('injectStyle', () => {
    it('should inject style and return tailwind classes', () => {
      const className = 'test-class'
      const cssWithExpression = ['color: red;', 'font-size: 16px;']
      const context = { theme: { primary: 'blue' } }

      const result = injectStyle(className, cssWithExpression, context)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should use cached styles when available', () => {
      configureStyleProcessing({ enableCache: true })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }
      const cachedCss = '.test-class { color: red; }'
      const cachedTailwindClasses = ['text-red-500']

      // 预设缓存
      styleCache.set(cssWithExpression, context, cachedCss, cachedTailwindClasses, className)

      const result = injectStyle(className, cssWithExpression, context)

      expect(result).toEqual(cachedTailwindClasses)
    })

    it('should record cache hit when using cached styles', () => {
      configureStyleProcessing({
        enableCache: true,
        enablePerformanceMonitoring: true,
      })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }
      const cachedCss = '.test-class { color: red; }'
      const cachedTailwindClasses = ['text-red-500']

      // 预设缓存
      styleCache.set(cssWithExpression, context, cachedCss, cachedTailwindClasses, className)

      injectStyle(className, cssWithExpression, context)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(1)
      expect(metrics.totalCacheMisses).toBe(0)
    })

    it('should record cache miss when no cached styles available', () => {
      configureStyleProcessing({
        enableCache: true,
        enablePerformanceMonitoring: true,
      })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      injectStyle(className, cssWithExpression, context)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(0)
      expect(metrics.totalCacheMisses).toBe(1)
    })

    it('should use batch updater when batch updates are enabled', () => {
      configureStyleProcessing({ enableBatchUpdates: true })

      const scheduleUpdateSpy = vi.spyOn(batchUpdater, 'scheduleUpdate')

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      injectStyle(className, cssWithExpression, context)

      expect(scheduleUpdateSpy).toHaveBeenCalled()
    })

    it('should insert style directly when batch updates are disabled', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      injectStyle(className, cssWithExpression, context)

      expect(document.createTextNode).toHaveBeenCalled()
    })

    it('should handle empty className', () => {
      const className = ''
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      expect(() => {
        injectStyle(className, cssWithExpression, context)
      }).not.toThrow()
    })

    it('should handle empty expressions array', () => {
      const className = 'test-class'
      const cssWithExpression: string[] = []
      const context = { theme: {} }

      const result = injectStyle(className, cssWithExpression, context)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle complex expressions with functions', () => {
      const className = 'test-class'
      const cssWithExpression = [
        'color: red;',
        (props: any) => `font-size: ${props.size || '16px'};`,
      ]
      const context = { size: '20px', theme: {} }

      expect(() => {
        injectStyle(className, cssWithExpression, context)
      }).not.toThrow()
    })

    it('should track style calculation time', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: true })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      injectStyle(className, cssWithExpression, context)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(1)
    })

    it('should cache computed styles for future use', () => {
      configureStyleProcessing({ enableCache: true })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      // 第一次调用
      injectStyle(className, cssWithExpression, context)

      // 检查是否已缓存
      const cached = styleCache.get(cssWithExpression, context, className)
      expect(cached).not.toBeNull()
    })
  })

  describe('removeStyle', () => {
    beforeEach(() => {
      // 模拟已存在的样式标签和节点
      const mockStyleTag = {
        childNodes: [
          {
            nodeValue: '.test-class { color: red; }',
            remove: vi.fn(),
          },
          {
            nodeValue: '.other-class { color: blue; }',
            remove: vi.fn(),
          },
        ],
      }

      // 模拟 tags 数组
      vi.doMock('../src/utils/styleManagement', async () => {
        const actual = await vi.importActual('../src/utils/styleManagement')
        return {
          ...actual,
          tags: [mockStyleTag],
        }
      })
    })

    it('should remove style for given className', () => {
      const className = 'test-class'

      expect(() => {
        removeStyle(className)
      }).not.toThrow()
    })

    it('should handle non-existent className', () => {
      const className = 'non-existent-class'

      expect(() => {
        removeStyle(className)
      }).not.toThrow()
    })

    it('should handle empty className', () => {
      const className = ''

      expect(() => {
        removeStyle(className)
      }).not.toThrow()
    })
  })

  describe('integration with other modules', () => {
    it('should work with all optimizations enabled', () => {
      configureStyleProcessing({
        enableCache: true,
        enableBatchUpdates: true,
        enablePerformanceMonitoring: true,
      })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      // 第一次调用 - 应该缓存未命中
      const result1 = injectStyle(className, cssWithExpression, context)

      // 第二次调用 - 应该缓存命中
      const result2 = injectStyle(className, cssWithExpression, context)

      expect(result1).toEqual(result2)

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalCacheHits).toBe(1)
      expect(metrics.totalCacheMisses).toBe(1)
      expect(metrics.totalStyleCalculations).toBe(1)
    })

    it('should work with cache disabled but batch updates enabled', () => {
      configureStyleProcessing({
        enableCache: false,
        enableBatchUpdates: true,
        enablePerformanceMonitoring: true,
      })

      const scheduleUpdateSpy = vi.spyOn(batchUpdater, 'scheduleUpdate')

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      injectStyle(className, cssWithExpression, context)

      expect(scheduleUpdateSpy).toHaveBeenCalled()

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(1)
      expect(metrics.totalCacheHits).toBe(0)
      expect(metrics.totalCacheMisses).toBe(0)
    })

    it('should work with all optimizations disabled', () => {
      configureStyleProcessing({
        enableCache: false,
        enableBatchUpdates: false,
        enablePerformanceMonitoring: false,
      })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      expect(() => {
        injectStyle(className, cssWithExpression, context)
      }).not.toThrow()
    })
  })

  describe('performance edge cases', () => {
    it('should handle rapid successive calls', () => {
      configureStyleProcessing({
        enableCache: true,
        enableBatchUpdates: true,
        enablePerformanceMonitoring: true,
      })

      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = { theme: {} }

      // 快速连续调用
      for (let i = 0; i < 100; i++) {
        injectStyle(`${className}-${i}`, cssWithExpression, context)
      }

      const metrics = performanceMonitor.getMetrics()
      expect(metrics.totalStyleCalculations).toBe(100)
    })

    it('should handle large CSS expressions', () => {
      const className = 'test-class'
      const cssWithExpression = [
        'color: red;',
        'background-color: blue;',
        'font-size: 16px;',
        'margin: 10px;',
        'padding: 20px;',
        'border: 1px solid black;',
        'border-radius: 5px;',
        'box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
      ]
      const context = { theme: {} }

      expect(() => {
        injectStyle(className, cssWithExpression, context)
      }).not.toThrow()
    })

    it('should handle complex context objects', () => {
      const className = 'test-class'
      const cssWithExpression = ['color: red;']
      const context = {
        theme: {
          colors: {
            primary: 'blue',
            secondary: 'green',
            tertiary: { light: '#ccc', dark: '#333' },
          },
          spacing: [0, 4, 8, 16, 32, 64],
          breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
        },
        props: {
          variant: 'primary',
          size: 'large',
          disabled: false,
          children: 'Button text',
        },
        state: {
          hover: false,
          focus: false,
          active: false,
        },
      }

      expect(() => {
        injectStyle(className, cssWithExpression, context)
      }).not.toThrow()
    })
  })
})
