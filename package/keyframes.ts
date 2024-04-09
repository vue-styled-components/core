import { createGlobalStyle } from '@/injectStyle'

export function keyframes(kfString: TemplateStringsArray) {
  createGlobalStyle`
    @keyframes shhh {
      ${[kfString.join('')]}
    }
  `
  return 'shhh'
}
