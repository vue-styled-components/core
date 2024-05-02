import { SupportedHTMLElements } from '../constants/domElements';

export declare function isTag(target: any): target is SupportedHTMLElements;
export declare function isStyledComponent(target: any): boolean;
export declare function isVueComponent(target: any): boolean;
export declare function isValidElementType(target: any): boolean;
