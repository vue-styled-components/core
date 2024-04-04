import domElements, { SupportedHTMLElements } from '@/constants/domElements'

export function isTag(target: any) {
  return typeof target === 'string' && domElements.has(target as SupportedHTMLElements)
}

export function isStyledComponent(target: any) {
  console.log(target)
  return typeof target === 'object' && 'styled' in target
}

export function isVueComponent(target: any) {
  return target && (typeof target.render === 'function' || typeof target.template === 'string')
}
