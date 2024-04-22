declare module 'csstype' {
  interface CSSStyleSheet {
    cssRules: Array<CSSStyleRule & { selectorText: string }>
  }
}
