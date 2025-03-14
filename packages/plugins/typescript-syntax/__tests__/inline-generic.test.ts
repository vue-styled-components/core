import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { extractPropsFromCode } from './normalize'

describe('内联泛型处理', () => {
  it('应该正确处理简单的内联泛型参数', () => {
    const code = `
      import styled from 'styled-components'
      
      // 内联泛型必须是对象类型，而不是简单类型别名
      interface NameProps {
        name: string;
        bold?: boolean;
      }
      
      // 使用接口类型
      const UserName = styled.span<NameProps>\`
        font-weight: \${props => props.bold ? 'bold' : 'normal'};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'UserName')
    expect(props).toHaveProperty('name')
    expect(props).toHaveProperty('bold')
    expect(props.name.type).toBe('String')
    expect(props.name.required).toBe(true)
    expect(props.bold.required).toBe(false)
  })

  it('应该处理自定义泛型容器', () => {
    const code = `
      import styled from 'styled-components'
      
      interface Item {
        id: string;
        title: string;
      }
      
      interface Container<T> {
        data: T;
        loading: boolean;
        error?: string;
      }
      
      // 使用自定义泛型容器
      const ItemContainer = styled.div<Container<Item>>\`
        padding: 16px;
        border: 1px solid #ccc;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'ItemContainer')
    expect(props).toHaveProperty('data')
    expect(props).toHaveProperty('loading')
    expect(props).toHaveProperty('error')
    expect(props.loading.type).toBe('Boolean')
    expect(props.loading.required).toBe(true)
    expect(props.error.required).toBe(false)
  })

  it('应该处理嵌套的泛型结构', () => {
    const code = `
      import styled from 'styled-components'
      
      interface User {
        name: string;
        age: number;
      }
      
      interface Paginated<T> {
        items: T[];
        total: number;
        page: number;
      }
      
      // 使用嵌套泛型
      const PaginatedList = styled.div<Paginated<User>>\`
        margin-top: 20px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'PaginatedList')
    expect(props).toHaveProperty('items')
    expect(props).toHaveProperty('total')
    expect(props).toHaveProperty('page')
    expect(props.items.type).toBe('Array')
    expect(props.total.type).toBe('Number')
  })

  it('应该处理泛型与交叉类型的组合', () => {
    const code = `
      import styled from 'styled-components'
      
      interface Theme {
        primary: string;
        secondary: string;
      }
      
      interface WithLoading {
        loading: boolean;
      }
      
      // 交叉类型中包含泛型
      const StyledButton = styled.button<Theme & WithLoading>\`
        background-color: \${props => props.loading ? '#ccc' : props.primary};
        color: \${props => props.secondary};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'StyledButton')
    expect(props).toHaveProperty('primary')
    expect(props).toHaveProperty('secondary')
    expect(props).toHaveProperty('loading')
    expect(props.primary.type).toBe('String')
    expect(props.loading.type).toBe('Boolean')
  })

  it('应该处理泛型内部包含对象字面量', () => {
    const code = `
      import styled from 'styled-components'
      
      interface Config<T> {
        value: T;
        label: string;
      }
      
      // 泛型参数中包含对象字面量
      const ConfigItem = styled.div<Config<{ id: string; active: boolean }>>\`
        padding: 8px;
        border: 1px solid #eee;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'ConfigItem')
    expect(props).toHaveProperty('value')
    expect(props).toHaveProperty('label')
    expect(props.label.type).toBe('String')
  })

  it('应该处理多层嵌套泛型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface Item {
        id: string;
        name: string;
      }
      
      interface List<T> {
        items: T[];
      }
      
      interface Container<T> {
        data: T;
        loading: boolean;
      }
      
      // 多层嵌套泛型
      const ComplexContainer = styled.div<Container<List<Item>>>\`
        margin: 24px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'ComplexContainer')
    expect(props).toHaveProperty('data')
    expect(props).toHaveProperty('loading')
    expect(props.loading.type).toBe('Boolean')
  })

  it('应该处理联合类型中包含的泛型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface SuccessState {
        status: 'success';
        data: string;
      }
      
      interface ErrorState {
        status: 'error';
        message: string;
      }
      
      // 使用联合类型中的泛型
      const StatusIndicator = styled.div<SuccessState | ErrorState>\`
        color: \${props => props.status === 'error' ? 'red' : 'green'};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'StatusIndicator')
    expect(props).toHaveProperty('status')
    // 联合类型处理后通常会保留共同属性
    expect(props.status.type).toBe('String')
  })

  it('应该处理内联泛型中嵌套的联合和交叉类型', () => {
    const code = `
      import styled from 'styled-components'
      
      type Size = 'small' | 'medium' | 'large';
      
      interface ComponentProps {
        size: Size;
        variant: 'primary' | 'secondary';
      }
      
      interface WithTheme {
        theme: {
          main: string;
          text: string;
        };
      }
      
      // 复杂的嵌套类型组合
      const ComplexComponent = styled.div<ComponentProps & WithTheme>\`
        font-size: \${props => 
          props.size === 'small' ? '12px' : 
          props.size === 'medium' ? '16px' : '20px'
        };
        background-color: \${props => props.theme.main};
        color: \${props => props.theme.text};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'ComplexComponent')
    expect(props).toHaveProperty('size')
    expect(props).toHaveProperty('variant')
    expect(props).toHaveProperty('theme')
    expect(props.size.type).toBe('String')
    expect(props.variant.type).toBe('String')
  })

  it('应该处理带有默认值的泛型参数', () => {
    const code = `
      import styled from 'styled-components'
      
      interface OptionProps<T = string> {
        value: T;
        label: string;
        disabled?: boolean;
      }
      
      // 使用带默认值的泛型
      const Option = styled.div<OptionProps>\`
        opacity: \${props => props.disabled ? 0.5 : 1};
      \`
      
      // 使用带指定类型的泛型
      const NumberOption = styled.div<OptionProps<number>>\`
        opacity: \${props => props.disabled ? 0.5 : 1};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    // 检查默认泛型参数
    const optionProps = extractPropsFromCode(result?.props?.[0], 'Option')
    expect(optionProps).toHaveProperty('value')
    expect(optionProps).toHaveProperty('label')
    expect(optionProps).toHaveProperty('disabled')
    expect(optionProps.value.type).toBe('String') // 默认T = string

    // // 检查指定的泛型参数
    // const regex = /const\s+NumberOption\s*=\s*styled\([^)]+\)/;
    // const match = result?.code.match(regex);
    // const numberOptionProps = match ? parseProps(match[0]) : {};
    // expect(numberOptionProps).toHaveProperty('value')
    // expect(numberOptionProps.value.type).toBe('Number') // 指定T = number
  })
})
