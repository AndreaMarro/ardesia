import { expect, test } from "vitest";
import { calculate, validateInput } from "./cas";
const input = {
  left: "x+x",
  right: "2x",
  values: "",
  differentiate: "x",
  domain: "x reale",
};

test("real donor retains exact fractions and symbolic reduction without numeric equality claims", () => {
  const result = calculate({
    ...input,
    left: "\\frac{1}{3}+\\frac{1}{6}",
    right: "\\frac{1}{2}",
  });
  expect(result.left.exact).toContain("1/2");
  expect(result.symbolicZero).toBe(true);
  expect(calculate(input).derivative).toBe("2");
});
test("captures excluded denominator before donor canonicalizes x/x to one", () => {
  const result = calculate({ ...input, left: "x/x", right: "1" });
  expect(result.symbolicZero).toBe(true);
  expect(result.restrictions.join(" ")).toContain("x");
  expect(result.restrictions.join(" ")).toContain("≠ 0");
  expect(() =>
    calculate({ ...input, left: "x/x", right: "1", values: "x=0" }),
  ).toThrow(/dominio/);
});

test("exposes the zero-exponent domain before encountering the degenerate zero-to-zero power", () => {
  expect(
    calculate({ ...input, left: "x^0", right: "1", values: "x=2" })
      .restrictions,
  ).toContain("x ≠ 0");
  expect(() =>
    calculate({ ...input, left: "x^0", right: "1", values: "x=0" }),
  ).toThrow();
});

test("supports decimal and scientific numerators accepted by the value grammar", () => {
  expect(
    calculate({ ...input, left: "x", right: "0", values: "x=1.5/2" }).left
      .atValues,
  ).toBe("0.75");
  expect(
    calculate({ ...input, left: "x", right: "0", values: "x=1e-2/2" }).left
      .atValues,
  ).toBe("0.005");
});

test("evaluates numeric substitutions before composing them into a quotient", () => {
  expect(calculate({ ...input, left: "x/x", right: "1", values: "x=1.5/2" }).left.atValues).toBe("1");
});
test("square root branch and unequal expressions never become a universal equality", () => {
  const result = calculate({
    ...input,
    left: "\\sqrt{x^2}",
    right: "x",
    values: "x=-2",
  });
  expect(result.left.atValues).toBe("2");
  expect(result.right.atValues).toBe("-2");
  expect(result.symbolicZero).toBe(false);
  expect(result.restrictions.join(" ")).toContain("≥ 0");
});
test("rejects mutation and unknown functions before canonicalization; each run has fresh state", () => {
  for (const left of [
    "x:=2",
    "\\operatorname{Random}()",
    "\\operatorname{foo}(x)",
    "\\int x dx",
  ])
    expect(() => calculate({ ...input, left })).toThrow();
  expect(calculate(input).left.exact).toContain("x");
});
test("finite budgets, unambiguous assignments and finite real substitutions", () => {
  for (const changed of [
    { left: "x^{999999}" },
    { left: "x".repeat(513) },
    { values: "x=1,x=2" },
    { values: "x=NaN" },
    { values: "x=1e999" },
    { values: "x=1e-999" },
    { values: "e=2" },
    { values: "i=2" },
    { differentiate: "xy" },
    { domain: "x".repeat(1001) },
  ])
    expect(() => calculate({ ...input, ...changed })).toThrow();
  expect(() =>
    validateInput({ ...input, values: "x=-2.5; y=3/4" }),
  ).not.toThrow();
  expect(
    calculate({ ...input, left: "3x+y", right: "0", values: "x=-2.5; y=3/4" })
      .left.atValues,
  ).toBe("-6.75");
});
