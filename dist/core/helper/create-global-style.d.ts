import { DefineSetupFnComponent } from 'vue';
import { ExpressionType } from '../utils';

export declare const createGlobalStyle: (styles: TemplateStringsArray, ...expressions: ExpressionType[]) => DefineSetupFnComponent<any>;
