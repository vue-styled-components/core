import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { configureStyleProcessing, resetStyleConfig } from '../src/config'
import { styleCache } from '../src/utils/styleCache'

describe('styleCache', () => {
  beforeEach(() => {
    resetStyleConfig()
    styleCache.clear()
  })

  afterEach(() => {
    resetStyleConfig()
    styleCache.clear()
  })

  describe('cache operations', () => {
    it('should set and get cache entries', () => {
      const expressions = ['color: red;', 'font-size: 16px;']
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; font-size: 16px; }'
      const tailwindClasses = ['text-red-500', 'text-base']
      const className = 'test-class'

      styleCache.set(expressions, context, css, tailwindClasses, className)

      const result = styleCache.get(expressions, context, className)
      expect(result).not.toBeNull()
      expect(result!.css).toBe(css)
      expect(result!.tailwindClasses).toEqual(tailwindClasses)
    })

    it('should return null for cache miss', () => {
      const expressions = ['color: red;']
      const context = { theme: { primary: 'blue' } }

      const result = styleCache.get(expressions, context)
      expect(result).toBeNull()
    })

    it('should return null when cache is disabled', () => {
      configureStyleProcessing({ enableCache: false })

      const expressions = ['color: red;']
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, context, css, tailwindClasses)
      const result = styleCache.get(expressions, context)

      expect(result).toBeNull()
    })

    it('should not set cache when cache is disabled', () => {
      configureStyleProcessing({ enableCache: false })

      const expressions = ['color: red;']
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, context, css, tailwindClasses)

      // 重新启用缓存后检查
      configureStyleProcessing({ enableCache: true })
      const result = styleCache.get(expressions, context)

      expect(result).toBeNull()
    })
  })

  describe('cache key generation', () => {
    it('should generate different keys for different expressions', () => {
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(['color: red;'], context, css, tailwindClasses)
      styleCache.set(['color: blue;'], context, css, tailwindClasses)

      const result1 = styleCache.get(['color: red;'], context)
      const result2 = styleCache.get(['color: blue;'], context)

      expect(result1).not.toBeNull()
      expect(result2).not.toBeNull()
    })

    it('should generate different keys for different contexts', () => {
      const expressions = ['color: red;']
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, { theme: { primary: 'blue' } }, css, tailwindClasses)
      styleCache.set(expressions, { theme: { primary: 'red' } }, css, tailwindClasses)

      const result1 = styleCache.get(expressions, { theme: { primary: 'blue' } })
      const result2 = styleCache.get(expressions, { theme: { primary: 'red' } })

      expect(result1).not.toBeNull()
      expect(result2).not.toBeNull()
    })

    it('should generate different keys for different class names', () => {
      const expressions = ['color: red;']
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, context, css, tailwindClasses, 'class1')
      styleCache.set(expressions, context, css, tailwindClasses, 'class2')

      const result1 = styleCache.get(expressions, context, 'class1')
      const result2 = styleCache.get(expressions, context, 'class2')

      expect(result1).not.toBeNull()
      expect(result2).not.toBeNull()
    })

    it('should handle function expressions in key generation', () => {
      const expressions = [() => 'color: red;']
      const context = { theme: { primary: 'blue' } }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, context, css, tailwindClasses)
      const result = styleCache.get(expressions, context)

      expect(result).not.toBeNull()
    })
  })

  describe('lRU eviction', () => {
    it('should evict least recently used items when cache is full', () => {
      configureStyleProcessing({ cacheSize: 2 })

      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      // 添加第一个缓存项
      styleCache.set(['style1'], context, css, tailwindClasses)
      // 添加第二个缓存项
      styleCache.set(['style2'], context, css, tailwindClasses)
      // 添加第三个缓存项，应该淘汰第一个
      styleCache.set(['style3'], context, css, tailwindClasses)

      const result1 = styleCache.get(['style1'], context)
      const result2 = styleCache.get(['style2'], context)
      const result3 = styleCache.get(['style3'], context)

      expect(result1).toBeNull() // 被淘汰
      expect(result2).not.toBeNull()
      expect(result3).not.toBeNull()
    })

    it('should update access order when getting cached items', () => {
      configureStyleProcessing({ cacheSize: 2 })

      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      // 添加两个缓存项
      styleCache.set(['style1'], context, css, tailwindClasses)
      styleCache.set(['style2'], context, css, tailwindClasses)

      // 访问第一个缓存项，更新其访问顺序
      styleCache.get(['style1'], context)

      // 添加第三个缓存项，应该淘汰第二个（最少使用的）
      styleCache.set(['style3'], context, css, tailwindClasses)

      const result1 = styleCache.get(['style1'], context)
      const result2 = styleCache.get(['style2'], context)
      const result3 = styleCache.get(['style3'], context)

      expect(result1).not.toBeNull() // 最近访问过，不被淘汰
      expect(result2).toBeNull() // 被淘汰
      expect(result3).not.toBeNull()
    })
  })

  describe('cache statistics', () => {
    it('should track cache size', () => {
      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(['style1'], context, css, tailwindClasses)
      styleCache.set(['style2'], context, css, tailwindClasses)

      const stats = styleCache.getStats()
      expect(stats.size).toBe(2)
    })

    it('should track hit counts', () => {
      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(['style1'], context, css, tailwindClasses)

      // 多次访问同一缓存项
      styleCache.get(['style1'], context)
      styleCache.get(['style1'], context)
      styleCache.get(['style1'], context)

      const stats = styleCache.getStats()
      expect(stats.totalHits).toBe(3)
    })

    it('should calculate average hits correctly', () => {
      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(['style1'], context, css, tailwindClasses)
      styleCache.set(['style2'], context, css, tailwindClasses)

      // style1 访问3次，style2 访问1次
      styleCache.get(['style1'], context)
      styleCache.get(['style1'], context)
      styleCache.get(['style1'], context)
      styleCache.get(['style2'], context)

      const stats = styleCache.getStats()
      expect(stats.averageHits).toBe(2) // (3 + 1) / 2 = 2
    })

    it('should handle empty cache statistics', () => {
      const stats = styleCache.getStats()
      expect(stats.size).toBe(0)
      expect(stats.totalHits).toBe(0)
      expect(stats.averageHits).toBe(0)
    })
  })

  describe('cache clearing', () => {
    it('should clear all cache entries', () => {
      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(['style1'], context, css, tailwindClasses)
      styleCache.set(['style2'], context, css, tailwindClasses)

      expect(styleCache.getStats().size).toBe(2)

      styleCache.clear()

      expect(styleCache.getStats().size).toBe(0)
      expect(styleCache.get(['style1'], context)).toBeNull()
      expect(styleCache.get(['style2'], context)).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined className', () => {
      const expressions = ['color: red;']
      const context = { theme: {} }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, context, css, tailwindClasses)
      const result = styleCache.get(expressions, context)

      expect(result).not.toBeNull()
    })

    it('should handle empty expressions array', () => {
      const expressions: string[] = []
      const context = { theme: {} }
      const css = ''
      const tailwindClasses: string[] = []

      styleCache.set(expressions, context, css, tailwindClasses)
      const result = styleCache.get(expressions, context)

      expect(result).not.toBeNull()
      expect(result!.css).toBe('')
      expect(result!.tailwindClasses).toEqual([])
    })

    it('should handle complex context objects', () => {
      const expressions = ['color: red;']
      const context = {
        theme: {
          colors: { primary: 'blue', secondary: 'green' },
          spacing: { sm: '8px', md: '16px' },
        },
        props: { variant: 'primary', size: 'large' },
      }
      const css = '.test { color: red; }'
      const tailwindClasses = ['text-red-500']

      styleCache.set(expressions, context, css, tailwindClasses)
      const result = styleCache.get(expressions, context)

      expect(result).not.toBeNull()
    })

    it('should return deep copy of tailwindClasses to prevent mutation', () => {
      const expressions = ['color: red;']
      const context = { theme: {} }
      const css = '.test { color: red; }'
      const originalTailwindClasses = ['text-red-500', 'font-bold']

      styleCache.set(expressions, context, css, originalTailwindClasses)
      const result = styleCache.get(expressions, context)

      expect(result).not.toBeNull()

      // 修改返回的数组不应该影响缓存中的原始数组
      result!.tailwindClasses.push('new-class')

      const result2 = styleCache.get(expressions, context)
      expect(result2!.tailwindClasses).toEqual(originalTailwindClasses)
    })
  })
})
