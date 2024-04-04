import { CLASS_PREFIX, COMPONENT_PREFIX } from '@/constants/constants'

export function generateComponentName(target: string) {
  return `${COMPONENT_PREFIX}-${target}-${Math.random().toString(36).substring(4)}`
}

export function generateClassName() {
  return `${CLASS_PREFIX}-${Math.random().toString(36).substring(4)}`
}
