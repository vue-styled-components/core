import type { TransformResult } from './types/types'
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
} from './utils'

/**
 * 转换styled组件语法
 *
 * @param code 原始代码
 * @param id 文件ID
 * @returns 转换结果，如果没有变化则为null
 */
export function transformStyledSyntax(code: string, id: string): TransformResult | null {
  // 开始整体转换计时
  startTimer('transformStyledSyntax')

  try {
    if (!hasStyledComponents(code)) {
      return null
    }

    // 使用 MagicString 进行精确替换
    const s = new MagicString(code)

    // 是否有修改
    let hasChanges = false

    // 重置并获取类型上下文
    resetContext(id)
    const typeContext = useContext(false, id)

    // 解析代码计时
    startTimer('parseCode')
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
    endTimer('parseCode')

    // 收集类型信息计时
    startTimer('collectTypes')
    // 收集所有类型信息
    collectTypesFromAST(ast, true)
    endTimer('collectTypes')

    // 转换 styled 组件计时
    startTimer('transformStyled')
    // 使用公共函数处理styled组件转换
    hasChanges = transformStyledComponents(ast, code, s, 0)
    endTimer('transformStyled')

    // 如果没有变更，返回null
    if (!hasChanges) {
      endTimer('transformStyledSyntax')
      return null
    }

    const result = {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
    }

    // 记录转换完成
    logDebug(`转换完成: ${id}, 文件大小: ${code.length} -> ${result.code.length} 字节`)

    // 结束整体转换计时
    endTimer('transformStyledSyntax')

    return result
  }
  catch (err) {
    // 发生错误时也结束计时
    endTimer('transformStyledSyntax')
    throw err
  }
}
