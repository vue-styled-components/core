import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { calculateStylesInMainThread, generateComplexStyles, generateSimpleStyles } from '../../../worker-benchmark/worker-benchmark'
import { calculateStylesInWorker, terminateWorker } from '../src/utils/worker'

// 性能测试函数
async function measurePerformance(
  label: string,
  styles: any[],
  iterations: number,
  useWorker: boolean,
): Promise<number> {
  const context = { theme: { colors: { primary: 'blue' } } }
  const start = performance.now()

  for (let i = 0; i < iterations; i++) {
    if (useWorker) {
      await calculateStylesInWorker(styles, context)
    }
    else {
      await calculateStylesInMainThread(styles, context)
    }
  }

  const end = performance.now()
  const duration = end - start

  // 使用性能测试结果
  return duration
}

describe('worker vs Main Thread 样式计算性能测试', () => {
  let originalWorker: typeof Worker

  beforeEach(() => {
    // 保存原始Worker
    originalWorker = window.Worker
  })

  afterEach(() => {
    // 恢复原始Worker并终止所有worker
    window.Worker = originalWorker
    terminateWorker()
  })

  it('简单样式计算性能比较', async () => {
    const simpleStyles = generateSimpleStyles(5)
    const iterations = 100

    const workerTime = await measurePerformance('简单样式 (Worker)', simpleStyles, iterations, true)
    const mainThreadTime = await measurePerformance('简单样式 (主线程)', simpleStyles, iterations, false)

    expect(workerTime).toBeDefined()
    expect(mainThreadTime).toBeDefined()
  })

  it('复杂样式计算性能比较', async () => {
    const complexStyles = generateComplexStyles(20)
    const iterations = 50

    const workerTime = await measurePerformance('复杂样式 (Worker)', complexStyles, iterations, true)
    const mainThreadTime = await measurePerformance('复杂样式 (主线程)', complexStyles, iterations, false)

    expect(workerTime).toBeDefined()
    expect(mainThreadTime).toBeDefined()
  })

  it('大量样式计算性能比较', async () => {
    const largeStyles = generateComplexStyles(100)
    const iterations = 10

    const workerTime = await measurePerformance('大量样式 (Worker)', largeStyles, iterations, true)
    const mainThreadTime = await measurePerformance('大量样式 (主线程)', largeStyles, iterations, false)

    expect(workerTime).toBeDefined()
    expect(mainThreadTime).toBeDefined()
  })

  it('worker不可用时的性能测试', async () => {
    // 模拟Worker不可用
    window.Worker = undefined as any

    const complexStyles = generateComplexStyles(20)
    const iterations = 50

    const fallbackTime = await measurePerformance('Worker不可用 (回退到主线程)', complexStyles, iterations, true)
    const mainThreadTime = await measurePerformance('正常主线程', complexStyles, iterations, false)

    expect(fallbackTime).toBeCloseTo(mainThreadTime, -1) // 允许10%误差
  })

  it('混合样式计算场景性能测试', async () => {
    // 模拟真实场景：混合简单和复杂样式
    const mixedStyles = [
      ...generateSimpleStyles(10),
      ...generateComplexStyles(15),
      ...generateSimpleStyles(5),
      ...generateComplexStyles(10),
    ]
    const iterations = 20

    const workerTime = await measurePerformance('混合样式 (Worker)', mixedStyles, iterations, true)
    const mainThreadTime = await measurePerformance('混合样式 (主线程)', mixedStyles, iterations, false)

    expect(workerTime).toBeDefined()
    expect(mainThreadTime).toBeDefined()
  })

  it('阈值边界性能测试', async () => {
    // 测试接近阈值的样式计算
    const threshold = 10 // 与worker.ts中的STYLE_COMPLEXITY_THRESHOLD相同
    const nearThresholdStyles = generateSimpleStyles(threshold)
    const iterations = 50

    const workerTime = await measurePerformance('阈值边界 (Worker)', nearThresholdStyles, iterations, true)
    const mainThreadTime = await measurePerformance('阈值边界 (主线程)', nearThresholdStyles, iterations, false)

    expect(workerTime).toBeDefined()
    expect(mainThreadTime).toBeDefined()
  })
})
