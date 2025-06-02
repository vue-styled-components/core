import { configureStyleProcessing } from '../index'

export function presetBasicEnv() {
  configureStyleProcessing({
    enableBatchUpdates: false,
    enableCache: false,
  })
}
