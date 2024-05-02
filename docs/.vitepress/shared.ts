import { DefaultTheme, defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  title: 'Vue Styled Components',
  head: [['link', { rel: 'icon', href: '/logo.png ' }]],

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  themeConfig: {
    logo: '/logo.png',
    demoblock: {
      root: {
        'view-source': 'View source',
        'hide-source': 'Hide source',
        'edit-in-editor': 'Edit in Playground',
        'edit-on-github': 'Edit on GitHub',
        'copy-code': 'Copy code',
        'copy-success': 'Copy success',
        'copy-error': 'Copy error',
      },
      zh: {
        'view-source': '查看源代码',
        'hide-source': '隐藏源代码',
        'edit-in-editor': '在 Playground 中编辑',
        'edit-on-github': '在 Github 中编辑',
        'copy-code': '复制代码',
        'copy-success': '复制成功',
        'copy-error': '复制失败',
      },
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/v-vibe/vue-styled-components' }],
  } as DefaultTheme.Config,
  markdown: {
    config: (md) => {
      md.use(demoblockPlugin)
    },
  },
  vite: {
    resolve: {
      alias: {
        '@/': new URL('../../core/', import.meta.url).pathname,
        '@vvibe/vue-styled-components': new URL('../../core', import.meta.url).pathname,
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less'],
    },
    plugins: [demoblockVitePlugin()],
  },
})
