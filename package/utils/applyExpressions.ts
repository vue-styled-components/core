export function applyExpressions(chunks: any[], executionContext: Record<string, any>): string[] {
  return chunks.reduce((ruleSet, chunk) => {
    if (chunk === undefined || chunk === null || chunk === false || chunk === '') return ruleSet
    if (Array.isArray(chunk)) return [...ruleSet, ...applyExpressions(chunk, executionContext)]
    if (typeof chunk === 'function') {
      return executionContext ? ruleSet.concat(...applyExpressions([chunk(executionContext)], executionContext)) : ruleSet.concat(chunk)
    }
    return ruleSet.concat(chunk.toString())
  }, [])
}
