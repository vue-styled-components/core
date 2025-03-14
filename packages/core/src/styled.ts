import type { SupportedHTMLElements } from '@/src/constants/domElements'
import type { ExpressionType } from '@/src/utils'
import type {
  ComponentObjectPropsOptions,
  DefineSetupFnComponent,
  ExtractPropTypes,
  HTMLAttributes,
} from 'vue'
import type { DefaultTheme } from './providers/theme'
import domElements from '@/src/constants/domElements'
import { isStyledComponent, isValidElementType, isVueComponent } from '@/src/helper'
import { generateClassName, generateComponentName, injectStyle, insertExpressions, removeStyle } from '@/src/utils'
import {

  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'

export type BaseContext<T> = T & { theme: DefaultTheme }

export type PropsDefinition<T> = {
  [K in keyof T]: T[K]
}

// 定义 styledComponent 类型
interface StyledComponent<T extends object> {
  <P>(
    styles: TemplateStringsArray,
    ...expressions: (
      | ExpressionType<BaseContext<P & T>>
      | ExpressionType<BaseContext<P & T>>[]
    )[]
  ): DefineSetupFnComponent<{ as?: string, props?: P } & ExtractPropTypes<PropsDefinition<T & P>> & HTMLAttributes>

  attrs: <A = object>(
    attrs: object | ((props: PropsDefinition<T> & A) => object),
  ) => StyledComponent<A & ExtractPropTypes<PropsDefinition<T>>>

  // 支持泛型参数的类型定义
  <P extends object>(props: PropsDefinition<P>): StyledComponent<P & T>
}

function baseStyled<T extends object>(target: string | InstanceType<any>, propsDefinition?: PropsDefinition<T>): StyledComponent<T> {
  if (!isValidElementType(target)) {
    throw new Error('The element is invalid.')
  }
  let defaultAttrs: unknown
  function styledComponent<P>(
    stylesOrProps: TemplateStringsArray | PropsDefinition<P>,
    ...expressions: (
      | ExpressionType<BaseContext<P & ExtractPropTypes<PropsDefinition<T>>>>
      | ExpressionType<BaseContext<P & ExtractPropTypes<PropsDefinition<T>>>>[]
    )[]
  ) {
    // 处理泛型参数的情况，如 styled.div<Props>
    if (!Array.isArray(stylesOrProps)) {
      return baseStyled(target, { ...propsDefinition, ...stylesOrProps } as PropsDefinition<T & P>) as StyledComponent<T & P>
    }

    // 正常的样式模板字符串处理
    const cssStringsWithExpression = insertExpressions(stylesOrProps as TemplateStringsArray, expressions)
    return createStyledComponent<P>(cssStringsWithExpression)
  }

  styledComponent.attrs = function <A = object>(
    attrs: object | ((props: ExtractPropTypes<PropsDefinition<T>> & A) => object),
  ) {
    defaultAttrs = attrs
    return styledComponent
  }

  function createStyledComponent<P>(cssWithExpression: ExpressionType<any>[]) {
    let type: string = target
    if (isVueComponent(target)) {
      type = 'vue-component'
    }
    if (isStyledComponent(target)) {
      type = 'styled-component'
    }

    const componentName = generateComponentName(type)
    const commonClassName = generateClassName()
    const component = defineComponent(
      (props, { slots }) => {
        const internalAttrs = computed<Record<string, any>>(() => {
          if (typeof defaultAttrs === 'function') {
            return defaultAttrs(props)
          }
          if (typeof defaultAttrs === 'object') {
            return defaultAttrs
          }
          return {}
        })

        const tailwindClasses = ref<string[]>([])
        const internalProps = ref({ class: '', ...internalAttrs.value })
        const theme = inject<Record<string, string | number>>('$theme', reactive({}))

        let context = {
          theme,
          ...props,
          ...props.props,
          ...internalAttrs.value,
        }

        const defaultClassName = generateClassName()

        internalProps.value.class += ` ${defaultClassName} ${commonClassName}`

        // Inject the tailwind classes to the class attribute
        watch(
          tailwindClasses,
          (classNames) => {
            internalProps.value.class += ` ${classNames.join(' ')}`
          },
          { deep: true },
        )

        watch(
          [theme, props],
          () => {
            context = {
              ...internalProps.value,
              theme,
              ...props,
              ...props.props,
            }
            tailwindClasses.value = injectStyle(defaultClassName, cssWithExpression, context)
          },
          {
            deep: true,
          },
        )

        onMounted(() => {
          tailwindClasses.value = injectStyle(defaultClassName, cssWithExpression, context)
        })

        onUnmounted(() => {
          removeStyle(defaultClassName)
        })

        // Return the render function
        return () => {
          const node = isVueComponent(target) ? h(target, { as: props.as }) : props.as ?? target
          return h(
            node,
            {
              ...internalProps.value,
            },
            slots,
          )
        }
      },
      {
        name: componentName,
        props: {
          as: {
            type: String,
            required: false,
          },
          props: {
            type: Object,
            required: false,
          },
          ...propsDefinition,
        } as ComponentObjectPropsOptions<{ as?: string, props?: P } & ExtractPropTypes<PropsDefinition<T>>>,
        inheritAttrs: true,
      },
    ) as any
    component.custom = {
      className: commonClassName,
    }

    return component
  }

  return styledComponent as StyledComponent<T>
}

// 为styled添加attrs方法的类型定义
type StyledInterface = typeof baseStyled & {
  [E in SupportedHTMLElements]: StyledComponent<object>
}

/** Append all the supported HTML elements to the styled properties */
const styled = baseStyled as StyledInterface

domElements.forEach((domElement: SupportedHTMLElements) => {
  styled[domElement] = baseStyled(domElement)
})

export { styled as default, styled }
