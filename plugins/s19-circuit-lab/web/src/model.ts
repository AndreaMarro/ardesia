export type Component = {
  id: string;
  kind: "R" | "V" | "I";
  a: string;
  b: string;
  value: string;
};
export type Step = {
  transcription: string;
  operation: string;
  first: string;
  second: string;
  claimed_value?: string;
};
export type CircuitDocument = {
  schema: "s19-circuit.v1";
  components: Component[];
  question: { quantity: "voltage" | "current"; target: string };
  prediction: string;
  trace: {
    schema: "student-trace.v1";
    circuit_fingerprint: string;
    steps: Step[];
  } | null;
  notes: string;
  layout: Record<string, { x: number; y: number }>;
};
export type Diagnosis = {
  outcome: string;
  message: string;
  step?: number;
  category?: string;
};
export type Lesson = {
  outcome: string;
  message?: string;
  answer?: { exact: string; decimal: string; unit: string; reference: string };
  verification?: {
    electrical_claim: string;
    backend: string;
    lesson: string;
    product_verified: boolean;
  };
  original?: string;
  source_sha?: string;
  lesson_build?: string;
  steps?: {
    title: string;
    explanation: string;
    equations: string[];
    svg: string;
  }[];
};
export type Result = {
  fingerprint: string;
  lesson: Lesson;
  diagnosis: Diagnosis | null;
};
export type Resource = { id: string; revisionId: string; text: string };
export type Transport = <T>(
  path: string,
  body?: unknown,
  key?: string,
) => Promise<T>;
export const defaultDocument: CircuitDocument = {
  schema: "s19-circuit.v1",
  components: [
    { id: "V1", kind: "V", a: "b", b: "0", value: "12" },
    { id: "R1", kind: "R", a: "b", b: "a", value: "100" },
    { id: "R2", kind: "R", a: "a", b: "0", value: "200" },
  ],
  question: { quantity: "voltage", target: "R2" },
  prediction: "",
  trace: null,
  notes: "",
  layout: {},
};
export function netlist(d: CircuitDocument): string {
  return [
    ...d.components.map(
      (c) =>
        `${c.id} ${c.a} ${c.b} ${c.value} ${{ R: "ohm", V: "volt", I: "ampere" }[c.kind]}`,
    ),
    `? ${d.question.quantity} ${d.question.target}`,
  ].join("\n");
}
export async function fingerprint(d: CircuitDocument) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(netlist(d)),
  );
  return Array.from(new Uint8Array(bytes), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
export function changed(
  d: CircuitDocument,
  components: Component[] = d.components,
): CircuitDocument {
  const nodes = new Set(components.flatMap((c) => [c.a, c.b]));
  const layout = Object.fromEntries(
    Object.entries(d.layout).filter(([id]) => nodes.has(id)),
  );
  return { ...d, components, layout, trace: null };
}
export const transferDocument: CircuitDocument = {
  ...defaultDocument,
  components: [
    { id: "I1", kind: "I", a: "0", b: "a", value: "3" },
    { id: "R1", kind: "R", a: "a", b: "0", value: "2" },
    { id: "R2", kind: "R", a: "a", b: "0", value: "4" },
  ],
  prediction: "",
  notes: "",
  layout: {},
};
