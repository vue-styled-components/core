/**
 * 类型上下文 - 提供统一的类型存储和管理
 */

/**
 * 类型上下文接口，封装所有类型相关的映射
 */
export interface TypeContext {
  // 存储接口和类型定义，用于后续转换引用类型
  typeMap: Map<string, string>

  // 存储导入的类型及其来源
  importedTypes: Map<string, {
    source: string
    originalName?: string
  }>

  // 存储类型别名的实际类型内容
  typeAliasMap: Map<string, any>
}

// 全局上下文存储
let globalContext: TypeContext | null = null

// 缓存配置
const cacheConfig = {
  // 缓存是否启用
  enabled: true,
  // 缓存命中统计
  hits: 0,
  // 缓存未命中统计
  misses: 0,
  // 当前处理的文件ID，用于文件级别缓存
  currentFileId: '',
  // 文件级缓存，保存每个文件的上下文
  fileContexts: new Map<string, TypeContext>(),
}

/**
 * 创建一个新的类型上下文
 */
export function createTypeContext(): TypeContext {
  return {
    typeMap: new Map<string, string>(),
    importedTypes: new Map<string, { source: string, originalName?: string }>(),
    typeAliasMap: new Map<string, any>(),
  }
}

/**
 * 获取或创建全局类型上下文
 *
 * @param forceNew 是否强制创建新的上下文，默认为false
 * @param fileId 当前处理的文件ID，用于文件级缓存
 * @returns 类型上下文实例
 */
export function useContext(forceNew: boolean = false, fileId?: string): TypeContext {
  // 如果启用了缓存且指定了文件ID
  if (cacheConfig.enabled && fileId) {
    // 更新当前处理的文件ID
    cacheConfig.currentFileId = fileId

    // 检查文件缓存
    if (!forceNew && cacheConfig.fileContexts.has(fileId)) {
      cacheConfig.hits++
      return cacheConfig.fileContexts.get(fileId)!
    }

    cacheConfig.misses++
    // 为此文件创建新的上下文并缓存
    const newContext = createTypeContext()
    cacheConfig.fileContexts.set(fileId, newContext)
    return newContext
  }

  // 使用全局上下文（无文件级缓存）
  if (forceNew || !globalContext) {
    globalContext = createTypeContext()
  }
  return globalContext
}

/**
 * 重置全局上下文
 *
 * @param fileId 可选的文件ID，如果提供则只重置该文件的上下文
 */
export function resetContext(fileId?: string): void {
  if (fileId && cacheConfig.enabled) {
    // 只重置特定文件的缓存
    cacheConfig.fileContexts.delete(fileId)
    return
  }

  // 重置全局上下文
  globalContext = null

  // 如果需要，同时清除所有文件缓存
  if (cacheConfig.enabled) {
    cacheConfig.fileContexts.clear()
    cacheConfig.hits = 0
    cacheConfig.misses = 0
  }
}

/**
 * 配置缓存系统
 *
 * @param options 缓存配置项
 */
export function configureCache(options: { enabled?: boolean }): void {
  if (options.enabled !== undefined) {
    cacheConfig.enabled = options.enabled
  }

  // 如果禁用缓存，清除现有缓存
  if (!cacheConfig.enabled) {
    cacheConfig.fileContexts.clear()
    cacheConfig.hits = 0
    cacheConfig.misses = 0
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): { enabled: boolean, hits: number, misses: number, fileCount: number } {
  return {
    enabled: cacheConfig.enabled,
    hits: cacheConfig.hits,
    misses: cacheConfig.misses,
    fileCount: cacheConfig.fileContexts.size,
  }
}

/**
 * 从类型映射字符串中解析属性
 *
 * @param typeMapStr 类型映射字符串，如 "{ prop1: { type: String, required: true }, prop2: {...} }"
 * @returns 包含属性名到属性值映射的对象
 */
export function parsePropsFromTypeMap(typeMapStr: string): Record<string, string> {
  const props: Record<string, string> = {}

  try {
    // 移除花括号并解析内容
    if (!typeMapStr.startsWith('{') || !typeMapStr.endsWith('}')) {
      return props
    }

    const content = typeMapStr.slice(1, -1).trim()
    if (!content)
      return props

    // 智能分割属性定义，处理可能的嵌套属性
    let braceCount = 0
    let start = 0

    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++
      }
      else if (content[i] === '}') {
        braceCount--
      }
      // 只在顶层查找属性分隔符
      else if (content[i] === ',' && braceCount === 0) {
        // 找到属性分隔符，处理当前属性
        const propDef = content.substring(start, i).trim()
        const colonIdx = propDef.indexOf(':')

        if (colonIdx !== -1) {
          const propName = propDef.substring(0, colonIdx).trim()
          const propValue = propDef.substring(colonIdx + 1).trim()
          props[propName] = propValue
        }

        start = i + 1 // 更新下一个属性的起始位置
      }
    }

    // 处理最后一个属性
    if (start < content.length) {
      const propDef = content.substring(start).trim()
      const colonIdx = propDef.indexOf(':')

      if (colonIdx !== -1) {
        const propName = propDef.substring(0, colonIdx).trim()
        const propValue = propDef.substring(colonIdx + 1).trim()
        props[propName] = propValue
      }
    }
  }
  catch (error) {
    console.error(`解析类型映射字符串失败: ${typeMapStr}`, error)
  }

  return props
}
