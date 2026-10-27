/** Ardesia's narrow adapter boundary, checked against upstream 0.152.0 declarations
 * and the unmodified shipped ESM files listed in vendor-manifest.json.
 * This is not a replacement implementation or a declaration of the entire API.
 */
export type MathJsonExpression =
  number | string | readonly MathJsonExpression[] | Record<string, unknown>;
export interface Expression {
  readonly json: MathJsonExpression;
  readonly isValid: boolean;
  readonly freeVariables: readonly string[];
  readonly re: number;
  readonly im: number;
  toString(): string;
  simplify(): Expression;
  evaluate(): Expression;
  N(): Expression;
  subs(values: Record<string, Expression>): Expression;
  isSame(value: Expression): boolean;
}
export declare class ComputeEngine {
  parse(latex: string, options?: { form: "raw" }): Expression;
  box(value: MathJsonExpression, options?: { form: "raw" }): Expression;
  number(value: number): Expression;
}
export declare const version: "0.152.0";
