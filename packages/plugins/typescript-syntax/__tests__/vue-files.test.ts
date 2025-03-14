import type { Plugin } from 'vite'
import { describe, expect, it } from 'vitest'
import vueStyledComponentsTypescriptSyntax from '../index'
import { extractPropsFromCode } from './normalize'

describe('vue文件处理', () => {
  it('应该可以提取并转换Vue文件中的styled组件', async () => {
    // 模拟一个Vue文件内容
    const vueContent = `
<template>
  <div>
    <styled-button primary>按钮</styled-button>
  </div>
</template>

<script setup lang="ts">
import styled from '@vue-styled-components/core'

interface ButtonProps {
  primary?: boolean
}

const StyledButton = styled.button<ButtonProps>\`
  background-color: \${props => props.primary ? 'blue' : 'white'};
  color: \${props => props.primary ? 'white' : 'blue'};
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
\`
</script>
    `

    // 创建插件实例
    const plugin = vueStyledComponentsTypescriptSyntax() as Plugin

    // 获取transform函数
    const transformFn = plugin.transform as any
    // 直接调用transform函数
    const result = transformFn(vueContent, 'test.vue')

    // 应该有转换结果
    expect(result).not.toBeNull()

    // 使用对象比较来验证转换结果
    const props = extractPropsFromCode(result?.props?.[0], 'StyledButton')
    expect(props).toHaveProperty('primary')
    expect(props.primary.type).toBe('Boolean')
    expect(props.primary.required).toBe(false)
  })

  it('应该处理没有script块的Vue文件', async () => {
    // 模拟一个没有script块的Vue文件
    const vueContent = `
<template>
  <div>Hello World</div>
</template>

<style>
.container {
  margin: 20px;
}
</style>
    `

    // 创建插件实例
    const plugin = vueStyledComponentsTypescriptSyntax() as Plugin

    // 获取transform函数
    const transformFn = plugin.transform as any
    // 直接调用transform函数
    const result = transformFn(vueContent, 'test.vue')

    // 没有script块，所以不应该有转换结果
    expect(result).toBeNull()
  })

  it('应该处理包含script但没有styled组件的Vue文件', async () => {
    // 模拟一个有script但没有styled组件的Vue文件
    const vueContent = `
<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello World')
</script>
    `

    // 创建插件实例
    const plugin = vueStyledComponentsTypescriptSyntax() as Plugin

    // 获取transform函数
    const transformFn = plugin.transform as any
    // 直接调用transform函数
    const result = transformFn(vueContent, 'test.vue')

    // 没有styled组件，所以不应该有转换结果
    expect(result).toBeNull()
  })
})
