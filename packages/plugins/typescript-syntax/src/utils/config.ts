/**
 * 配置系统
 * 提供统一的配置管理和访问功能
 */
import { LogLevel } from './error-handler'

/**
 * 转换器配置接口
 */
export interface TransformerConfig {
  // 调试模式
  debug: boolean

  // 是否进行严格类型检查
  strictTypeChecking: boolean

  // 是否启用缓存
  enableCache: boolean

  // 日志级别
  logLevel: LogLevel

  // 是否启用性能跟踪
  enablePerfTracking: boolean

  // 是否优化AST转换过程
  optimizeAstTransform: boolean

  // 最大缓存项数量（按文件）
  maxCacheItems: number
}

/**
 * 默认配置
 */
const defaultConfig: TransformerConfig = {
  debug: false,
  strictTypeChecking: true,
  enableCache: true,
  logLevel: LogLevel.ERROR,
  enablePerfTracking: false,
  optimizeAstTransform: true,
  maxCacheItems: 100,
}

// 当前配置
let config: TransformerConfig = { ...defaultConfig }

/**
 * 获取当前配置
 */
export function getConfig(): TransformerConfig {
  return { ...config }
}

/**
 * 更新配置
 * @param newConfig 新的配置选项（部分）
 */
export function setConfig(newConfig: Partial<TransformerConfig>): void {
  config = { ...config, ...newConfig }
}

/**
 * 重置配置为默认值
 */
export function resetConfig(): void {
  config = { ...defaultConfig }
}

/**
 * 获取特定配置项
 * @param key 配置项键名
 */
export function getConfigOption<K extends keyof TransformerConfig>(
  key: K,
): TransformerConfig[K] {
  return config[key]
}
