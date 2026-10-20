import type { Edition } from "./api";
export const isTaylor = (edition: Edition) =>
  edition.packId === "taylor-exp-v1";
export const courseTitle = (edition: Edition) =>
  edition.title ?? `Edizione ${edition.id}`;
export const courseSubject = (edition: Edition) =>
  edition.subject === "analisi"
    ? "Analisi 1"
    : edition.subject === "fisica"
      ? "Fisica"
      : (edition.subject ?? "Mini-corso");
export const baseActivity = (edition: Edition) =>
  isTaylor(edition) ? "taylor-exp-v1" : "poiseuille-v1";
export type ActivityCommit = {
  activityId: string;
  parameters: Record<string, number | string>;
  prediction: string;
};
export const isDateConfirmed = (edition: Edition) =>
  ["offered", "confirmed", "running", "completed"].includes(edition.state);
