import { applyExpressions, ExpressionType, insertExpressions } from '@/utils'

export function injectStyle(className: string, cssWithExpression: (string | ExpressionType)[], context: Record<string, any>) {
  const appliedCss = applyExpressions(cssWithExpression, context).join('')

  // Create a style tag and append it to the head
  const styleTag = document.createElement('style')
  styleTag.innerHTML = `.${className} { ${appliedCss} }`
  document.head.appendChild(styleTag)
}

export function createGlobalStyle(css: TemplateStringsArray, expressions: string[]) {
  // Create a style tag and append it to the head
  const styleTag = document.createElement('style')
  styleTag.innerHTML = insertExpressions(css, expressions).join('')
  document.head.appendChild(styleTag)
}
