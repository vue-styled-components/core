import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStyleProcessing, resetStyleConfig } from '../src/config'
import { batchUpdater } from '../src/utils/batchUpdater'

describe('batchUpdater', () => {
  let mockInsertFunction: ReturnType<typeof vi.fn>

  beforeAll(() => {
    window.requestAnimationFrame = vi.fn(callback => callback())
  })

  beforeEach(() => {
    resetStyleConfig()
    batchUpdater.clear()
    mockInsertFunction = vi.fn()
    batchUpdater.setInsertFunction(mockInsertFunction)
  })

  afterEach(() => {
    resetStyleConfig()
    batchUpdater.clear()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('immediate execution mode', () => {
    it('should execute updates immediately when batch updates are disabled', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: red; }')
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should handle multiple immediate updates', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      batchUpdater.scheduleUpdate('class1', '.class1 { color: red; }')
      batchUpdater.scheduleUpdate('class2', '.class2 { color: blue; }')

      expect(mockInsertFunction).toHaveBeenCalledTimes(2)
      expect(mockInsertFunction).toHaveBeenNthCalledWith(1, 'class1', '.class1 { color: red; }')
      expect(mockInsertFunction).toHaveBeenNthCalledWith(2, 'class2', '.class2 { color: blue; }')
    })
  })

  describe('batch mode', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      configureStyleProcessing({ enableBatchUpdates: true, batchDelay: 16 })
    })

    it('should schedule updates for batch execution', () => {
      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(mockInsertFunction).not.toHaveBeenCalled()
      expect(batchUpdater.getPendingCount()).toBe(1)
    })

    it('should execute batched updates after delay', () => {
      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(mockInsertFunction).not.toHaveBeenCalled()

      // 模拟 requestAnimationFrame 和 setTimeout
      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: red; }')
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should batch multiple updates together', () => {
      // 标记这些类为已渲染，这样它们就不会被立即执行
      batchUpdater.markAsRendered('class1')
      batchUpdater.markAsRendered('class2')
      batchUpdater.markAsRendered('class3')

      batchUpdater.scheduleUpdate('class1', '.class1 { color: red; }')
      batchUpdater.scheduleUpdate('class2', '.class2 { color: blue; }')
      batchUpdater.scheduleUpdate('class3', '.class3 { color: green; }')

      expect(batchUpdater.getPendingCount()).toBe(3)
      expect(mockInsertFunction).not.toHaveBeenCalled()

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledTimes(3)
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should replace duplicate class updates', () => {
      // 标记类为已渲染，这样更新会被批量处理
      batchUpdater.markAsRendered('test-class')
      batchUpdater.markAsRendered('other-class')

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      batchUpdater.scheduleUpdate('test-class', '.test { color: blue; }') // 应该替换前一个
      batchUpdater.scheduleUpdate('other-class', '.other { color: green; }')

      expect(batchUpdater.getPendingCount()).toBe(2) // 只有两个不同的类

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledTimes(2)
      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: blue; }') // 使用最新的样式
      expect(mockInsertFunction).toHaveBeenCalledWith('other-class', '.other { color: green; }')
    })

    it('should handle priority ordering', () => {
      // 标记类为已渲染，这样更新会被批量处理
      batchUpdater.markAsRendered('low-priority')
      batchUpdater.markAsRendered('high-priority')
      batchUpdater.markAsRendered('medium-priority')

      batchUpdater.scheduleUpdate('low-priority', '.low { color: red; }', 1)
      batchUpdater.scheduleUpdate('high-priority', '.high { color: blue; }', 10)
      batchUpdater.scheduleUpdate('medium-priority', '.medium { color: green; }', 5)

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledTimes(3)
      // 应该按优先级从高到低执行
      expect(mockInsertFunction).toHaveBeenNthCalledWith(1, 'high-priority', '.high { color: blue; }')
      expect(mockInsertFunction).toHaveBeenNthCalledWith(2, 'medium-priority', '.medium { color: green; }')
      expect(mockInsertFunction).toHaveBeenNthCalledWith(3, 'low-priority', '.low { color: red; }')
    })
  })

  describe('async mode', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      configureStyleProcessing({
        enableBatchUpdates: true,
        enableAsync: true,
        batchDelay: 16,
      })
    })

    it('should use setTimeout for async processing', () => {
      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(mockInsertFunction).not.toHaveBeenCalled()

      // 只需要 setTimeout 的延迟
      vi.advanceTimersByTime(16)

      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: red; }')
    })
  })

  describe('manual flush', () => {
    beforeEach(() => {
      configureStyleProcessing({ enableBatchUpdates: true, batchDelay: 100 })
    })

    it('should flush pending updates immediately', () => {
      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      batchUpdater.scheduleUpdate('other-class', '.other { color: blue; }')

      expect(batchUpdater.getPendingCount()).toBe(2)
      expect(mockInsertFunction).not.toHaveBeenCalled()

      batchUpdater.flushSync()

      expect(mockInsertFunction).toHaveBeenCalledTimes(2)
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should handle flush when no updates are pending', () => {
      batchUpdater.flushSync()

      expect(mockInsertFunction).not.toHaveBeenCalled()
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should not interfere with scheduled flush', () => {
      vi.useFakeTimers()

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      // 手动刷新
      batchUpdater.flushSync()
      expect(mockInsertFunction).toHaveBeenCalledTimes(1)

      // 添加新的更新
      batchUpdater.scheduleUpdate('new-class', '.new { color: blue; }')

      // 等待自动刷新
      vi.advanceTimersByTime(100)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledTimes(2)
    })
  })

  describe('performance monitoring integration', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      configureStyleProcessing({
        enableBatchUpdates: true,
        enablePerformanceMonitoring: true,
        batchDelay: 16,
      })
    })

    it('should log performance information when monitoring is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      batchUpdater.scheduleUpdate('class1', '.class1 { color: red; }')
      batchUpdater.scheduleUpdate('class2', '.class2 { color: blue; }')

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[vue-styled-components] Batch update completed: 2 updates'),
      )

      consoleSpy.mockRestore()
    })

    it('should not log when performance monitoring is disabled', () => {
      configureStyleProcessing({ enablePerformanceMonitoring: false })

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('insert function management', () => {
    it('should handle missing insert function gracefully', () => {
      batchUpdater.setInsertFunction(null as any)

      expect(() => {
        batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
        batchUpdater.flushSync()
      }).not.toThrow()
    })

    it('should allow changing insert function', () => {
      const newMockFunction = vi.fn()

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      batchUpdater.setInsertFunction(newMockFunction)
      batchUpdater.flushSync()

      expect(mockInsertFunction).not.toHaveBeenCalled()
      expect(newMockFunction).toHaveBeenCalledWith('test-class', '.test { color: red; }')
    })
  })

  describe('edge cases', () => {
    it('should handle empty className', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      batchUpdater.scheduleUpdate('', '.empty { color: red; }')

      expect(mockInsertFunction).toHaveBeenCalledWith('', '.empty { color: red; }')
    })

    it('should handle empty CSS string', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      batchUpdater.scheduleUpdate('test-class', '')

      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '')
    })

    it('should handle zero priority', () => {
      vi.useFakeTimers()
      configureStyleProcessing({ enableBatchUpdates: true })

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }', 0)

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: red; }')
    })

    it('should handle negative priority', () => {
      vi.useFakeTimers()
      configureStyleProcessing({ enableBatchUpdates: true })

      // 标记类为已渲染，这样更新会被批量处理
      batchUpdater.markAsRendered('low')
      batchUpdater.markAsRendered('high')

      batchUpdater.scheduleUpdate('low', '.low { color: red; }', -1)
      batchUpdater.scheduleUpdate('high', '.high { color: blue; }', 1)

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenNthCalledWith(1, 'high', '.high { color: blue; }')
      expect(mockInsertFunction).toHaveBeenNthCalledWith(2, 'low', '.low { color: red; }')
    })
  })

  describe('clear functionality', () => {
    it('should clear all pending updates', () => {
      configureStyleProcessing({ enableBatchUpdates: true })

      batchUpdater.scheduleUpdate('class1', '.class1 { color: red; }')
      batchUpdater.scheduleUpdate('class2', '.class2 { color: blue; }')

      expect(batchUpdater.getPendingCount()).toBe(2)

      batchUpdater.clear()

      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should prevent scheduled flush after clear', () => {
      vi.useFakeTimers()
      configureStyleProcessing({ enableBatchUpdates: true, batchDelay: 16 })

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      batchUpdater.clear()

      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).not.toHaveBeenCalled()
    })
  })

  describe('first render optimization', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      configureStyleProcessing({ enableBatchUpdates: true, batchDelay: 16 })
      batchUpdater.resetFirstRenderState()
    })

    it('should execute first render styles immediately even with batch updates enabled', () => {
      batchUpdater.scheduleUpdate('first-render-class', '.first { color: red; }')

      // 首次渲染应该立即执行，不需要等待
      expect(mockInsertFunction).toHaveBeenCalledWith('first-render-class', '.first { color: red; }')
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should batch subsequent updates for the same class', () => {
      // 首次渲染
      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      expect(mockInsertFunction).toHaveBeenCalledTimes(1)

      // 后续更新应该被批量处理
      batchUpdater.scheduleUpdate('test-class', '.test { color: blue; }')
      expect(mockInsertFunction).toHaveBeenCalledTimes(1) // 仍然是1次
      expect(batchUpdater.getPendingCount()).toBe(1)

      // 等待批量更新执行
      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledTimes(2)
      expect(mockInsertFunction).toHaveBeenLastCalledWith('test-class', '.test { color: blue; }')
    })

    it('should prioritize first render styles in batch updates', () => {
      // 先添加一个已渲染的类的更新
      batchUpdater.markAsRendered('already-rendered')
      batchUpdater.scheduleUpdate('already-rendered', '.already { color: green; }')

      // 再添加一个首次渲染的类
      batchUpdater.resetFirstRenderState()
      batchUpdater.scheduleUpdate('first-render', '.first { color: red; }')

      // 首次渲染应该立即执行
      expect(mockInsertFunction).toHaveBeenCalledWith('first-render', '.first { color: red; }')

      // 等待批量更新执行已渲染的类
      vi.advanceTimersByTime(16)
      vi.runAllTimers()

      expect(mockInsertFunction).toHaveBeenCalledWith('already-rendered', '.already { color: green; }')
    })

    it('should track rendered classes correctly', () => {
      expect(batchUpdater.isFirstRender('new-class')).toBe(true)

      batchUpdater.scheduleUpdate('new-class', '.new { color: red; }')

      expect(batchUpdater.isFirstRender('new-class')).toBe(false)
    })

    it('should allow manual marking of rendered classes', () => {
      expect(batchUpdater.isFirstRender('manual-class')).toBe(true)

      batchUpdater.markAsRendered('manual-class')

      expect(batchUpdater.isFirstRender('manual-class')).toBe(false)

      // 现在这个类的更新应该被批量处理
      batchUpdater.scheduleUpdate('manual-class', '.manual { color: red; }')
      expect(mockInsertFunction).not.toHaveBeenCalled()
      expect(batchUpdater.getPendingCount()).toBe(1)
    })

    it('should reset first render state correctly', () => {
      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')
      expect(batchUpdater.isFirstRender('test-class')).toBe(false)

      batchUpdater.resetFirstRenderState()
      expect(batchUpdater.isFirstRender('test-class')).toBe(true)

      // 重置后，相同类名的更新应该被视为首次渲染
      batchUpdater.scheduleUpdate('test-class', '.test { color: blue; }')
      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: blue; }')
    })

    it('should handle multiple first render classes simultaneously', () => {
      batchUpdater.scheduleUpdate('class1', '.class1 { color: red; }')
      batchUpdater.scheduleUpdate('class2', '.class2 { color: blue; }')
      batchUpdater.scheduleUpdate('class3', '.class3 { color: green; }')

      // 所有首次渲染的类都应该立即执行
      expect(mockInsertFunction).toHaveBeenCalledTimes(3)
      expect(mockInsertFunction).toHaveBeenNthCalledWith(1, 'class1', '.class1 { color: red; }')
      expect(mockInsertFunction).toHaveBeenNthCalledWith(2, 'class2', '.class2 { color: blue; }')
      expect(mockInsertFunction).toHaveBeenNthCalledWith(3, 'class3', '.class3 { color: green; }')
      expect(batchUpdater.getPendingCount()).toBe(0)
    })

    it('should respect batch updates disabled setting for first render', () => {
      configureStyleProcessing({ enableBatchUpdates: false })

      batchUpdater.scheduleUpdate('test-class', '.test { color: red; }')

      expect(mockInsertFunction).toHaveBeenCalledWith('test-class', '.test { color: red; }')
      expect(batchUpdater.getPendingCount()).toBe(0)
    })
  })
})
