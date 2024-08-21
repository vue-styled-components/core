export function applyExpressions(chunks: any[], executionContext: Record<string, any>, tailwindClasses: string[]): string[] {
  return chunks.reduce((ruleSet, chunk) => {
    if (chunk === undefined || chunk === null || chunk === false || chunk === '') {
      return ruleSet
    }
    if (Array.isArray(chunk)) {
      return [...ruleSet, ...applyExpressions(chunk, executionContext, tailwindClasses)]
    }

    if (typeof chunk === 'function') {
      return ruleSet.concat(...applyExpressions([chunk(executionContext)], executionContext, tailwindClasses))
    }

    if (typeof chunk === 'object' && chunk?.source === 'tw') {
      tailwindClasses.push(...chunk.value)
      return ruleSet
    }

    return ruleSet.concat(chunk.toString())
  }, [])
}
