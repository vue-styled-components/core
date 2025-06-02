export interface StyleConfig {
  /** 是否启用样式缓存 */
  enableCache?: boolean
  /** 缓存大小限制 */
  cacheSize?: number
  /** 是否启用批量更新 */
  enableBatchUpdates?: boolean
  /** 批量更新延迟时间(ms) */
  batchDelay?: number
  /** 是否启用异步处理 */
  enableAsync?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
}

const defaultConfig: Required<StyleConfig> = {
  enableCache: true,
  cacheSize: 1000,
  enableBatchUpdates: true,
  batchDelay: 16, // 约60fps
  enableAsync: false,
  enablePerformanceMonitoring: false,
}

let currentConfig: Required<StyleConfig> = { ...defaultConfig }

/**
 * 配置样式处理选项
 */
export function configureStyleProcessing(config: Partial<StyleConfig>): void {
  currentConfig = { ...currentConfig, ...config }
}

/**
 * 获取当前配置
 */
export function getStyleConfig(): Required<StyleConfig> {
  return { ...currentConfig }
}

/**
 * 重置配置为默认值
 */
export function resetStyleConfig(): void {
  currentConfig = { ...defaultConfig }
}
