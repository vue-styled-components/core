import { defineComponent, DefineSetupFnComponent, h, PropType, PublicProps, ref, SlotsType } from 'vue'
import domElements, { type SupportedHTMLElements } from '@/constants/domElements'
import generateClassName from '@/utils/generateClassName'
import parseCSS from '@/utils/parser'

interface IProps {
  as?: SupportedHTMLElements
}

type Attrs = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyledFactory = (styles: TemplateStringsArray) => DefineSetupFnComponent<IProps, any, SlotsType<Record<string, any>>, any, PublicProps>
type StyledComponent = StyledFactory & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: <T extends Record<string, any>>(attrs: T) => StyledFactory
}

function baseStyled(tag: string, props?: Record<string, any>): StyledComponent {
  let cssString = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let attributes: Attrs = {}
  const styledComponent: StyledComponent = function (styles: TemplateStringsArray, ...interpolations) {
    console.log(styles, interpolations)
    return createStyledComponent(styles)
  }
  styledComponent.attrs = function <T extends Record<string, any>>(attrs: T): StyledFactory {
    attributes = attrs
    return styledComponent
  }

  function createStyledComponent(styles: TemplateStringsArray) {
    return defineComponent(
      (props, { slots }) => {
        const { as } = props
        console.log(props)
        const styledComponent = ref(as)
        // 生成一个随机的类名W
        const className = generateClassName()
        if (attributes?.class) {
          attributes.class += ` ${className}`
        } else {
          attributes.class = className
        }

        cssString = styles?.join(' ')

        parseCSS(cssString)

        // 创建一个 style 标签并插入到 head 中
        const styleTag = document.createElement('style')
        styleTag.innerHTML = `.${className} { ${cssString} }`
        document.head.appendChild(styleTag)

        // 返回渲染函数
        return () => {
          return h(
            styledComponent.value,
            {
              ...attributes
            },
            slots.default?.()
          )
        }
      },
      {
        props: {
          as: {
            type: String as PropType<SupportedHTMLElements>,
            default: tag
          }
        }
      }
    )
  }

  return styledComponent
}

const styled = baseStyled as typeof baseStyled & {
  [E in SupportedHTMLElements]: StyledComponent
}

domElements.forEach((domElement: SupportedHTMLElements) => {
  styled[domElement] = baseStyled(domElement)
})

export { styled }
