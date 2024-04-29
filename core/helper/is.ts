import domElements, { SupportedHTMLElements } from '@/constants/domElements'

export function isTag(target: any) {
  return typeof target === 'string' && domElements.has(target as SupportedHTMLElements)
}

export function isStyledComponent(target: any) {
  return typeof target === 'object' && target?.name?.includes('styled')
}

export function isVueComponent(target: any) {
  return target && (typeof target.setup === 'function' || typeof target.render === 'function' || typeof target.template === 'string')
}

export function isValidElementType(target: any) {
  return isTag(target) || isStyledComponent(target) || isVueComponent(target)
}
