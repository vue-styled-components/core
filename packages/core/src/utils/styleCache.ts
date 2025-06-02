import type { ExpressionType } from './insertExpressions'
import { toRaw } from 'vue'
import { getStyleConfig } from '../config'

interface CacheEntry {
  css: string
  tailwindClasses: string[]
  timestamp: number
  hitCount: number
}

class StyleCache {
  private cache = new Map<string, CacheEntry>()
  private accessOrder: string[] = []

  /**
   * 生成缓存键
   */
  private generateCacheKey<T>(
    cssWithExpression: ExpressionType<T>[],
    context: Record<string, any>,
    className?: string,
  ): string {
    // 创建一个稳定的键，基于表达式、上下文和类名
    const expressionStr = JSON.stringify(cssWithExpression, (key, value) => {
      if (typeof value === 'function') {
        return value.toString()
      }
      return value
    })

    const contextStr = JSON.stringify(toRaw(context))
    const classNameStr = className || ''
    const rawKey = `${classNameStr}:${expressionStr}:${contextStr}`

    // 移除空格、换行符、制表符等可能影响缓存一致性的字符
    return rawKey.replace(/\s+/g, '')
  }

  /**
   * 获取缓存的样式
   */
  get<T>(
    cssWithExpression: ExpressionType<T>[],
    context: Record<string, any>,
    className?: string,
  ): { css: string, tailwindClasses: string[] } | null {
    const config = getStyleConfig()
    if (!config.enableCache)
      return null

    const key = this.generateCacheKey(cssWithExpression, context, className)

    const entry = this.cache.get(key)

    // console.log('===============')

    // console.log('get cache', key)

    // console.log('get cache', context, entry)

    // console.log('===============')

    if (entry) {
      // 更新访问统计
      entry.hitCount++
      entry.timestamp = Date.now()

      // 更新访问顺序
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
      this.accessOrder.push(key)

      return {
        css: entry.css,
        tailwindClasses: [...entry.tailwindClasses],
      }
    }

    return null
  }

  /**
   * 设置缓存
   */
  set<T>(
    cssWithExpression: ExpressionType<T>[],
    context: Record<string, any>,
    css: string,
    tailwindClasses: string[],
    className?: string,
  ): void {
    const config = getStyleConfig()
    if (!config.enableCache)
      return

    const key = this.generateCacheKey(cssWithExpression, context, className)

    // 检查缓存大小限制
    if (this.cache.size >= config.cacheSize) {
      this.evictLeastRecentlyUsed()
    }

    // console.log('===============')
    // console.log('set cache', key)
    // console.log('set cache', context.theme, css, tailwindClasses)
    // console.log('===============')

    this.cache.set(key, {
      css,
      tailwindClasses: [...tailwindClasses],
      timestamp: Date.now(),
      hitCount: 0,
    })

    this.accessOrder.push(key)
  }

  /**
   * 清除最近最少使用的缓存项
   */
  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length === 0)
      return

    const keyToRemove = this.accessOrder.shift()!
    this.cache.delete(keyToRemove)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const entries = Array.from(this.cache.values())
    return {
      size: this.cache.size,
      totalHits: entries.reduce((sum, entry) => sum + entry.hitCount, 0),
      averageHits: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.hitCount, 0) / entries.length : 0,
    }
  }
}

export const styleCache = new StyleCache()
