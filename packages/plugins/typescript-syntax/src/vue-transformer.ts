import type { TransformResult } from './types/types'
import * as parser from '@babel/parser'
import MagicString from 'magic-string'
import {
  collectTypesFromAST,
  endTimer,
  ErrorType,
  handleError,
  hasStyledComponents,
  logDebug,
  resetContext,
  startTimer,
  transformStyledComponents,
  useContext,
} from './utils'

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
      return null
    }

    // 提取script部分
    startTimer('extractScript')
    const scriptMatch = /<script\s+(?:\S.*?)??lang=["']ts["'].*?>([\s\S]*?)<\/script>/i.exec(code)
    endTimer('extractScript')

    if (!scriptMatch || !scriptMatch[1]) {
      return null
    }

    const scriptContent = scriptMatch[1]
    const scriptStart = scriptMatch.index + scriptMatch[0].indexOf(scriptContent)

    // 检查是否有styled组件
    if (!hasStyledComponents(scriptContent)) {
      return null
    }

    // 使用MagicString处理代码
    const s = new MagicString(code)
    let hasChanges = false

    // 重置并获取类型上下文
    resetContext(id)
    const typeContext = useContext(false, id)

    // 解析脚本部分计时
    startTimer('parseVueScript')
    // 解析脚本部分
    const ast = parser.parse(scriptContent, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        ['decorators', { decoratorsBeforeExport: true }],
      ],
      errorRecovery: true,
    })
    endTimer('parseVueScript')

    // 收集类型信息计时
    startTimer('collectVueTypes')
    // 收集所有类型信息
    collectTypesFromAST(ast, true)
    endTimer('collectVueTypes')

    // 转换 styled 组件计时
    startTimer('transformVueStyled')
    // 使用公共函数处理styled组件转换
    hasChanges = transformStyledComponents(ast, scriptContent, s, scriptStart)
    endTimer('transformVueStyled')

    // 如果没有变更，返回null
    if (!hasChanges) {
      endTimer('transformVueSFC')
      return null
    }

    const result = {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
    }

    // 记录转换完成
    logDebug(`Vue SFC转换完成: ${id}, 脚本大小: ${scriptContent.length} 字节`)

    // 结束整体转换计时
    endTimer('transformVueSFC')

    return result
  }
  catch (err) {
    // 处理错误
    handleError(
      ErrorType.AST_TRANSFORM_ERROR,
      `Vue SFC转换失败: ${id}`,
      err,
    )

    // 发生错误时也结束计时
    endTimer('transformVueSFC')
    return null
  }
}
