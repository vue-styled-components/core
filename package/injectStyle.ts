import { applyExpressions, ExpressionType } from '@/utils'

export default function injectStyle(className: string, cssWithExpression: (string | ExpressionType)[], context: Record<string, any>) {
  const appliedCss = applyExpressions(cssWithExpression, context).join('')

  // Create a style tag and append it to the head
  const styleTag = document.createElement('style')
  styleTag.innerHTML = `.${className} { ${appliedCss} }`
  document.head.appendChild(styleTag)
}
