/**
 * 通用工具函数
 */

/**
 * 检查代码是否包含styled-components
 */
export function hasStyledComponents(code: string): boolean {
  return code.includes('styled.') || code.includes('styled(')
}
