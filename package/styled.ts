import { defineComponent, DefineSetupFnComponent, h, PropType, PublicProps, ref, SlotsType } from 'vue';
import domElements, { SupportedHTMLElements } from './domElements';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyledFactory = (
  styles: TemplateStringsArray
) => DefineSetupFnComponent<IProps, any, SlotsType<Record<string, any>>, any, PublicProps>;
type StyledComponent = StyledFactory & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: <T>(attrs: T) => StyledFactory;
};

interface IProps {
  as?: SupportedHTMLElements;
}

function baseStyled(tag: string): StyledComponent {
  let cssString = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let attributes: any = {};

  const styledComponent: StyledComponent = function (styles: TemplateStringsArray) {
    return createStyledComponent(styles);
  };
  styledComponent.attrs = function <T>(attrs: T): StyledFactory {
    attributes = attrs;
    return styledComponent;
  };

  function createStyledComponent(styles: TemplateStringsArray) {
    return defineComponent(
      (props, { slots }) => {
        // 定义 props 对象来接收传入的属性
        const { as } = props;
        // 使用 ref 创建响应式的组件标签名
        const styledComponent = ref(as ?? tag);
        // 生成一个随机的类名
        const className = `styled-${Math.random().toString(36).substring(4)}`;
        if (attributes?.class) {
          attributes.class += ` ${className}`;
        } else {
          attributes.class = className;
        }

        cssString = styles?.join(' ');
        // 创建一个 style 标签并插入到 head 中
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `.${className} { ${cssString} }`;
        document.head.appendChild(styleTag);

        // 返回渲染函数
        return () => {
          return h(
            styledComponent.value,
            {
              ...attributes
            },
            slots.default?.()
          );
        };
      },
      {
        props: {
          as: {
            type: String as PropType<SupportedHTMLElements>,
            default: tag
          }
        }
      }
    );
  }

  return styledComponent;
}

const styled = baseStyled as typeof baseStyled & {
  [E in SupportedHTMLElements]: StyledComponent;
};

domElements.forEach((domElement: SupportedHTMLElements) => {
  styled[domElement] = baseStyled(domElement);
});

export { styled };
