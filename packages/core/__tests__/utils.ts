export const getStyle = (element: Element | null) => {
  if (!element) return undefined

  return window.getComputedStyle(element)
}
