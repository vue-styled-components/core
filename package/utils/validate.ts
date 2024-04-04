import { isTag, isStyledComponent, isVueComponent } from '@/utils'

export function isValidElementType(target: any) {
  return isTag(target) || isStyledComponent(target) || isVueComponent(target)
}
