declare module '@vue3-styled-components/package' {
  export { styled, keyframes, ThemeProvider, createGlobalStyle } from './index'
}

declare module '@vue/test-utils' {
  export function mount(component: any, options?: any): any
}
