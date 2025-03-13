/**
 * 性能跟踪工具
 * 用于监控和记录代码执行性能
 */
import { getConfigOption } from './config'
import { logDebug } from './error-handler'

// 存储性能记录
const perfRecords: Record<string, {
  counts: number
  totalTime: number
  minTime: number
  maxTime: number
  lastStart?: number
}> = {}

/**
 * 开始计时
 * @param name 计时器名称
 */
export function startTimer(name: string): void {
  if (!getConfigOption('enablePerfTracking'))
    return

  // 创建或获取性能记录
  if (!perfRecords[name]) {
    perfRecords[name] = {
      counts: 0,
      totalTime: 0,
      minTime: Number.MAX_SAFE_INTEGER,
      maxTime: 0,
    }
  }

  // 记录开始时间
  perfRecords[name].lastStart = performance.now()
}

/**
 * 结束计时并记录结果
 * @param name 计时器名称
 */
export function endTimer(name: string): number {
  if (!getConfigOption('enablePerfTracking'))
    return 0

  const record = perfRecords[name]
  if (!record || record.lastStart === undefined) {
    logDebug(`计时器 ${name} 未找到或未启动`)
    return 0
  }

  // 计算执行时间
  const end = performance.now()
  const duration = end - record.lastStart

  // 更新统计信息
  record.counts++
  record.totalTime += duration
  record.minTime = Math.min(record.minTime, duration)
  record.maxTime = Math.max(record.maxTime, duration)
  record.lastStart = undefined

  return duration
}

/**
 * 获取性能摘要
 */
export function getPerfSummary(): Record<string, {
  counts: number
  totalTime: number
  avgTime: number
  minTime: number
  maxTime: number
}> {
  const summary: Record<string, {
    counts: number
    totalTime: number
    avgTime: number
    minTime: number
    maxTime: number
  }> = {}

  Object.entries(perfRecords).forEach(([name, record]) => {
    summary[name] = {
      counts: record.counts,
      totalTime: record.totalTime,
      avgTime: record.counts > 0 ? record.totalTime / record.counts : 0,
      minTime: record.minTime === Number.MAX_SAFE_INTEGER ? 0 : record.minTime,
      maxTime: record.maxTime,
    }
  })

  return summary
}

/**
 * 性能计时装饰器
 * @param target 目标类
 * @param methodName 方法名
 * @param descriptor 属性描述符
 */
export function measure(name?: string) {
  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value
    const timerName = name || `${target.constructor.name}.${methodName}`

    descriptor.value = function (...args: any[]) {
      if (!getConfigOption('enablePerfTracking')) {
        return originalMethod.apply(this, args)
      }

      startTimer(timerName)
      try {
        return originalMethod.apply(this, args)
      }
      finally {
        const duration = endTimer(timerName)
        logDebug(`${timerName}: ${duration.toFixed(2)}ms`)
      }
    }

    return descriptor
  }
}

/**
 * 性能计时高阶函数
 * @param fn 要测量的函数
 * @param name 计时器名称
 */
export function measureFunction<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
): T {
  if (!getConfigOption('enablePerfTracking')) {
    return fn
  }

  return ((...args: Parameters<T>): ReturnType<T> => {
    startTimer(name)
    try {
      return fn(...args) as ReturnType<T>
    }
    finally {
      const duration = endTimer(name)
      logDebug(`${name}: ${duration.toFixed(2)}ms`)
    }
  }) as T
}

/**
 * 重置所有性能记录
 */
export function resetPerfRecords(): void {
  Object.keys(perfRecords).forEach((key) => {
    delete perfRecords[key]
  })
}
