import type { CasInput, CasResult } from "./cas";
export const WORKSHEET_KIND = "assessment-quality-worksheet-v1";
export type Binding = {
  bankId: string;
  questionId: string;
  questionVersion: number;
  contentSha256: string;
};
export type Worksheet = {
  schema: 1;
  source: Binding;
  input: CasInput;
  notes: string;
  result: CasResult | null;
};
const fields = ["left", "right", "values", "differentiate", "domain"] as const;
export const initialInput: CasInput = {
  left: "x+x",
  right: "2x",
  values: "x=2",
  differentiate: "x",
  domain: "Variabili reali. Specificare qui ipotesi e unità del quesito.",
};
export function sameInput(a: CasInput, b: CasInput) {
  return fields.every((key) => a[key] === b[key]);
}
export function sameBinding(a: Binding, b: Binding) {
  return (
    a.bankId === b.bankId &&
    a.questionId === b.questionId &&
    a.questionVersion === b.questionVersion &&
    a.contentSha256 === b.contentSha256
  );
}
/** Core text is data, never executable CAS. Saved results are historical, rerun on reopen. */
export function decodeWorksheet(text: string): Worksheet | null {
  try {
    if (text.length > 18000) return null;
    const value = JSON.parse(text) as Worksheet,
      source = value.source,
      input = value.input;
    if (
      value.schema !== 1 ||
      !source ||
      !input ||
      !Number.isSafeInteger(source.questionVersion) ||
      source.questionVersion < 1 ||
      !/^[a-f0-9]{64}$/.test(source.contentSha256)
    )
      return null;
    if (
      ["bankId", "questionId"].some(
        (key) =>
          typeof source[key as keyof Binding] !== "string" ||
          String(source[key as keyof Binding]).length > 200,
      )
    )
      return null;
    if (
      fields.some(
        (key) =>
          typeof input[key] !== "string" ||
          input[key].length > (key === "domain" ? 1000 : 512),
      )
    )
      return null;
    if (typeof value.notes !== "string" || value.notes.length > 1000)
      return null;
    // Ignore stored result even if well-formed: it is not a trusted verdict or current calculation.
    return {
      schema: 1,
      source,
      input: Object.fromEntries(
        fields.map((key) => [key, input[key]]),
      ) as CasInput,
      notes: value.notes,
      result: null,
    };
  } catch {
    return null;
  }
}
