import { defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vue3-styled-components/',
  title: 'Vue3 Styled Components',
  description: 'A tool for css in js.',
  themeConfig: {
    demoblock: {
      root: {
        'view-source': 'View source',
        'hide-source': 'Hide source',
        'edit-in-editor': 'Edit in Playground',
        'edit-on-github': 'Edit on GitHub',
        'copy-code': 'Copy code',
        'copy-success': 'Copy success',
        'copy-error': 'Copy error'
      },
      zh: {
        'view-source': '查看源代码',
        'hide-source': '隐藏源代码',
        'edit-in-editor': '在 Playground 中编辑',
        'edit-on-github': '在 Github 中编辑',
        'copy-code': '复制代码',
        'copy-success': '复制成功',
        'copy-error': '复制失败'
      }
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/quick-start' }
    ],

    sidebar: [
      {
        text: 'Basic',
        items: [
          { text: 'Quick Start', link: '/guide/quick-start' },
          { text: 'Passed Props', link: '/guide/passed-props' },
          { text: 'Extending Styles', link: '/guide/extending-styles' },
          { text: 'Styling Any Component', link: '/guide/styling-any-component' },
          { text: 'Animations', link: '/guide/animations' }
        ]
      },
      {
        text: 'Advances',
        items: [{ text: 'Runtime API Examples', link: '/api-examples' }]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/vue-styled-components/vue3-styled-components' }]
  },
  markdown: {
    config: (md) => {
      md.use(demoblockPlugin)
    }
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('../../package', import.meta.url).pathname
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less']
    },
    plugins: [demoblockVitePlugin()]
  },
  vue: {}
})
