/**
 * 统一的错误处理模块
 * 提供错误类型、日志记录和上报功能
 */

export enum ErrorType {
  TYPE_PARSE_ERROR = 'type-parse-error',
  AST_TRANSFORM_ERROR = 'ast-transform-error',
  CONTEXT_ERROR = 'context-error',
  STYLED_COMPONENT_ERROR = 'styled-component-error',
}

// 错误日志级别
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  NONE = 'none',
}

// 当前日志级别
let currentLogLevel: LogLevel = LogLevel.ERROR

// 错误收集器
const errorCollector: Array<{
  type: ErrorType
  message: string
  timestamp: number
  details?: any
}> = []

/**
 * 设置日志级别
 * @param level 目标日志级别
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level
}

/**
 * 获取当前的日志级别
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel
}

/**
 * 处理错误并记录
 * @param type 错误类型
 * @param message 错误消息
 * @param details 错误详情（可选）
 */
export function handleError(type: ErrorType, message: string, details?: any): void {
  if (currentLogLevel === LogLevel.NONE) {
    return
  }

  const errorInfo = {
    type,
    message,
    timestamp: Date.now(),
    details,
  }

  // 添加到错误收集器
  errorCollector.push(errorInfo)

  // 根据日志级别记录错误
  if (currentLogLevel === LogLevel.ERROR || currentLogLevel === LogLevel.WARN) {
    console.error(`[${type}] ${message}`)

    if (details && currentLogLevel === LogLevel.ERROR) {
      console.error('错误详情:', details)
    }
  }
}

/**
 * 记录警告信息
 * @param message 警告消息
 * @param details 详情（可选）
 */
export function logWarning(message: string, details?: any): void {
  if (currentLogLevel === LogLevel.NONE
    || currentLogLevel === LogLevel.ERROR) {
    return
  }

  console.warn(`[警告] ${message}`)

  if (details && (currentLogLevel === LogLevel.DEBUG || currentLogLevel === LogLevel.INFO)) {
    console.warn('详情:', details)
  }
}

/**
 * 记录信息性日志
 * @param message 日志消息
 * @param details 详情（可选）
 */
export function logInfo(message: string, details?: any): void {
  if (currentLogLevel !== LogLevel.INFO
    && currentLogLevel !== LogLevel.DEBUG) {
    return
  }

  console.info(`[信息] ${message}`)

  if (details && currentLogLevel === LogLevel.DEBUG) {
    console.info('详情:', details)
  }
}

/**
 * 记录调试信息
 * @param message 调试消息
 * @param details 详情（可选）
 */
export function logDebug(message: string, details?: any): void {
  if (currentLogLevel !== LogLevel.DEBUG) {
    return
  }

  console.debug(`[调试] ${message}`)

  if (details) {
    console.debug('详情:', details)
  }
}

/**
 * 获取收集的错误信息
 */
export function getCollectedErrors(): Array<{
  type: ErrorType
  message: string
  timestamp: number
  details?: any
}> {
  return [...errorCollector]
}

/**
 * 清除收集的错误信息
 */
export function clearErrors(): void {
  errorCollector.length = 0
}
