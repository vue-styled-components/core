import {
  defineComponent,
  DefineSetupFnComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  PropType,
  PublicProps,
  Ref,
  SlotsType,
  watch,
} from 'vue'
import domElements, { type SupportedHTMLElements } from '@/src/constants/domElements'
import { type ExpressionType, generateClassName, generateComponentName, insertExpressions, injectStyle, removeStyle } from '@/src/utils'
import { isStyledComponent, isValidElementType, isVueComponent } from '@/src/helper'

interface IProps {
  as?: PropType<SupportedHTMLElements>
}

type ComponentCustomProps = PublicProps & {
  styled: boolean
}

export type StyledComponentType<P = any> = DefineSetupFnComponent<IProps & P, any, SlotsType, IProps & P, ComponentCustomProps>

type StyledFactory = <T = Record<string, any>>(
  styles: TemplateStringsArray,
  ...expressions: (ExpressionType<T> | ExpressionType<T>[])[]
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

  function createStyledComponent<T>(cssWithExpression: ExpressionType<T>[]): StyledComponentType {
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
        const myAttrs = { ...attributes }
        const theme = inject<Ref<Record<string, string | number>>>('$theme')
        let context = {
          theme: theme?.value ?? {},
          ...props,
        }

        myAttrs.class = generateClassName()

        watch(
          [theme, props],
          () => {
            context = {
              theme: theme?.value ?? {},
              ...props,
            }
            injectStyle<T>(myAttrs.class, cssWithExpression, context)
          },
          {
            deep: true,
          },
        )

        onMounted(() => {
          injectStyle<T>(myAttrs.class, cssWithExpression, context)
        })

        onUnmounted(() => {
          removeStyle(myAttrs.class)
        })

        // Return the render function
        return () => {
          const node = isVueComponent(target) ? h(target, { as: props.as }) : props.as ?? target
          return h(
            node,
            {
              ...myAttrs,
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
