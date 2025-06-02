import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-Hans',
  description: '一个面向 Vue 的 CSS-in-JS 库',
  themeConfig: {
    nav: nav(),

    sidebar: {
      '/zh/guide/': { base: '/zh/guide/', items: sidebarGuide() },
    },

    editLink: {
      pattern: 'https://github.com/v-vibe/vue-styled-components/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: '根据 Apache-2.0 许可发布。',
      copyright: '版权所有 © 2024-present Akino',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})

function nav() {
  return [
    {
      text: '指南',
      link: '/zh/guide/basic/quick-start',
    },
    {
      text: 'API参考',
      link: '/zh/guide/api/core',
    },
    // {
    //   text: '性能',
    //   link: '/zh/guide/performance/benchmark',
    // },
  ]
}

function sidebarGuide() {
  return [
    {
      text: '基础',
      base: '/zh/guide/basic/',
      items: [
        { text: '快速开始', link: 'quick-start' },
        { text: '传递 props', link: 'passing-props' },
        { text: 'Attrs设置', link: 'attrs' },
        { text: '扩展样式', link: 'extending-styles' },
        { text: '样式化任意组件', link: 'styling-any-component' },
        { text: '动画', link: 'animations' },
      ],
    },
    {
      text: '进阶',
      base: '/zh/guide/advances/',
      items: [
        { text: '主题', link: 'theming' },
        { text: '全局样式', link: 'global-style' },
        { text: '样式复用', link: 'css-mixin' },
        { text: '嵌套CSS', link: 'nest-css' },
        { text: 'CSS私有前缀', link: 'auto-prefix' },
        { text: 'Tailwind CSS', link: 'tailwind-css' },
        { text: '插件', link: 'plugin' },
        { text: '性能优化', link: 'performance-optimization' },
      ],
    },
    // {
    //   text: '性能',
    //   base: '/zh/guide/performance/',
    //   items: [
    //     { text: '基准测试报告', link: 'benchmark' },
    //   ],
    // },
    {
      text: 'API参考',
      base: '/zh/guide/api/',
      items: [
        { text: '核心', link: 'core' },
        { text: '辅助', link: 'helper' },
        { text: 'Hook', link: 'hook' },
        { text: '性能', link: 'performance' },
      ],
    },
  ]
}
