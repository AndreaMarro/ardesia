import { ComputeEngine, version } from "./vendor/compute-engine.js";
import type {
  Expression,
  MathJsonExpression,
} from "./vendor/compute-engine.js";

export const ENGINE = `Cortex Compute Engine ${version}`;
export type CasInput = {
  left: string;
  right: string;
  values: string;
  differentiate: string;
  domain: string;
};
export type CasResult = {
  engine: string;
  left: { exact: string; approximate: string; atValues: string };
  right: { exact: string; approximate: string; atValues: string };
  difference: string;
  symbolicZero: boolean;
  derivative: string;
  restrictions: string[];
};
const pure = new Set([
  "Add",
  "Subtract",
  "Negate",
  "Multiply",
  "InvisibleOperator",
  "Divide",
  "Rational",
  "Power",
  "Sqrt",
  "Abs",
  "Sin",
  "Cos",
  "Tan",
  "Ln",
  "Exp",
  "Delimiter",
]);
type Guard = {
  expression: MathJsonExpression;
  rule: "nonzero" | "positive" | "nonnegative";
  label: string;
};
function fail(message: string): never {
  throw new Error(message);
}

export function validateInput(value: CasInput) {
  if (!value || typeof value !== "object") fail("Dati del calcolo non validi.");
  for (const key of [
    "left",
    "right",
    "values",
    "differentiate",
    "domain",
  ] as const)
    if (
      typeof value[key] !== "string" ||
      value[key].length > (key === "domain" ? 1000 : 512)
    )
      fail("Input troppo lungo o non valido.");
  if (!value.left.trim() || !value.right.trim())
    fail("Scrivi entrambe le espressioni.");
  if (
    value.differentiate &&
    (!/^[a-z]$/.test(value.differentiate) ||
      ["e", "i"].includes(value.differentiate))
  )
    fail(
      "Scegli una sola lettera per la derivata, diversa dalle costanti e e i.",
    );
  const values: Record<string, number | [number, number]> = {};
  if (value.values.trim())
    for (const assignment of value.values.split(/[;,]/)) {
      const match = assignment
        .trim()
        .match(
          /^([a-z])\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(?:\s*\/\s*([+-]?\d+))?$/i,
        );
      if (
        !match ||
        match[1] !== match[1].toLowerCase() ||
        ["e", "i"].includes(match[1]) ||
        match[1] in values
      )
        fail(
          "Valori: usa lettere distinte diverse da e e i, ad esempio x=2; y=3/4.",
        );
      const n = Number(match[2]),
        d = match[3] ? Number(match[3]) : 1;
      if (n === 0 && /[1-9]/.test(match[2].split(/e/i)[0]))
        fail(
          "Valore troppo piccolo per la sostituzione numerica: usa una scala diversa.",
        );
      if (
        !Number.isFinite(n) ||
        !Number.isFinite(d) ||
        d === 0 ||
        Math.abs(n) > 1e12 ||
        Math.abs(d) > 1e12
      )
        fail(
          "Valori finiti richiesti, modulo massimo 10¹² e denominatore diverso da zero.",
        );
      values[match[1]] = match[3] ? [n, d] : n;
    }
  return values;
}

/** Inspect raw MathJSON BEFORE any canonicalization: cancellation can erase domains.
 * Only a pure, bounded arithmetic language is admitted; no Assign, callbacks or compile.
 * A new engine per request also prevents assumptions/values leaking across worksheets. */
export function calculate(input: CasInput): CasResult {
  const values = validateInput(input),
    ce = new ComputeEngine(),
    guards: Guard[] = [];
  let nodes = 0;
  function inspect(node: MathJsonExpression, depth = 0): void {
    if (++nodes > 160 || depth > 16)
      fail("Espressione troppo complessa: riduci il numero di passaggi.");
    if (typeof node === "number") {
      if (!Number.isFinite(node) || Math.abs(node) > 1e12)
        fail("Costante fuori dal limite 10¹².");
      return;
    }
    if (typeof node === "string") {
      if (!/^[a-z]$/.test(node) && !["Pi", "ExponentialE"].includes(node))
        fail("Sono ammesse lettere minuscole, π ed e.");
      return;
    }
    if (
      !Array.isArray(node) ||
      typeof node[0] !== "string" ||
      !pure.has(node[0])
    )
      fail(
        "Operazione non supportata: usa aritmetica, potenze, radice, valore assoluto, seno, coseno, tangente o logaritmo naturale.",
      );
    const [op, ...args] = node as readonly MathJsonExpression[];
    for (const arg of args) inspect(arg, depth + 1);
    const guard = (expression: MathJsonExpression, rule: Guard["rule"]) =>
      guards.push({
        expression,
        rule,
        label: `${ce.box(expression, { form: "raw" }).toString()} ${rule === "nonzero" ? "≠ 0" : rule === "positive" ? "> 0" : "≥ 0"}`,
      });
    if (op === "Divide" || op === "Rational") guard(args[1], "nonzero");
    if (op === "Sqrt") guard(args[0], "nonnegative");
    if (op === "Ln") guard(args[0], "positive");
    if (op === "Tan") guard(["Cos", args[0]], "nonzero");
    if (op === "Power") {
      // Symbolic exponents can evade a numeric budget; keep this consumer finite.
      const power = ce.box(args[1]).evaluate();
      if (
        power.freeVariables.length ||
        !Number.isFinite(power.re) ||
        Math.abs(power.re) > 128 ||
        power.im !== 0
      )
        fail("Esponente numerico richiesto, modulo massimo 128.");
      if (power.re <= 0) guard(args[0], "nonzero");
      if (!Number.isInteger(power.re)) guard(args[0], "nonnegative");
    }
  }
  const left = ce.parse(input.left, { form: "raw" }),
    right = ce.parse(input.right, { form: "raw" });
  inspect(left.json);
  inspect(right.json);
  if (!left.isValid || !right.isValid)
    fail("Espressione incompleta o non valida.");
  const substitutions = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? ce.box([
            value.every(Number.isSafeInteger) ? "Rational" : "Divide",
            ...value,
          ])
        : ce.number(value),
    ]),
  );
  for (const guard of guards) {
    const value = ce.box(guard.expression).subs(substitutions).evaluate();
    if (value.freeVariables.length) continue;
    if (
      !Number.isFinite(value.re) ||
      value.im !== 0 ||
      (guard.rule === "nonzero"
        ? value.re === 0
        : guard.rule === "positive"
          ? value.re <= 0
          : value.re < 0)
    )
      fail(`Valori fuori dal dominio: ${guard.label}.`);
  }
  const bounded = (value: Expression) => {
    const text = value.toString();
    if (text.length > 2000)
      fail("Risultato troppo lungo: suddividi il calcolo.");
    return text;
  };
  const describe = (value: Expression) => {
    const substituted = value.subs(substitutions).evaluate();
    if (
      !substituted.freeVariables.length &&
      (!Number.isFinite(substituted.re) || substituted.im !== 0)
    )
      fail("Risultato non reale o non finito con questi valori.");
    return {
      exact: bounded(value.simplify()),
      approximate: bounded(value.N()),
      atValues: bounded(substituted),
    };
  };
  const difference = ce.box(["Subtract", left.json, right.json]).simplify();
  return {
    engine: ENGINE,
    left: describe(left),
    right: describe(right),
    difference: bounded(difference),
    symbolicZero: difference.isSame(ce.number(0)),
    derivative: input.differentiate
      ? bounded(ce.box(["D", left.json, input.differentiate]).evaluate())
      : "",
    restrictions: [...new Set(guards.map((guard) => guard.label))],
  };
}
