import type { TransformResult } from './types/types'
import { transformCore } from './utils'

/**
 * 转换styled组件语法
 *
 * @param code 原始代码
 * @param id 文件ID
 * @returns 转换结果，如果没有变化则为null
 */
export function transformStyledSyntax(code: string, id: string): TransformResult | null {
  // 使用通用转换核心函数处理
  return transformCore({
    code,
    id,
    timerLabel: 'transformStyledSyntax',
  })
}
