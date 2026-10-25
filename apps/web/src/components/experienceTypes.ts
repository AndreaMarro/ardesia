export type ExperienceStep = {
  id: string; title: string; prompt: string; activityId: string;
  parameters: { radiusRatio: number; boundary: "pressure" | "flow"; viscosity?: number; length?: number };
  exerciseRef?: string;
};
export type LearningExperience = {
  id: string; title: string; objective: string; steps: ExperienceStep[];
  editorialStatus: string; scientificApproval: string;
};
export type ActivityEvidence = {
  schemaVersion: 1; experienceId: string; stepId: string;
  prediction: { ratio: number; fixedQuantity: "pressure" | "flow" };
  supportUsed: string[];
  lessonPassageRef?: {resourceId: string; revisionId: string};
  exerciseRef?: string | null;
  assistance: "NO_SUPPORT_REQUESTED" | "SUPPORT_REQUESTED";
  result: { ratio: number; fixedQuantity: "pressure" | "flow"; calculatedVariable: string; domain?: string;
    visual?: {flowRatio: number; pressureRatio: number; meanSpeedRatio: number} };
  check: { ratioMatches: boolean; constraintMatches: boolean };
};

// Composition is editorial data over existing models and immutable receipts.
// Phases guide presentation; they do not introduce a second attempt ledger.
export type CompositionPhase =
  | "situation" | "prediction" | "model" | "visual"
  | "explanation" | "source" | "transfer";
export type ExperienceRef = { id: string; version: number; sha256: string };
export type CoursePackRef = { packId: string; packVersion: number; packSha256: string };
export type HydrostaticParameters = {
  density: number; g: number; depth: number; surfacePressure: number;
  reference: "gauge" | "absolute";
};
type ComposableStepBase = {
  id: string; title: string; prompt: string; activityVersion: number;
  phases: CompositionPhase[]; hints: string[]; advanceWhen: "receipt-confirmed";
  exerciseRef?: string;
};
export type ComposableExperienceStep = ComposableStepBase & (
  | { activityId: "hydrostatic-v1"; parameters: HydrostaticParameters;
      prediction: { kind: "scalar"; unit: "Pa" } }
  | { activityId: "poiseuille-v1"; parameters: ExperienceStep["parameters"];
      prediction: { kind: "ratio"; fixedQuantityRequired: true } }
);
export type ComposableExperience = {
  compositionVersion: 1; id: string; version: number; title: string; objective: string;
  experienceRef: ExperienceRef; coursePackRef: CoursePackRef;
  steps: ComposableExperienceStep[];
  editorialStatus: "DRAFT"; scientificApproval: "NOT_ATTESTED";
};
export type ScalarPrediction = { kind: "scalar"; value: number; unit: string };
export type RatioPrediction = { kind: "ratio"; ratio: number; fixedQuantity: "pressure" | "flow" };
export type ActivityEvidenceV2Input = {
  schemaVersion: 2; experienceRef: ExperienceRef; stepId: string;
  prediction: ScalarPrediction | RatioPrediction; supportUsed: string[];
  lessonPassageRef?: { resourceId: string; revisionId: string };
};
type EvidenceV2Receipt = ActivityEvidenceV2Input & {
  exerciseRef?: string | null;
  assistance: "NO_SUPPORT_REQUESTED" | "SUPPORT_REQUESTED";
  assistanceScope: string;
};
export type ActivityEvidenceV2 = EvidenceV2Receipt & (
  | { prediction: ScalarPrediction;
      result: { kind: "scalar"; activityId: "hydrostatic-v1"; version: number; value: number; unit: "Pa";
        calculatedVariable: string; fixedQuantity: string; domain: string;
        editorialStatus: "DRAFT"; numericalCheck: "deterministic" };
      check: { kind: "scalar"; valueMatches: boolean; unitMatches: boolean } }
  | { prediction: RatioPrediction; result: ActivityEvidence["result"] & { kind: "ratio"; activityId: "poiseuille-v1"; version: number };
      check: { kind: "ratio"; ratioMatches: boolean; constraintMatches: boolean } }
);
export type ComposableExperiencesResponse = {
  schemaVersion: 2; coursePackRef: CoursePackRef; experiences: ComposableExperience[];
};
