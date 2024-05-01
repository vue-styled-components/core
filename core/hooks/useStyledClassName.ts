import { ComponentInstance, reactive } from 'vue'

const styledClassNameMap = reactive<Record<string, string>>({})

export function useStyledClassName(): {
  getStyledClassName: (target: ComponentInstance<any>) => string
  styledClassNameMap: Record<string, string>
} {
  const getStyledClassName = (target: ComponentInstance<any>): string => {
    return styledClassNameMap[target.name]
  }

  return {
    getStyledClassName,
    styledClassNameMap,
  }
}
