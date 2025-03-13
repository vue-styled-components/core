import type { Plugin } from 'vite'
import type { LogLevel } from './utils'
import { transformStyledSyntax } from './ts-transformer'
import { setConfig, setLogLevel } from './utils'
import { transformVueSFC } from './vue-transformer'

/**
 * 插件选项
 */
export interface PluginOptions {
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean

  /**
   * 日志级别
   * @default 'error'
   */
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'none'

  /**
   * 是否启用类型缓存
   * @default true
   */
  enableCache?: boolean

  /**
   * 其他配置选项
   */
  [key: string]: any
}

/**
 * Vue Styled Components TypeScript 语法插件
 * @param options 插件配置选项
 */
export default function typescriptSyntaxPlugin(options: PluginOptions = {}): Plugin {
  const {
    debug = false,
    logLevel = 'error',
    enableCache = true,
    ...otherOptions
  } = options

  // 初始化配置
  setConfig({
    debug,
    enableCache,
    strictTypeChecking: true,
    optimizeAstTransform: true,
    enablePerfTracking: debug,
    logLevel: logLevel as LogLevel,
    maxCacheItems: 100,
  })

  // 设置日志级别
  setLogLevel(logLevel as LogLevel)

  // 返回 Vite 插件配置
  return {
    name: 'vue-styled-components:typescript-syntax',
    enforce: 'pre',

    transform(code, id) {
      // 处理 Vue 单文件组件
      if (id.endsWith('.vue')) {
        return transformVueSFC(code, id)
      }

      // 处理 TypeScript 文件
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        return transformStyledSyntax(code, id)
      }

      return null
    },
  }
}
