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
