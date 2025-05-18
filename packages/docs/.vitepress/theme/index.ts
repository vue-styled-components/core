import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import BenchmarkReport from './components/BenchmarkReport.vue'
import BenchmarkReportEn from './components/BenchmarkReportEn.vue'
import { useComponents } from './useComponents'
import './style.css'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import './styles/vars.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    useComponents(ctx.app)
    // 注册全局组件
    ctx.app.component('BenchmarkReport', BenchmarkReport)
    ctx.app.component('BenchmarkReportEn', BenchmarkReportEn)
  },
} satisfies Theme
