/* eslint-disable no-console */

import { getStyleConfig } from '../config'

interface PerformanceMetrics {
  totalStyleCalculations: number
  totalCacheHits: number
  totalCacheMisses: number
  averageCalculationTime: number
  maxCalculationTime: number
  minCalculationTime: number
  batchUpdateCount: number
  averageBatchSize: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalStyleCalculations: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    averageCalculationTime: 0,
    maxCalculationTime: 0,
    minCalculationTime: Infinity,
    batchUpdateCount: 0,
    averageBatchSize: 0,
  }

  private calculationTimes: number[] = []
  private batchSizes: number[] = []

  /**
   * 记录样式计算开始
   */
  startStyleCalculation(): () => void {
    const config = getStyleConfig()
    if (!config.enablePerformanceMonitoring) {
      return () => {}
    }

    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordCalculationTime(duration)
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    const config = getStyleConfig()
    if (!config.enablePerformanceMonitoring)
      return

    this.metrics.totalCacheHits++
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    const config = getStyleConfig()
    if (!config.enablePerformanceMonitoring)
      return

    this.metrics.totalCacheMisses++
  }

  /**
   * 记录批量更新
   */
  recordBatchUpdate(batchSize: number): void {
    const config = getStyleConfig()
    if (!config.enablePerformanceMonitoring)
      return

    this.metrics.batchUpdateCount++
    this.batchSizes.push(batchSize)
    this.metrics.averageBatchSize = this.batchSizes.reduce((a, b) => a + b, 0) / this.batchSizes.length
  }

  /**
   * 记录计算时间
   */
  private recordCalculationTime(duration: number): void {
    this.metrics.totalStyleCalculations++
    this.calculationTimes.push(duration)

    // 更新统计信息
    this.metrics.averageCalculationTime = this.calculationTimes.reduce((a, b) => a + b, 0) / this.calculationTimes.length
    this.metrics.maxCalculationTime = Math.max(this.metrics.maxCalculationTime, duration)
    this.metrics.minCalculationTime = Math.min(this.metrics.minCalculationTime, duration)

    // 保持最近1000次计算的记录
    if (this.calculationTimes.length > 1000) {
      this.calculationTimes = this.calculationTimes.slice(-1000)
    }

    // 保持最近100次批量更新的记录
    if (this.batchSizes.length > 100) {
      this.batchSizes = this.batchSizes.slice(-100)
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics & {
    cacheHitRate: number
    recentCalculationTimes: number[]
  } {
    const totalCacheAccess = this.metrics.totalCacheHits + this.metrics.totalCacheMisses
    const cacheHitRate = totalCacheAccess > 0 ? this.metrics.totalCacheHits / totalCacheAccess : 0
    return {
      ...this.metrics,
      cacheHitRate,
      recentCalculationTimes: [...this.calculationTimes.slice(-10)], // 最近10次计算时间
    }
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.metrics = {
      totalStyleCalculations: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      averageCalculationTime: 0,
      maxCalculationTime: 0,
      minCalculationTime: Infinity,
      batchUpdateCount: 0,
      averageBatchSize: 0,
    }
    this.calculationTimes = []
    this.batchSizes = []
  }

  /**
   * 打印性能报告
   */
  printReport(): void {
    const config = getStyleConfig()
    if (!config.enablePerformanceMonitoring) {
      console.warn('[vue-styled-components] Performance monitoring is disabled')
      return
    }

    const metrics = this.getMetrics()

    console.group('[vue-styled-components] Performance Report')
    console.log(`Total style calculations: ${metrics.totalStyleCalculations}`)
    console.log(`Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`)
    console.log(`Average calculation time: ${metrics.averageCalculationTime.toFixed(2)}ms`)
    console.log(`Max calculation time: ${metrics.maxCalculationTime.toFixed(2)}ms`)
    console.log(`Min calculation time: ${metrics.minCalculationTime === Infinity ? 'N/A' : metrics.minCalculationTime.toFixed(2)}ms`)
    console.log(`Batch updates: ${metrics.batchUpdateCount}`)
    console.log(`Average batch size: ${metrics.averageBatchSize.toFixed(2)}`)
    console.groupEnd()
  }

  /**
   * 获取性能建议
   */
  getRecommendations(): string[] {
    const metrics = this.getMetrics()
    const recommendations: string[] = []

    if (metrics.cacheHitRate < 0.5) {
      recommendations.push('考虑增加缓存大小或检查是否有过多的动态样式')
    }

    if (metrics.averageCalculationTime > 5) {
      recommendations.push('样式计算时间较长，考虑启用异步处理或简化样式表达式')
    }

    if (metrics.averageBatchSize < 2 && metrics.batchUpdateCount > 0) {
      recommendations.push('批量更新效果不明显，可以考虑调整批量延迟时间')
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好！')
    }

    return recommendations
  }
}

export const performanceMonitor = new PerformanceMonitor()
