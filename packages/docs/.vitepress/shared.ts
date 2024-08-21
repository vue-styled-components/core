import { DefaultTheme, defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  title: 'Vue Styled Components',
  head: [
    ['link', { rel: 'icon', href: '/logo.png ' }],
    ['meta', { name: 'baidu-site-verification', content: 'codeva-A0O1O91tRG' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-WBXHE8DJ0C' }],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WBXHE8DJ0C');`,
    ],
    [
      'script',
      {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?29a321a01482ac90641e590b27adbbf5";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
      `,
    ],
  ],

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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vue-styled-components/core' },
      { icon: 'discord', link: 'https://discord.gg/UbJxnvt2UH' },
    ],
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
        '@vue-styled-components/core': new URL('../../core', import.meta.url).pathname,
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less'],
    },
    plugins: [demoblockVitePlugin()],
  },
})
