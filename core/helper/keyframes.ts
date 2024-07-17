import { generateUniqueName, injectStyle } from '@/utils'

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
