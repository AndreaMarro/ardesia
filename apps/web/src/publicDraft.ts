import {publicActivityResult, publicSpringCase, publicTransferCase} from "./publicPreview";
import {publicPreviewData} from "./generated/publicPreviewData";

export type PublicDrafts = {
  poiseuille: {radius: number; boundary: string; prediction: string; transfer: boolean};
  hydrostatic: {depth: number; density: number; reference: string; prediction: string; transfer: boolean};
  spring: {force: number; stiffness: number; prediction: string; transfer: boolean};
};
export type PublicModel = keyof PublicDrafts;
const prefix = "ardesia.public-demo.v1.";
const fields: Record<PublicModel, string[]> = {
  poiseuille: ["radius", "boundary", "prediction", "transfer"],
  hydrostatic: ["depth", "density", "reference", "prediction", "transfer"],
  spring: ["force", "stiffness", "prediction", "transfer"],
};

function isDraft<M extends PublicModel>(model: M, value: unknown): value is PublicDrafts[M] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  if (Object.keys(data).length !== fields[model].length || fields[model].some(field => !(field in data))
      || typeof data.prediction !== "string" || data.prediction.length > 40 || typeof data.transfer !== "boolean") return false;
  const numeric = Number(data.prediction.replace(",", "."));
  if (data.prediction.trim() !== "" && (!Number.isFinite(numeric) || numeric < 0 || (model === "poiseuille" && numeric === 0))) return false;
  try {
    if (model === "poiseuille") {
      if (typeof data.radius !== "number" || typeof data.boundary !== "string") return false;
      publicActivityResult(data.radius, data.boundary, data.transfer ? publicTransferCase.id : undefined);
    } else if (model === "spring") {
      if (typeof data.force !== "number" || typeof data.stiffness !== "number") return false;
      publicSpringCase(data.force, data.stiffness);
    } else if (!publicPreviewData.hydrostatic.cases.some(entry => entry.parameters.depth === data.depth
      && entry.parameters.density === data.density && entry.parameters.reference === data.reference)) return false;
    return true;
  } catch {return false;}
}

/** Explicit local UI copies only: no result, score, identity or server authority. */
export function readPublicDraft<M extends PublicModel>(model: M): PublicDrafts[M] | null {
  try {
    const raw = localStorage.getItem(prefix + model);
    if (!raw || raw.length > 1600) return null;
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== "object") return null;
    const {schemaVersion, model: storedModel, data} = record as Record<string, unknown>;
    return schemaVersion === 1 && storedModel === model && isDraft(model, data) ? data : null;
  } catch {return null;}
}

export function savePublicDraft<M extends PublicModel>(model: M, data: PublicDrafts[M]): "saved" | "invalid" | "unavailable" {
  if (!isDraft(model, data)) return "invalid";
  try {
    localStorage.setItem(prefix + model, JSON.stringify({schemaVersion: 1, model, data}));
    return "saved";
  } catch {return "unavailable";}
}

export function erasePublicDraft(model: PublicModel): boolean {
  try {localStorage.removeItem(prefix + model); return true;} catch {return false;}
}
