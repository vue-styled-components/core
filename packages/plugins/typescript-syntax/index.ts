import type { Plugin } from 'vite'
import { transformStyledSyntax } from './src/ts-transformer'
import { transformVueSFC } from './src/vue-transformer'

export interface VueStyledComponentsTypescriptSyntaxOptions {
  /**
   * 包含的文件扩展名
   * @default ['.vue', '.tsx', '.jsx', '.ts', '.js']
   */
  include?: string[]
  /**
   * 排除的文件扩展名或路径
   * @default ['node_modules']
   */
  exclude?: string[]
}

/**
 * Vue Styled Components TypeScript 语法糖插件
 *
 * 将 styled.tag<Props>`...` 转换为 styled('tag', Props)`...`
 * 使用 Vue compiler-sfc 生成的 AST 进行精确转换
 */
export default function vueStyledComponentsTypescriptSyntax(
  options: VueStyledComponentsTypescriptSyntaxOptions = {},
): Plugin {
  const include = options.include || ['.vue', '.tsx', '.jsx', '.ts', '.js']
  const exclude = options.exclude || ['node_modules']

  return {
    name: 'vue-styled-components-typescript-syntax',
    enforce: 'pre',
    transform(code, id) {
      // 检查文件是否应该被处理
      if (
        !include.some(ext => id.endsWith(ext))
        || exclude.some(pattern => id.includes(pattern))
      ) {
        return null
      }

      // 对.vue文件进行特殊处理
      if (id.endsWith('.vue')) {
        try {
          // 调用专门的Vue SFC转换函数（基于AST实现）
          return transformVueSFC(code, id)
        }
        catch (error) {
          console.error('处理Vue文件失败:', error)
          return null
        }
      }

      // 其他文件类型直接使用transformStyledSyntax
      // return transformStyledSyntax(code, id)
      // console.log(compileScript({script: code}, { id }))
      return transformStyledSyntax(code, id)
    },
  }
}
