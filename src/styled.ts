import { defineComponent, type DefineSetupFnComponent, h, ref} from 'vue';
import domElements, {SupportedHTMLElements} from "./domElements";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyledFactory = (styles: TemplateStringsArray) => DefineSetupFnComponent<Record<string, any>>;

function baseStyled(tag: string): StyledFactory {

  return function (styles: TemplateStringsArray) {
    return defineComponent((props, {slots}) => {
      const styledComponent = ref(tag);

      const className = 'styled-' + Math.random().toString(36).substring(7); // Generate a random class name
      const styleString = styles.join(' ');

      // Apply the styles as a global CSS rule with the generated class name
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `.${className} { ${styleString} }`;
      document.head.appendChild(styleTag);
      console.log(slots.default?.())
      return () => {
        return h(
          styledComponent.value,
          {
            class: className,
          },
          slots.default?.()
        );
      }
    })
  };
}

const styled = baseStyled as typeof baseStyled & {
  [E in SupportedHTMLElements]: StyledFactory;
};

// Create styled components for each DOM element
domElements.forEach((domElement: SupportedHTMLElements) => {
  styled[domElement] = baseStyled(domElement);
});

export {styled};
