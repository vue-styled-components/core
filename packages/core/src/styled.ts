import {
  defineComponent,
  DefineSetupFnComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  PropType,
  PublicProps,
  reactive,
  ref,
  SlotsType,
  watch,
} from 'vue'
import domElements, { type SupportedHTMLElements } from '@/src/constants/domElements'
import { type ExpressionType, generateClassName, generateComponentName, insertExpressions, injectStyle, removeStyle } from '@/src/utils'
import { isStyledComponent, isValidElementType, isVueComponent } from '@/src/helper'
import { DefaultTheme } from './providers/theme'

interface IProps {
  as?: PropType<SupportedHTMLElements>
}

type ComponentCustomProps = PublicProps & {
  styled: boolean
}

export type StyledComponentType<P = any> = DefineSetupFnComponent<IProps & P, any, SlotsType, IProps & P, ComponentCustomProps>

type StyledFactory = <T = Record<string, any>>(
  styles: TemplateStringsArray,
  ...expressions: (ExpressionType<T & { theme: DefaultTheme }> | ExpressionType<T & { theme: DefaultTheme }>[])[]
) => StyledComponentType
type StyledComponent = StyledFactory & {
  attrs: <T extends Record<string, unknown>>(attrs: T) => StyledFactory
}
type Attrs = Record<string, any>

function baseStyled<P extends Record<string, any>>(target: string | InstanceType<any>, propsDefinition?: P & IProps): StyledComponent {
  if (!isValidElementType(target)) {
    throw Error('The element is invalid.')
  }
  let attributes: Attrs = {}
  function styledComponent<T>(
    styles: TemplateStringsArray,
    ...expressions: (ExpressionType<T> | ExpressionType<T>[])[]
  ): StyledComponentType {
    const cssStringsWithExpression = insertExpressions<T>(styles, expressions)
    return createStyledComponent<T>(cssStringsWithExpression)
  }

  styledComponent.attrs = function <T extends Record<string, any>>(attrs: T): StyledComponent {
    attributes = attrs
    return styledComponent
  }

  function createStyledComponent<T>(cssWithExpression: ExpressionType<T & { theme: DefaultTheme }>[]): StyledComponentType {
    let type: string = target
    if (isVueComponent(target)) {
      type = 'vue-component'
    }
    if (isStyledComponent(target)) {
      type = 'styled-component'
    }

    const componentName = generateComponentName(type)
    return defineComponent(
      (props, { slots }) => {
        const tailwindClasses = ref<string[]>([])
        const myAttrs = ref({ class: '', ...attributes })
        const theme = inject<Record<string, string | number>>('$theme', reactive({}))
        let context = {
          theme,
          ...props,
        }

        const defaultClassName = generateClassName()

        myAttrs.value.class += ` ${defaultClassName}`

        // Inject the tailwind classes to the class attribute
        watch(
          tailwindClasses,
          (classNames) => {
            myAttrs.value.class += ` ${defaultClassName} ${classNames.join(' ')}`
          },
          { deep: true },
        )

        watch(
          [theme, props],
          () => {
            context = {
              theme,
              ...props,
            }
            tailwindClasses.value = injectStyle<T & { theme: DefaultTheme }>(defaultClassName, cssWithExpression, context)
          },
          {
            deep: true,
          },
        )

        onMounted(() => {
          tailwindClasses.value = injectStyle<T & { theme: DefaultTheme }>(defaultClassName, cssWithExpression, context)
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
              ...myAttrs.value,
            },
            slots,
          )
        }
      },
      {
        name: componentName,
        props: {
          as: {
            type: String as PropType<SupportedHTMLElements>,
          },
          ...propsDefinition,
        },
        inheritAttrs: true,
      },
    )
  }

  return styledComponent
}

/** Append all the supported HTML elements to the styled properties */
const styled = baseStyled as typeof baseStyled & {
  [E in SupportedHTMLElements]: StyledComponent
}

domElements.forEach((domElement: SupportedHTMLElements) => {
  styled[domElement] = baseStyled(domElement)
})

export { styled }
