import type { Edition, StudyMe } from "./api";
export type LabActivityId = "taylor-exp-v1" | "poiseuille-v1";

/** The renderer has two explicit capabilities, not a default physics solver. */
export function baseActivity(edition: Edition): LabActivityId | null {
  if ("entryActivityId" in edition) {
    const id = edition.entryActivityId;
    return id === "taylor-exp-v1" || id === "poiseuille-v1" ? id : null;
  }
  // Compatibility with descriptors emitted before entryActivityId existed.
  // Unknown packs, missing versions and future versions must fail closed.
  if (edition.packVersion !== 1) return null;
  if (edition.packId === "taylor-exp-v1") return "taylor-exp-v1";
  if (edition.packId === "relazioni-fluidi-v1") return "poiseuille-v1";
  return null;
}
export const isTaylor = (edition: Edition) =>
  baseActivity(edition) === "taylor-exp-v1";

/** Reset transient state at a course/identity boundary; scoped draft stores survive. */
export const courseScope = (me: StudyMe, edition: Edition) => JSON.stringify([
  me.id, me.role, edition.id, edition.packId, edition.packVersion,
  edition.packSha256, edition.entryActivityId ?? baseActivity(edition),
]);
export const courseTitle = (edition: Edition) =>
  edition.title ?? `Edizione ${edition.id}`;
export const courseSubject = (edition: Edition) =>
  edition.subject === "analisi"
    ? "Analisi 1"
    : edition.subject === "fisica"
      ? "Fisica"
      : (edition.subject ?? "Mini-corso");
export type ActivityCommit = {
  activityId: string;
  parameters: Record<string, number | string>;
  prediction: string;
};
export const isDateConfirmed = (edition: Edition) =>
  ["offered", "confirmed", "running", "completed"].includes(edition.state);
