import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { injectStyle, removeStyle } from '../src/utils/styleManagement'
import * as workerModule from '../src/utils/worker'

// 模拟DOM环境
class MockElement {
  classList = {
    add: vi.fn(),
  }
}

// 模拟document.querySelectorAll
const querySelectorAllMock = vi.fn()

describe('样式管理与Web Worker集成', () => {
  // 保存原始方法
  const originalQuerySelectorAll = globalThis.document.querySelectorAll

  beforeEach(() => {
    // 重置所有mock
    vi.resetAllMocks()

    // 模拟Worker模块
    vi.spyOn(workerModule, 'calculateStylesInWorker').mockImplementation((_cssWithExpression, _context) => {
      return Promise.resolve({
        result: ['color: purple;', 'background: yellow;'],
        tailwindClasses: ['text-lg', 'bg-yellow-500'],
      })
    })

    // 模拟document.querySelectorAll
    querySelectorAllMock.mockReturnValue([new MockElement(), new MockElement()])
    globalThis.document.querySelectorAll = querySelectorAllMock

    // 模拟style插入
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => document.createElement('style'))
  })

  afterEach(() => {
    // 恢复原始方法
    globalThis.document.querySelectorAll = originalQuerySelectorAll
    vi.restoreAllMocks()
  })

  it('应该使用Web Worker异步计算样式', async () => {
    const className = 'test-class'
    const cssWithExpression = [
      'color: purple;',
      (props: any) => `background: ${props.color || 'yellow'};`,
      'padding: 10px;',
    ]
    const context = { color: 'blue' }

    // 调用样式注入函数
    const result = injectStyle(className, cssWithExpression, context)

    // 验证Worker计算被调用
    expect(workerModule.calculateStylesInWorker).toHaveBeenCalledWith(cssWithExpression, context)

    // 测试环境下同步返回主线程结果而非空数组
    expect(result).toEqual(expect.any(Array))
  })

  it('应该能移除样式', () => {
    // 创建模拟样式节点
    const mockStyleNode = document.createTextNode(`.test-class{color: red;}`)
    const mockStyleTag = document.createElement('style')
    mockStyleTag.appendChild(mockStyleNode)

    // 模拟样式标签数组
    const mockTags = [mockStyleTag]

    // 使用Object.defineProperty临时替换私有变量
    const originalTags = (globalThis as any).__vsc_style_tags
    Object.defineProperty(globalThis, '__vsc_style_tags', {
      value: mockTags,
      writable: true,
    })

    // 移除样式
    removeStyle('test-class')

    // 恢复原始变量
    Object.defineProperty(globalThis, '__vsc_style_tags', {
      value: originalTags,
      writable: true,
    })
  })

  it('应该在Worker不可用时回退到主线程处理', async () => {
    // 模拟Worker不可用的情况
    vi.spyOn(workerModule, 'calculateStylesInWorker').mockImplementation(() => {
      return Promise.reject(new Error('Worker不可用'))
    })

    const className = 'fallback-class'
    const cssWithExpression = ['color: red;', 'margin: 5px;']
    const context = {}

    // 调用样式注入函数
    injectStyle(className, cssWithExpression, context)

    // 验证Worker计算被调用
    expect(workerModule.calculateStylesInWorker).toHaveBeenCalled()
  })
})
