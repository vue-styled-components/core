import { DefaultTheme } from '@/src/providers/theme'
import { inject } from 'vue'

export const useTheme = () => {
  return inject<DefaultTheme>('$theme', {})
}
