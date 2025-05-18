/**
 * 样式计算Web Worker相关工具函数
 */

// 全局Worker实例
let styleWorker: Worker | null = null
// 等待处理的样式计算任务队列
const pendingTasks: Map<string, (result: any) => void> = new Map()
// 是否支持Web Worker
const isWorkerSupported = typeof Worker !== 'undefined'
// 样式计算最小阈值，避免简单计算创建Worker反而降低性能
const STYLE_COMPLEXITY_THRESHOLD = 10 // 可根据实际性能测试调整

/**
 * 创建样式计算的Web Worker
 */
function createStyleWorker(): Worker | null {
  if (!isWorkerSupported)
    return null

  try {
    // 使用Blob URL创建内联Worker，避免额外的网络请求
    const workerCode = `
      self.onmessage = function(e) {
        const { id, cssWithExpression, context } = e.data;
        
        // Worker中的样式处理逻辑
        function applyExpressions(chunks, executionContext, tailwindClasses = []) {
          return chunks.reduce((ruleSet, chunk) => {
            if (chunk === undefined || chunk === null || chunk === false || chunk === '') {
              return ruleSet;
            }
            
            if (Array.isArray(chunk)) {
              return [...ruleSet, ...applyExpressions(chunk, executionContext, tailwindClasses)];
            }
            
            if (typeof chunk === 'function') {
              return ruleSet.concat(...applyExpressions([chunk(executionContext)], executionContext, tailwindClasses));
            }
            
            if (typeof chunk === 'object' && chunk?.source === 'tw') {
              tailwindClasses.push(...chunk.value);
              return ruleSet;
            }
            
            // 简化的组件类名处理，真实场景需调整
            if (typeof chunk === 'object' && chunk?.custom?.className) {
              return ruleSet.concat(\`.\${chunk.custom.className}\`);
            }
            
            return ruleSet.concat(String(chunk));
          }, []);
        }
        
        // 执行样式计算
        try {
          const tailwindClasses = [];
          const result = applyExpressions(cssWithExpression, context, tailwindClasses);
          
          // 返回计算结果
          self.postMessage({
            id,
            success: true,
            result,
            tailwindClasses
          });
        } catch (error) {
          self.postMessage({
            id,
            success: false,
            error: error.message
          });
        }
      };
    `

    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)

    const worker = new Worker(workerUrl)

    worker.onmessage = function (e) {
      const { id, success, result, error, tailwindClasses } = e.data
      const resolve = pendingTasks.get(id)

      if (resolve) {
        if (success) {
          resolve({ result, tailwindClasses })
        }
        else {
          console.error('Style calculation error in worker:', error)
          resolve({ result: [], tailwindClasses: [] })
        }
        pendingTasks.delete(id)
      }
    }

    worker.onerror = function (error) {
      console.error('Web Worker error:', error)
      // 如果Worker出错，清除所有任务
      for (const [id, resolve] of pendingTasks.entries()) {
        resolve({ result: [], tailwindClasses: [] })
        pendingTasks.delete(id)
      }

      // 关闭并移除Worker引用
      terminateWorker()
    }

    return worker
  }
  catch (error) {
    console.error('Failed to create style worker:', error)
    return null
  }
}

/**
 * 终止Worker并释放资源
 */
export function terminateWorker(): void {
  if (styleWorker) {
    styleWorker.terminate()
    styleWorker = null
  }
}

/**
 * 判断样式计算复杂度是否值得使用Worker
 * @param cssWithExpression 样式表达式
 */
function isComplexEnoughForWorker(cssWithExpression: any[]): boolean {
  // 样式表达式数量超过阈值才使用Worker
  return cssWithExpression.length > STYLE_COMPLEXITY_THRESHOLD
}

/**
 * 在Worker中执行样式计算
 * @param cssWithExpression 样式表达式
 * @param context 执行上下文
 * @returns Promise，解析为计算结果
 */
export function calculateStylesInWorker(
  cssWithExpression: any[],
  context: Record<string, any>,
): Promise<{ result: string[], tailwindClasses: string[] }> {
  // 如果不支持Worker或样式不够复杂，直接返回空结果，让主线程处理
  if (!isWorkerSupported || !isComplexEnoughForWorker(cssWithExpression)) {
    return Promise.resolve({ result: [], tailwindClasses: [] })
  }

  // 延迟创建Worker，直到真正需要时
  if (!styleWorker) {
    styleWorker = createStyleWorker()

    // 如果创建失败，返回空结果
    if (!styleWorker) {
      return Promise.resolve({ result: [], tailwindClasses: [] })
    }
  }

  return new Promise((resolve) => {
    // 生成唯一任务ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // 存储任务回调
    pendingTasks.set(taskId, resolve)

    // 创建适合传输到Worker的数据
    // 过滤掉不可序列化的内容，例如函数引用等
    const serializableContext = { ...context }
    const serializableCssExpressions = cssWithExpression.map((expr) => {
      if (typeof expr === 'function') {
        // 转换函数为字符串，在Worker中会重新处理
        return { type: 'function', source: expr.toString() }
      }
      return expr
    })

    // 发送任务到Worker
    if (styleWorker) {
      styleWorker.postMessage({
        id: taskId,
        cssWithExpression: serializableCssExpressions,
        context: serializableContext,
      })
    }

    // 设置超时，防止Worker长时间无响应
    setTimeout(() => {
      if (pendingTasks.has(taskId)) {
        console.warn('Style calculation timeout in worker')
        resolve({ result: [], tailwindClasses: [] })
        pendingTasks.delete(taskId)
      }
    }, 2000) // 2秒超时
  })
}
