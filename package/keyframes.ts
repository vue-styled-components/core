import { injectStyle } from '@/injectStyle'
import { generateUniqueName } from '@/utils'

export function keyframes(kfString: TemplateStringsArray) {
  const keyframeName = `kf-${generateUniqueName()}`
  injectStyle(
    'keyframes',
    [
      `
        @keyframes ${keyframeName} {
          ${kfString.join('')}
        }
      `
    ],
    {}
  )
  return keyframeName
}
