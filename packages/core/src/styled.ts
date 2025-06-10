import type { SupportedHTMLElements } from '@/src/constants/domElements'
import type { ExpressionType } from '@/src/utils'
import type {
  ComponentObjectPropsOptions,
  DefineSetupFnComponent,
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

// 构造函数到类型的映射
type ConstructorToType<T> = T extends { type: infer U }
  ? ConstructorToType<U>
  : T extends StringConstructor
    ? string
    : T extends NumberConstructor
      ? number
      : T extends BooleanConstructor
        ? boolean
        : T extends DateConstructor
          ? Date
          : T extends ArrayConstructor
            ? any[]
            : T extends ObjectConstructor
              ? object
              : T

export type PropsDefinition<T> = {
  [K in keyof T]: T[K]
}

// CSS样式对象类型
type CSSStyleObject = Record<string, string | number>

// 样式函数类型
type StyleFunction<T> = (props: BaseContext<T>) => CSSStyleObject

// 定义 styledComponent 类型
interface StyledComponent<T extends object> {
  // 支持模板字符串
  <P>(
    styles: TemplateStringsArray,
    ...expressions: (
      | ExpressionType<BaseContext<P & TransformProps<T>>>
      | ExpressionType<BaseContext<P & TransformProps<T>>>[]
    )[]
  ): DefineSetupFnComponent<{ as?: string, props?: P } & TransformProps<T> & P & HTMLAttributes>

  // 支持CSS对象
  <P>(
    styles: CSSStyleObject | StyleFunction<P & TransformProps<T>>
  ): DefineSetupFnComponent<{ as?: string, props?: P } & TransformProps<T> & P & HTMLAttributes>

  attrs: <A = object>(
    attrs: A | ((props: TransformProps<T> & A) => A),
  ) => StyledComponent<A & T>

  // 支持泛型参数的类型定义
  <P extends object>(props: PropsDefinition<P>): StyledComponent<P & T>

  // 支持单独的props函数链式调用
  props: <P extends object>(propsDefinition: PropsDefinition<P>) => StyledComponent<P & T>
}

// 类型辅助函数，用于在编译时转换 props 类型
type TransformProps<T> = {
  [K in keyof T as T[K] extends { required: true }
    ? T[K] extends { default: any }
      ? never
      : K
    : never
  // eslint-disable-next-line unused-imports/no-unused-vars
  ]: T[K] extends { type: infer U, required?: boolean, default?: infer D }
    ? ConstructorToType<U>
    : ConstructorToType<T[K]>
} & {
  [K in keyof T as T[K] extends { required: true }
    ? T[K] extends { default: any }
      ? K
      : never
    : K
  // eslint-disable-next-line unused-imports/no-unused-vars
  ]?: T[K] extends { type: infer U, required?: boolean, default?: infer D }
    ? ConstructorToType<U>
    : ConstructorToType<T[K]>
}

function baseStyled<T extends object>(target: string | InstanceType<any>, propsDefinition?: PropsDefinition<T>): StyledComponent<T> {
  if (!isValidElementType(target)) {
    throw new Error('The element is invalid.')
  }
  let defaultAttrs: unknown
  function styledComponent<P>(
    stylesOrProps: TemplateStringsArray | PropsDefinition<P> | CSSStyleObject | StyleFunction<P & TransformProps<T>>,
    ...expressions: (
      | ExpressionType<BaseContext<P & TransformProps<T>>>
      | ExpressionType<BaseContext<P & TransformProps<T>>>[]
    )[]
  ): any {
    // 处理样式函数
    if (typeof stylesOrProps === 'function') {
      const styleFunction = stylesOrProps as StyleFunction<BaseContext<P & TransformProps<T>>>
      return createStyledComponentFromFunction<P>(styleFunction)
    }

    // 处理CSS对象或props定义
    if (!Array.isArray(stylesOrProps)) {
      // 检查是否为props定义（包含type、required、default等属性）
      const hasPropsDefinitionKeys = Object.values(stylesOrProps).some(value =>
        value && typeof value === 'object' && ('type' in value || 'required' in value || 'default' in value),
      )

      if (!hasPropsDefinitionKeys) {
        // 是CSS对象
        const cssObject = stylesOrProps as CSSStyleObject
        return createStyledComponentFromObject<P>(cssObject)
      }
      else {
        // 是props定义
        return baseStyled(target, { ...propsDefinition, ...stylesOrProps } as PropsDefinition<T & P>) as StyledComponent<T & P>
      }
    }

    // 正常的样式模板字符串处理
    const cssStringsWithExpression = insertExpressions(stylesOrProps as TemplateStringsArray, expressions)
    return createStyledComponent<P>(cssStringsWithExpression)
  }

  styledComponent.attrs = function <A = object>(
    attrs: object | ((props: PropsDefinition<T> & A) => object),
  ) {
    defaultAttrs = attrs
    return styledComponent
  }

  // 添加props方法支持链式调用
  styledComponent.props = function <P extends object>(newPropsDefinition: PropsDefinition<P>) {
    return baseStyled(target, { ...propsDefinition, ...newPropsDefinition } as PropsDefinition<T & P>) as StyledComponent<T & P>
  }

  // 将CSS对象转换为CSS字符串
  function cssObjectToString(cssObject: CSSStyleObject): string {
    return Object.entries(cssObject)
      .map(([key, value]) => {
        // 将驼峰命名转换为kebab-case
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `${kebabKey}: ${value};`
      })
      .join(' ')
  }

  // 从CSS对象创建组件
  function createStyledComponentFromObject<P>(cssObject: CSSStyleObject) {
    const cssString = cssObjectToString(cssObject)
    const cssWithExpression = [cssString] as ExpressionType<any>[]
    return createStyledComponent<P>(cssWithExpression)
  }

  // 从样式函数创建组件
  function createStyledComponentFromFunction<P>(styleFunction: StyleFunction<BaseContext<P & TransformProps<T>>>) {
    // 创建一个表达式函数，在运行时调用样式函数
    const cssWithExpression = [(props: BaseContext<P & TransformProps<T>>) => {
      const cssObject = styleFunction(props)
      return cssObjectToString(cssObject)
    }] as ExpressionType<any>[]
    return createStyledComponent<P>(cssWithExpression)
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
        } as ComponentObjectPropsOptions<{ as?: string, props?: P } & PropsDefinition<T>>,
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
