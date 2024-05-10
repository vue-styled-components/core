import { injectStyle } from '@/utils/injectStyle'
import { generateUniqueName } from '@/utils'

export function keyframes(kfString: TemplateStringsArray): string {
  const keyframeName = `kf-${generateUniqueName()}`
  injectStyle(
    keyframeName,
    [
      `
        @keyframes ${keyframeName} {
          ${kfString.join('')}
        }
      `,
    ],
    {},
  )
  return keyframeName
}
