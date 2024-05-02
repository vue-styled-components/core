import { ComponentInstance, DefineSetupFnComponent } from 'vue';

export declare function withAttrs<T extends Record<string, unknown>>(target: string | ComponentInstance<any>, attrs: T): DefineSetupFnComponent<any>;
