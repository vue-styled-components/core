import { defineComponent, DefineSetupFnComponent, h, PropType, PublicProps, SlotsType, useSlots } from 'vue'
import domElements, { type SupportedHTMLElements } from '@/constants/domElements'
import { insertExpressionFns, applyExpressions, generateClassName, type ExpressionType, isVueComponent } from '@/utils'
import { isValidElementType } from '@/utils/validate'

interface IProps {
  as?: SupportedHTMLElements
}

type ComponentCustomProps = PublicProps & {
  styled: boolean
}

export type StyledComponentType = DefineSetupFnComponent<IProps, any, SlotsType<Record<string, any>>, any, ComponentCustomProps>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyledFactory = (styles: TemplateStringsArray, ...expressions: ExpressionType[]) => StyledComponentType
type StyledComponent = StyledFactory & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: <T extends Record<string, any>>(attrs: T) => StyledFactory
}
type Attrs = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function baseStyled(target: string | InstanceType<any>, props: Record<string, any> = {}): StyledComponent {
  if (!isValidElementType(target)) {
    throw Error('The element is invalid.')
  }
  let attributes: Attrs = {}
  const styledComponent: StyledComponent = function styledComponent(
    styles: TemplateStringsArray,
    ...expressions: ExpressionType[]
  ): StyledComponentType {
    const cssStringsWithExpression = insertExpressionFns(styles, expressions)

    const appliedCss = applyExpressions(cssStringsWithExpression, { ...props, ...attributes })

    return createStyledComponent(appliedCss.join(''))
  }
  styledComponent.attrs = function <T extends Record<string, any>>(attrs: T): StyledComponent {
    attributes = attrs
    return styledComponent
  }

  function createStyledComponent(cssString: string): StyledComponentType {
    return defineComponent(
      (props) => {
        // Generate a unique class name
        const className = generateClassName()
        if (attributes?.class) {
          attributes.class += ` ${className}`
        } else {
          attributes.class = className
        }

        // Create a style tag and append it to the head
        const styleTag = document.createElement('style')
        styleTag.innerHTML = `.${className} { ${cssString} }`
        document.head.appendChild(styleTag)

        // Return the render function
        return () => {
          const slot = useSlots()
          return h(
            isVueComponent(target) ? target : props?.as || target,
            {
              ...attributes
            },
            slot
          )
        }
      },
      {
        props: {
          as: {
            type: String as PropType<SupportedHTMLElements>
          }
        },
        styled: true
      } as any
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
