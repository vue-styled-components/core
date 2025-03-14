import { describe, expect, it } from 'vitest'
import { transformStyledSyntax } from '../src/ts-transformer'
import { extractPropsFromCode } from './normalize'

describe('边缘情况处理', () => {
  it('应该处理空类型参数', () => {
    const code = `
      import styled from 'styled-components'
      
      // 空对象类型
      const EmptyProps = styled.div<{}>\`
        padding: 16px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.code, 'EmptyProps')
    expect(Object.keys(props).length).toBe(0)
  })

  it('应该处理字符串字面量类型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface ButtonProps {
        variant: 'primary' | 'secondary' | 'tertiary';
      }
      
      const Button = styled.button<ButtonProps>\`
        background-color: \${props => 
          props.variant === 'primary' ? 'blue' : 
          props.variant === 'secondary' ? 'gray' : 'white'
        };
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'Button')
    expect(props).toHaveProperty('variant')
    expect(props.variant.type[0]).toBe('String')
    expect(props.variant.required).toBe(true)
  })

  it('应该处理数字字面量类型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface GridProps {
        columns: 1 | 2 | 3 | 4;
      }
      
      const Grid = styled.div<GridProps>\`
        display: grid;
        grid-template-columns: repeat(\${props => props.columns}, 1fr);
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'Grid')
    expect(props).toHaveProperty('columns')
    expect(props.columns.type[0]).toBe('Number')
    expect(props.columns.required).toBe(true)
  })

  it('应该处理嵌套的对象类型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface ThemeProps {
        theme: {
          primary: string;
          secondary: string;
          sizes: {
            small: number;
            medium: number;
            large: number;
          };
        };
      }
      
      const ThemedBox = styled.div<ThemeProps>\`
        background-color: \${props => props.theme.primary};
        color: \${props => props.theme.secondary};
        padding: \${props => props.theme.sizes.medium}px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'ThemedBox')
    expect(props).toHaveProperty('theme')
    expect(props.theme.type).toBe('Object')
    expect(props.theme.required).toBe(true)
  })

  it('应该处理包含特殊字符的属性名', () => {
    const code = `
      import styled from 'styled-components'
      
      interface SpecialProps {
        'data-test-id': string;
        'aria-label'?: string;
      }
      
      const SpecialComponent = styled.div<SpecialProps>\`
        position: relative;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    // 由于属性名的限制，我们只检查转换是否成功
    expect(result?.code).toContain('styled(\'div\'')
  })

  it('应该处理动态导入的类型', () => {
    const code = `
      import styled from 'styled-components'
      import type { User } from './types'
      
      interface Props {
        user: User;
        highlight?: boolean;
      }
      
      const UserCard = styled.div<Props>\`
        border: 1px solid \${props => props.highlight ? 'blue' : 'gray'};
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'UserCard')
    expect(props).toHaveProperty('user')
    expect(props).toHaveProperty('highlight')
    expect(props.highlight.type).toBe('Boolean')
    expect(props.highlight.required).toBe(false)
  })

  it('应该处理索引签名类型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface DynamicProps {
        [key: string]: any;
        id: string;
      }
      
      const DynamicComponent = styled.div<DynamicProps>\`
        padding: 8px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'DynamicComponent')
    expect(props).toHaveProperty('id')
    expect(props.id.type).toBe('String')
  })

  it('应该处理循环引用类型', () => {
    const code = `
      import styled from 'styled-components'
      
      interface TreeNode {
        id: string;
        label: string;
        children?: TreeNode[];
      }
      
      const TreeItem = styled.li<TreeNode>\`
        list-style: none;
        padding-left: 16px;
      \`
    `

    const result = transformStyledSyntax(code, 'test.tsx')
    expect(result).not.toBeNull()

    const props = extractPropsFromCode(result?.props?.[0], 'TreeItem')
    expect(props).toHaveProperty('id')
    expect(props).toHaveProperty('label')
    expect(props).toHaveProperty('children')
    expect(props.id.type).toBe('String')
    expect(props.children.type).toBe('Array')
    expect(props.children.required).toBe(false)
  })
})
