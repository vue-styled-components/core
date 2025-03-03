import type { ThemeProvider as TP } from '@/src/providers/theme'
import { describe, expectTypeOf, it } from 'vitest'
import { createGlobalStyle, keyframes, styled, ThemeProvider } from '../index'

describe('export', () => {
  it('should export properly functions', async () => {
    expectTypeOf(ThemeProvider).toEqualTypeOf<typeof TP>()
    expectTypeOf(styled).toBeFunction()
    expectTypeOf(keyframes).toBeFunction()
    expectTypeOf(createGlobalStyle).toBeFunction()
  })
})
