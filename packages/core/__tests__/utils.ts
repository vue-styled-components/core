import { configureStyleProcessing } from '../index'

export function presetBasicEnv() {
  configureStyleProcessing({
    enableBatchUpdates: false,
    enableCache: false,
  })
}

export function getStyle(element: Element | null) {
  if (!element)
    return undefined

  return window.getComputedStyle(element)
}
