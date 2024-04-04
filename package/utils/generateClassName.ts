import { CLASS_PREFIX } from '@/constants/constants'

export function generateClassName() {
  return `${CLASS_PREFIX}-${Math.random().toString(36).substring(4)}`
}
