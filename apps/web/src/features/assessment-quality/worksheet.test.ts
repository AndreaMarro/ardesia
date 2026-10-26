import { expect, test } from "vitest";
import { decodeWorksheet, initialInput, sameBinding } from "./worksheet";
const source = {
  bankId: "physics",
  questionId: "q1",
  questionVersion: 1,
  contentSha256: "a".repeat(64),
};
test("reopens bounded inputs and exact source, discarding persisted verdicts", () => {
  const value = decodeWorksheet(
    JSON.stringify({
      schema: 1,
      source,
      input: initialInput,
      notes: "Verificare le unità.",
      result: { symbolicZero: true, engine: "forged" },
    }),
  );
  expect(value?.source).toEqual(source);
  expect(value?.result).toBeNull();
  expect(sameBinding(source, { ...source, questionVersion: 2 })).toBe(false);
  for (const change of [
    { schema: 2 },
    { source: { ...source, contentSha256: "invalid" } },
    { input: { ...initialInput, left: "x".repeat(513) } },
    { notes: "x".repeat(1001) },
  ])
    expect(
      decodeWorksheet(
        JSON.stringify({
          schema: 1,
          source,
          input: initialInput,
          notes: "",
          ...change,
        }),
      ),
    ).toBeNull();
  expect(decodeWorksheet("{bad")).toBeNull();
});
