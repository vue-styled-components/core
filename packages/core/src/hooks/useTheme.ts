import type { DefaultTheme } from '@/src/providers/theme'
import { inject } from 'vue'

export function useTheme() {
  return inject<DefaultTheme>('$theme', {})
}
