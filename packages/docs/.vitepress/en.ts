import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  description: 'A tool for css in js.',
  themeConfig: {
    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
    },

    editLink: {
      pattern: 'https://github.com/v-vibe/vue-styled-components/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2024-present Akino',
    },
  },
})

function nav() {
  return [
    {
      text: 'Guide',
      link: '/guide/basic/quick-start',
    },
    {
      text: 'API',
      link: '/guide/api/core',
    },
    // {
    //   text: 'Performance',
    //   link: '/guide/performance/benchmark',
    // },
  ]
}

function sidebarGuide() {
  return [
    {
      text: 'Basic',
      base: '/guide/basic/',
      items: [
        { text: 'Quick Start', link: 'quick-start' },
        { text: 'Passing Props', link: 'passing-props' },
        { text: 'Attrs Setting', link: 'attrs' },
        { text: 'Extending Styles', link: 'extending-styles' },
        { text: 'Styling Any Component', link: 'styling-any-component' },
        { text: 'Animations', link: 'animations' },
      ],
    },
    {
      text: 'Advances',
      base: '/guide/advances/',
      items: [
        { text: 'Theming', link: 'theming' },
        { text: 'Global Styles', link: 'global-style' },
        { text: 'CSS Mixin', link: 'css-mixin' },
        { text: 'Nest CSS', link: 'nest-css' },
        { text: 'Auto Prefix', link: 'auto-prefix' },
        { text: 'Tailwind CSS', link: 'tailwind-css' },
        { text: 'Plugin', link: 'plugin' },
      ],
    },
    // {
    //   text: 'Performance',
    //   base: '/guide/performance/',
    //   items: [
    //     { text: 'Benchmark Report', link: 'benchmark' },
    //   ],
    // },
    {
      text: 'API Reference',
      base: '/guide/api/',
      items: [
        { text: 'Core', link: 'core' },
        { text: 'Helper', link: 'helper' },
        { text: 'Hook', link: 'hook' },
      ],
    },
  ]
}
