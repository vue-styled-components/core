export function tw(classNames: TemplateStringsArray, ...expressions: string[]): any {
  return {
    source: 'tw',
    value: classNames[0]
      ?.replace(/(\s|\\n)+/g, ' ')
      .trim()
      .split(' ')
      .concat(expressions),
  }
}
