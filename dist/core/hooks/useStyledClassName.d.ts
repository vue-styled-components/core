import { ComponentInstance } from 'vue';

export declare function useStyledClassName(): {
    getStyledClassName: (target: ComponentInstance<any>) => string;
    styledClassNameMap: Record<string, string>;
};
