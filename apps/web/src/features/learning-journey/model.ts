import type { PostitReference, StudyMe, StudyResource, Workspace } from "../../api";
import type { ActivityEvidence, ExperienceStep, LearningExperience } from "../../components/experienceTypes";

export const checkpointKind = "learning-journey-checkpoint";
export const phases = ["prediction", "model", "response", "feedback"] as const;
export type Phase = typeof phases[number];
export type Support = "constraint-hint" | "lesson-passage" | "model-result";
export type JourneyDraft = {
  schema: "ardesia.learning-journey.v1";
  editionId: string; packSha256: string; experienceId: string; stepId: string; phase: Phase;
  ratio: string; boundary: "" | "pressure" | "flow"; procedure: string; formula: string;
  source: PostitReference | null; helpSource: PostitReference | null; support: Support[];
  pendingKey: string | null; receiptId: string | null;
};
export type JourneyReceipt = {
  receiptId: string; submissionId: string; studentId: string; activityId: string;
  revision: number; activityEvidence: ActivityEvidence;
};
export type JourneyData = {
  workspace: Workspace; experience: LearningExperience;
  checkpoints: { resource: StudyResource; draft: JourneyDraft }[];
};
export function emptyDraft(data: JourneyData, step = data.experience.steps[0]): JourneyDraft {
  return { schema: "ardesia.learning-journey.v1", editionId: data.workspace.edition.id,
    packSha256: data.workspace.edition.packSha256 ?? "", experienceId: data.experience.id,
    stepId: step.id, phase: "prediction", ratio: "", boundary: "", procedure: "", formula: "",
    source: null, helpSource: null, support: [], pendingKey: null, receiptId: null };
}
const bounded = (value: unknown, limit: number): value is string => typeof value === "string" && value.length <= limit;
export function readCheckpoint(resource: StudyResource, me: StudyMe, data: JourneyData): JourneyDraft | null {
  if (resource.kind !== checkpointKind || resource.ownerId !== me.id || resource.visibility !== "private"
    || resource.editionId !== data.workspace.edition.id) return null;
  try {
    const d = JSON.parse(resource.text) as JourneyDraft;
    const source = d?.source, help = d?.helpSource;
    if (!d || d.schema !== "ardesia.learning-journey.v1" || d.editionId !== resource.editionId
      || d.packSha256 !== (data.workspace.edition.packSha256 ?? "") || d.experienceId !== data.experience.id
      || !data.experience.steps.some(step => step.id === d.stepId) || !phases.includes(d.phase)
      || !bounded(d.ratio, 40) || !["", "pressure", "flow"].includes(d.boundary)
      || !bounded(d.procedure, 8000) || !bounded(d.formula, 2000)
      || !Array.isArray(d.support) || d.support.length > 3 || new Set(d.support).size !== d.support.length
      || d.support.some(item => !["constraint-hint", "lesson-passage", "model-result"].includes(item))
      || !(d.pendingKey === null || bounded(d.pendingKey, 128) && !!d.pendingKey)
      || !(d.receiptId === null || bounded(d.receiptId, 128) && !!d.receiptId)
      || d.pendingKey && d.receiptId
      || !(help === null || help && [help.resourceId, help.revisionId, help.contextId].every(item => bounded(item, 128) && !!item))
      || d.support.includes("lesson-passage") && !help
      || !(source === null || source && [source.resourceId, source.revisionId, source.contextId].every(item => bounded(item, 128) && !!item))) return null;
    return d;
  } catch { return null; }
}
export function ready(draft: JourneyDraft) {
  const ratio = Number(draft.ratio.replace(",", "."));
  return draft.ratio.trim() !== "" && Number.isFinite(ratio) && ratio > 0
    && draft.boundary !== "" && draft.procedure.trim().length >= 12 && draft.source !== null && withinCheckpointLimit(draft);
}
/** Reserve room for the frozen command/receipt in Core's 20k text envelope. */
export const withinCheckpointLimit = (draft: JourneyDraft) => JSON.stringify({ ...draft,
  pendingKey: "x".repeat(128), receiptId: null }).length <= 20_000;
export function submissionCommand(draft: JourneyDraft, experience: LearningExperience, step: ExperienceStep) {
  if (!ready(draft) || !draft.pendingKey || experience.id !== draft.experienceId || step.id !== draft.stepId)
    throw Error("invalid_journey_command");
  return {
    editionId: draft.editionId, activityId: step.activityId, activityParameters: step.parameters,
    text: `Previsione: ${draft.ratio}; grandezza fissata: ${draft.boundary === "flow" ? "Q" : "Δp"}.\n\nProcedimento: ${draft.procedure.trim()}${draft.formula ? `\n\nFormula (LaTeX): ${draft.formula}` : ""}`,
    assetRefs: [], sourceRefs: [draft.source, ...(draft.helpSource && (draft.helpSource.resourceId !== draft.source!.resourceId || draft.helpSource.revisionId !== draft.source!.revisionId) ? [draft.helpSource] : [])],
    activityEvidence: { schemaVersion: 1, experienceId: experience.id, stepId: step.id,
      prediction: { ratio: Number(draft.ratio.replace(",", ".")), fixedQuantity: draft.boundary },
      supportUsed: draft.support,
      ...(draft.support.includes("lesson-passage") && draft.helpSource ? { lessonPassageRef: { resourceId: draft.helpSource.resourceId, revisionId: draft.helpSource.revisionId } } : {}) },
  };
}

export type Capability<T> = { state: "AVAILABLE"; adapter: T } | { state: "NOT_AVAILABLE"; reason: string };
export type JourneyIntegrations = {
  memory: Capability<{ openSource: (source: PostitReference) => void }>;
  independentStudy: Capability<{ resume: (editionId: string) => void }>;
  lessonReplay: Capability<{ openPassage: (source: PostitReference) => void }>;
};
export const unavailableIntegrations: JourneyIntegrations = {
  memory: { state: "NOT_AVAILABLE", reason: "Consumer S05 non integrato nella base osservata." },
  independentStudy: { state: "NOT_AVAILABLE", reason: "Consumer S06 non integrato nella base osservata." },
  lessonReplay: { state: "NOT_AVAILABLE", reason: "Ponte S17 non integrato nella base osservata." },
};
export const journeyEnabled = () => import.meta.env.VITE_S20_LEARNING_JOURNEY === "1";
