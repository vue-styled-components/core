declare module '@vue-styled-components/core' {
  export {
    styled,
    keyframes,
    ThemeProvider,
    createGlobalStyle,
    withAttrs,
    isStyledComponent,
    isVueComponent,
    isTag,
    isValidElementType,
    useStyledClassName,
    css,
  } from './index'
}

declare module '@vue/test-utils' {
  export function mount(component: any, options?: any): any
}
