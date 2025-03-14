import type { TransformResult } from './types/types'
import { endTimer, ErrorType, handleError, startTimer, transformCore } from './utils'

/**
 * 转换Vue SFC中的styled组件
 *
 * @param code 原始代码
 * @param id 文件ID
 * @returns 转换结果，如果没有变化则为null
 */
export function transformVueSFC(code: string, id: string): TransformResult | null {
  // 开始整体转换计时
  startTimer('transformVueSFC')

  try {
    // 仅处理Vue文件
    if (!id.endsWith('.vue')) {
      endTimer('transformVueSFC')
      return null
    }

    // 提取script部分
    startTimer('extractScript')
    const scriptMatch = /<script\s+(?:\S.*?)??lang=["']ts["'].*?>([\s\S]*?)<\/script>/i.exec(code)
    endTimer('extractScript')

    if (!scriptMatch || !scriptMatch[1]) {
      endTimer('transformVueSFC')
      return null
    }

    const scriptContent = scriptMatch[1]
    const scriptStart = scriptMatch.index + scriptMatch[0].indexOf(scriptContent)

    // 使用转换核心处理提取出的脚本内容
    try {
      return transformCore({
        code: scriptContent,
        id,
        timerLabel: 'transformVueSFC',
        contentStart: scriptStart,
        logPrefix: 'Vue SFC',
      })
    }
    catch (err) {
      // 处理内部错误
      handleError(
        ErrorType.AST_TRANSFORM_ERROR,
        `Vue SFC转换失败: ${id}`,
        err,
      )
      endTimer('transformVueSFC')
      return null
    }
  }
  catch (err) {
    // 处理外部错误
    handleError(
      ErrorType.AST_TRANSFORM_ERROR,
      `Vue SFC处理失败: ${id}`,
      err,
    )

    // 发生错误时也结束计时
    endTimer('transformVueSFC')
    return null
  }
}
