import type { StudyResource } from "../../api";

type Component = { id: string; kind: "R" | "V" | "I"; a: string; b: string; value: string };
/** Render-safe projection only. The specialist Core remains the input validator. */
export function circuitSummary(resource: Pick<StudyResource, "kind" | "text">): {
  components: Component[]; quantity: "voltage" | "current"; target: string; prediction: string; notes: string;
} | null {
  if (resource.kind !== "s19-circuit" || resource.text.length > 40000) return null;
  try {
    const d = JSON.parse(resource.text);
    if (!d || d.schema !== "s19-circuit.v1" || !Array.isArray(d.components) || !d.components.length || d.components.length > 32 ||
      !d.components.every((c: Component) => c && [c.id, c.kind, c.a, c.b, c.value].every(v => typeof v === "string" && v.length <= 128) && ["R", "V", "I"].includes(c.kind)) ||
      !d.question || !["voltage", "current"].includes(d.question.quantity) || typeof d.question.target !== "string" || d.question.target.length > 128 ||
      typeof d.prediction !== "string" || d.prediction.length > 400 || typeof d.notes !== "string" || d.notes.length > 8000) return null;
    return { components: d.components, quantity: d.question.quantity, target: d.question.target, prediction: d.prediction, notes: d.notes };
  } catch { return null; }
}
