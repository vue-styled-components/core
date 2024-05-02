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
      link: '/api/core',
    },
  ]
}

function sidebarGuide() {
  return [
    {
      text: 'Basic',
      items: [
        { text: 'Quick Start', link: '/basic/quick-start' },
        { text: 'Passed Props', link: '/basic/passed-props' },
        { text: 'Extending Styles', link: '/basic/extending-styles' },
        { text: 'Styling Any Component', link: '/basic/styling-any-component' },
        { text: 'Animations', link: '/basic/animations' },
      ],
    },
    {
      text: 'Advances',
      items: [{ text: 'Theming', link: '/advances/theming' }],
    },
    {
      text: 'API Reference',
      items: [
        { text: 'Core', link: '/api/core' },
        { text: 'Helper', link: '/api/helper' },
      ],
    },
  ]
}
