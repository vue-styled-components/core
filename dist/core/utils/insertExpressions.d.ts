export type ExpressionType = ((props: Record<string, any>) => string | number) | string;
export declare function insertExpressions(strings: TemplateStringsArray, expressions: (ExpressionType | ExpressionType[])[]): ExpressionType[];
