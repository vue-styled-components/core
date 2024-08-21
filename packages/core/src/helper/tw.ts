export interface TailwindObject {
  source: string
  value: (string | number)[]
}

export function tw(classNames: TemplateStringsArray, ...expressions: (string | number)[]): TailwindObject {
  // const raw
  const result = mergeTemplateStrings(classNames, expressions)
  return {
    source: 'tw',
    value: result
      ?.replace(/(\s|\\n)+/g, ' ')
      .trim()
      .split(' '),
  }
}

function mergeTemplateStrings(templateStrings: TemplateStringsArray, values: any[]) {
  let result = templateStrings[0]
  for (let i = 0; i < values.length; i++) {
    result += values[i] + templateStrings[i + 1]
  }
  return result
}
