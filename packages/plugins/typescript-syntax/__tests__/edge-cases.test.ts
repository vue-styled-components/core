import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { normalizeString } from './normalize'

describe('边缘情况处理', () => {
  it('应该处理含空格的泛型定义', () => {
    const code = `
      import styled from '@vue-styled-components/core'

      interface ButtonProps {
        color: string
      }
      
      // 泛型定义中含有空格
      const Button = styled.button< ButtonProps >\`
        background-color: blue;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('button',  { color: { type: String, required: true } } )`))
  })

  it('应该处理含有特殊字符的泛型定义', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      // 包含特殊字符和换行的类型参数
      const Button = styled.button<{
        color: '#fff' | '#000' | \`rgba(223, 224, 225, 100)\`;
        'data-id'?: string;
        shadow: \`\${number}px \${number}px\`;
      }>\`
        color: \${props => props.color};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('button', {
        color: { type: String, required: true },
        'data-id': { type: String, required: false },
        shadow: { type: String, required: true }
      })`))
  })

  it('应该处理嵌套泛型和类型参数', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      type Func<T, U> = (arg: T) => U
      
      // 复杂嵌套泛型
      const Container = styled.div<{
        data: Array<string>
        id: string
        items: Array<{ key: string; value: number }>
        callback: Func<string, void>
      }>\`
        padding: 10px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('div', {
        data: { type: Array, required: true },
        id: { type: String, required: true },
        items: { type: Array, required: true },
        callback: { type: Function, required: true }
      })`))
  })

  it('应该处理带有默认值的泛型参数', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      // 带有默认类型参数的泛型
      interface ListProps<T = string, U = number> {
        items: T[];
        maxCount: U;
        renderItem?: (item: T, index: U) => React.ReactNode;
      }
      
      const List = styled.ul<ListProps<string[], number>>\`
        list-style: none;
        padding: 0;
        margin: 0;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('ul', { items: { type: Array, required: true }, maxCount: { type: String, required: true }, renderItem: { type: Function, required: false } })`))
  })

  it('应该处理带有多个反引号的模板字符串', () => {
    const code = `
      import styled from '@vue-styled-components/core'
      
      const Tag = styled.span<{ color: string }>\`
        color: \${props => props.color};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')

    expect(result).not.toBeNull()
    expect(normalizeString(result?.code)).toContain(normalizeString(`styled('span', { color: { type: String, required: true } })`))
  })
})
