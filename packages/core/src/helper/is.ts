import type { SupportedHTMLElements } from '@/src/constants/domElements'
import domElements from '@/src/constants/domElements'

export function isTag(target: any): target is SupportedHTMLElements {
  return typeof target === 'string' && domElements.has(target as SupportedHTMLElements)
}

export function isStyledComponent(target: any): boolean {
  return typeof target === 'object' && target?.name?.includes('styled')
}

export function isVueComponent(target: any): boolean {
  return target && (typeof target.setup === 'function' || typeof target.render === 'function' || typeof target.template === 'string')
}

export function isValidElementType(target: any): boolean {
  return isTag(target) || isStyledComponent(target) || isVueComponent(target)
}
