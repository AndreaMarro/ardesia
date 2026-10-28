import type { Edition, StudyMe } from "./api";
import type { CourseLessonContext, SubmissionCourseContext } from "../../studio/src/study/contracts";
export type LabActivityId = "taylor-exp-v1" | "poiseuille-v1" | "hooke-v1" | "ideal-gas-v1" | "dc-resistance-v1" | "harmonic-wave-v1" | "kinematics-v1";

/** The renderer has two explicit capabilities, not a default physics solver. */
export function baseActivity(edition: Edition): LabActivityId | null {
  if ("entryActivityId" in edition) {
    const id = edition.entryActivityId;
    return ["taylor-exp-v1","poiseuille-v1","hooke-v1","ideal-gas-v1","dc-resistance-v1","harmonic-wave-v1","kinematics-v1"].includes(id||"") ? id as LabActivityId : null;
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
  courseLesson?: CourseLessonContext;
};
export function courseLessonFromContext(context?: SubmissionCourseContext): CourseLessonContext | undefined {
  return context?.lessonRef && context.phase ? {lessonRef: context.lessonRef, phase: context.phase, ...(context.stepId ? {stepId: context.stepId} : {}), ...(context.assessmentRef ? {assessmentRef:context.assessmentRef} : {})} : undefined;
}
export function sameCourseLesson(left?: CourseLessonContext, right?: CourseLessonContext): boolean {
  if (!left || !right) return left === right;
  return JSON.stringify(left.assessmentRef)===JSON.stringify(right.assessmentRef) && left.phase === right.phase && left.stepId === right.stepId && left.lessonRef.id === right.lessonRef.id
    && left.lessonRef.version === right.lessonRef.version && left.lessonRef.sha256 === right.lessonRef.sha256;
}
export const isDateConfirmed = (edition: Edition) =>
  ["offered", "confirmed", "running", "completed"].includes(edition.state);
