import { describe, expectTypeOf, it } from 'vitest'
import { ThemeProvider as TP } from '@/src/providers/theme'
import { styled, keyframes, createGlobalStyle, ThemeProvider } from '../index'

describe('export', () => {
  it('should export properly functions', async () => {
    expectTypeOf(ThemeProvider).toEqualTypeOf<typeof TP>()
    expectTypeOf(styled).toBeFunction()
    expectTypeOf(keyframes).toBeFunction()
    expectTypeOf(createGlobalStyle).toBeFunction()
  })
})
