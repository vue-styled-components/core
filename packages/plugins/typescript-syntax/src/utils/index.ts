// 导出各个模块的功能
export * from './ast-traverser'
// 从各模块中选择性导出特定函数，方便直接导入
export {
  analyzeTypeParameter,
  traverseAst,
} from './ast-traverser'
export * from './config'
// 导出枚举和类型
export type {
  TransformerConfig,
} from './config'
export {
  getConfig,
  getConfigOption,
  resetConfig,
  setConfig,
} from './config'
export * from './error-handler'
export {
  clearErrors,
  getCollectedErrors,
  getLogLevel,
  handleError,
  logDebug,
  logInfo,
  logWarning,
  setLogLevel,
} from './error-handler'
export {
  ErrorType,
  LogLevel,
} from './error-handler'
export * from './perf-tracker'
export {
  endTimer,
  getPerfSummary,
  measure,
  measureFunction,
  resetPerfRecords,
  startTimer,
} from './perf-tracker'
export * from './styled-transformers'

export {
  handleIntersectionType,
  handleObjectIntersectionType,
  handleUnionType,
  processTypeParameters,
} from './styled-transformers'

export {
  processInnerGenericParams,
  processNestedGeneric,
} from './styled-transformers'

// 导出 transform-core.ts 的函数
export { transformCore } from './transform-core'

export * from './type-collectors'

export {
  collectImportedTypes,
  collectInterfaceDefinition,
  collectTypeAliasDefinition,
  collectTypesFromAST,
} from './type-collectors'

export * from './type-context'

export {
  configureCache,
  createTypeContext,
  getCacheStats,
  parsePropsFromTypeMap,
  resetContext,
  useContext,
} from './type-context'

export * from './type-converter'

export {
  extractTypeInfo,
} from './type-converter'

export * from './type-processors'

export {
  formatPropTypeToJS,
  handleMultilineObject,
  parseInlineProps,
  stringifyProps,
} from './type-processors'

export * from './type-utils'

export type {
  TypeAnalysisResult,
} from './type-utils'

export {
  extractGenericParameters,
  getBaseTypeName,
  isOptionalType,
  parseComplexType,
  splitTypeByOperator,
  typeScriptToVueProp,
} from './type-utils'

export * from './utils'

export {
  hasStyledComponents,
} from './utils'
