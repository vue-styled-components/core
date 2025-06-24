import { getStyleConfig } from '../config'

interface UpdateTask {
  id: string
  className: string
  cssString: string
  priority: number
  isFirstRender?: boolean
}

class BatchUpdater {
  private pendingUpdates = new Map<string, UpdateTask>()
  private isUpdateScheduled = false
  private updateId = 0
  private renderedClasses = new Set<string>()
  private firstRenderThreshold = 100 // 100ms内认为是首次渲染

  /**
   * 调度样式更新
   */
  scheduleUpdate(
    className: string,
    cssString: string,
    priority: number = 0,
  ): void {
    const config = getStyleConfig()

    // 检测是否为首次渲染
    const isFirstRender = !this.renderedClasses.has(className)

    // 如果未启用批量更新或是首次渲染，立即执行
    if (!config.enableBatchUpdates || isFirstRender) {
      this.executeUpdate(className, cssString)
      this.renderedClasses.add(className)
      return
    }

    const taskId = `${className}-${++this.updateId}`

    // 如果已有相同className的更新，替换它
    const existingTaskId = Array.from(this.pendingUpdates.keys())
      .find(id => this.pendingUpdates.get(id)?.className === className)

    if (existingTaskId) {
      this.pendingUpdates.delete(existingTaskId)
    }

    this.pendingUpdates.set(taskId, {
      id: taskId,
      className,
      cssString,
      priority,
      isFirstRender,
    })

    if (!this.isUpdateScheduled) {
      this.scheduleFlush()
    }
  }

  /**
   * 调度批量刷新
   */
  private scheduleFlush(): void {
    this.isUpdateScheduled = true
    const config = getStyleConfig()

    if (config.enableAsync) {
      // 使用 setTimeout 实现异步处理
      setTimeout(() => this.flush(), config.batchDelay)
    }
    else {
      // 使用 requestAnimationFrame 在下一帧执行
      requestAnimationFrame(() => {
        setTimeout(() => this.flush(), config.batchDelay)
      })
    }
  }

  /**
   * 执行批量更新
   */
  private flush(): void {
    if (this.pendingUpdates.size === 0) {
      this.isUpdateScheduled = false
      return
    }

    const config = getStyleConfig()
    let startTime: number | undefined

    if (config.enablePerformanceMonitoring) {
      startTime = performance.now()
    }

    // 按优先级排序更新任务，首次渲染优先
    const tasks = Array.from(this.pendingUpdates.values())
      .sort((a, b) => {
        // 首次渲染的样式优先级最高
        if (a.isFirstRender && !b.isFirstRender)
          return -1
        if (!a.isFirstRender && b.isFirstRender)
          return 1
        // 其次按优先级排序
        return b.priority - a.priority
      })

    // 执行所有更新
    for (const task of tasks) {
      this.executeUpdate(task.className, task.cssString)
      this.renderedClasses.add(task.className)
    }

    if (config.enablePerformanceMonitoring && startTime !== undefined) {
      const duration = performance.now() - startTime
      /* eslint-disable-next-line no-console */
      console.debug(`[vue-styled-components] Batch update completed: ${tasks.length} updates in ${duration.toFixed(2)}ms`)
    }

    // 清空待处理的更新
    this.pendingUpdates.clear()
    this.isUpdateScheduled = false
  }

  /**
   * 执行单个样式更新
   */
  private executeUpdate(className: string, cssString: string): void {
    // 这里会调用原有的 insert 函数逻辑
    // 为了避免循环依赖，我们将在 styleManagement.ts 中注入这个函数
    if (this.insertFunction) {
      this.insertFunction(className, cssString)
    }
  }

  private insertFunction: ((className: string, cssString: string) => void) | null = null

  /**
   * 设置插入函数（由 styleManagement.ts 调用）
   */
  setInsertFunction(fn: (className: string, cssString: string) => void): void {
    this.insertFunction = fn
  }

  /**
   * 立即刷新所有待处理的更新
   */
  flushSync(): void {
    if (this.isUpdateScheduled) {
      this.flush()
    }
  }

  /**
   * 获取待处理更新的数量
   */
  getPendingCount(): number {
    return this.pendingUpdates.size
  }

  /**
   * 清空所有待处理的更新
   */
  clear(): void {
    this.pendingUpdates.clear()
    this.isUpdateScheduled = false
  }

  /**
   * 重置首次渲染状态（用于测试或页面刷新）
   */
  resetFirstRenderState(): void {
    this.renderedClasses.clear()
  }

  /**
   * 标记类名为已渲染（用于手动控制）
   */
  markAsRendered(className: string): void {
    this.renderedClasses.add(className)
  }

  /**
   * 检查是否为首次渲染
   */
  isFirstRender(className: string): boolean {
    return !this.renderedClasses.has(className)
  }
}

export const batchUpdater = new BatchUpdater()
