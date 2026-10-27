export type InsightAttempt = {
  receiptId: string; activityId: string; studentId: string; parentId: string | null;
  receivedAt: number; modelVersion: number | null;
  packRef: { packId: string; packVersion: number; packSha256: string };
  sourceRefs: { resourceId: string; revisionId: string; contextId?: string }[];
  sourceState: "CURRENT" | "HISTORICAL"; supportUsed: string[];
  assistance: "SUPPORT_REQUESTED" | "NO_SUPPORT_REQUESTED" | "NOT_RECORDED";
  outcome: "MATCH" | "MISMATCH" | "NOT_CHECKED";
  provenance: "CANONICAL_RECEIPT";
};
export type InsightData = {
  schemaVersion: 1; editionId: string; role: "student" | "teacher";
  attempts: InsightAttempt[];
  suggestions: { threadId: string; category: string; status: string;
    sourceRef: { resourceId: string; revisionId: string }; uncertainty: string }[];
  cohortSuppressed: boolean;
  comparisons: {beforeReceiptId:string;afterReceiptId:string;beforeOutcome:string;afterOutcome:string;
    beforeAssistance:string;afterAssistance:string;scope:string;provenance:string;causalInference:false}[];
  recoveries: {threadId:string;category:string;sourceRef:{resourceId:string;revisionId:string};
    verificationReceiptId:string;verificationSourceRefs:{resourceId:string;revisionId:string}[];provenance:string;scope:string}[];
  summary: null | { attempts: number; checked: number; matched: number; assisted: number; observedCategories: Record<string, number> };
  optionalEvents: { eventId: string; receiptId: string; kind: string; occurredAt: number; expiresAt: number; provenance: string }[];
  preferences: { enabled: boolean; consentId: string | null; noticeVersion: string | null; notice: null | { version: string; purpose: string; retentionDays: number }; essentialStudyAvailable: true };
  limits: string[];
};
