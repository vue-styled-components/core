import type { TransformResult } from '../types/types'
import * as parser from '@babel/parser'
import MagicString from 'magic-string'
import {
  collectTypesFromAST,
  endTimer,
  hasStyledComponents,
  logDebug,
  resetContext,
  startTimer,
  transformStyledComponents,
  useContext,
} from './'

/**
 * 通用转换核心函数，处理源代码并转换styled组件语法
 *
 * @param options 转换选项
 * @returns 转换结果，如果没有变化则为null
 */
export function transformCore(options: {
  code: string // 原始代码
  id: string // 文件ID
  timerLabel: string // 计时器标签
  contentStart?: number // 内容开始位置（用于SFC偏移）
  shouldLog?: boolean // 是否记录日志
  logPrefix?: string // 日志前缀
}): TransformResult | null {
  const {
    code,
    id,
    timerLabel,
    contentStart = 0,
    shouldLog = true,
    logPrefix = '',
  } = options

  // 开始整体转换计时
  startTimer(timerLabel)

  try {
    if (!hasStyledComponents(code)) {
      endTimer(timerLabel)
      return null
    }

    // 使用 MagicString 进行精确替换
    const s = new MagicString(code)

    // 重置并获取类型上下文
    resetContext(id)
    useContext(false, id)

    // 解析代码计时
    startTimer(`${timerLabel}:parse`)
    // 使用Babel解析代码
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        ['decorators', { decoratorsBeforeExport: true }],
      ],
      errorRecovery: true,
    })
    endTimer(`${timerLabel}:parse`)

    // 收集类型信息计时
    startTimer(`${timerLabel}:collectTypes`)
    // 收集所有类型信息
    collectTypesFromAST(ast, true)
    endTimer(`${timerLabel}:collectTypes`)

    // 转换 styled 组件计时
    startTimer(`${timerLabel}:transform`)
    // 使用公共函数处理styled组件转换
    const { hasChanges, props } = transformStyledComponents(ast, code, s, contentStart)
    endTimer(`${timerLabel}:transform`)

    // 如果没有变更，返回null
    if (!hasChanges) {
      endTimer(timerLabel)
      return null
    }

    const result = {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
      props,
    }

    // 记录转换完成
    if (shouldLog) {
      logDebug(`${logPrefix}转换完成: ${id}, 文件大小: ${code.length} -> ${result.code.length} 字节`)
    }

    // 结束整体转换计时
    endTimer(timerLabel)

    return result
  }
  catch (err) {
    // 发生错误时也结束计时
    endTimer(timerLabel)
    throw err
  }
}
