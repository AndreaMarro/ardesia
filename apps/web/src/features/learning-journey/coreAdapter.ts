import { studyRequest, type StudyMe, type StudyResource, type Workspace, StudyApiError } from "../../api";
import type { LearningExperience } from "../../components/experienceTypes";
import { checkpointKind, readCheckpoint, submissionCommand, type JourneyData, type JourneyDraft, type JourneyReceipt } from "./model";

export class JourneyCommandRejected extends StudyApiError {}

/** All durable state lives in the existing resources/submissions/receipts Core. */
export function coreJourneyAdapter(me: StudyMe, editionId: string) {
  let pendingCreate: { key: string; text: string } | null = null;
  return {
    async load(): Promise<JourneyData> {
      const identity = await studyRequest<StudyMe>("/me");
      if (identity.id !== me.id || identity.role !== "student" || me.role !== "student") throw new StudyApiError("forbidden", 403);
      const workspace = await studyRequest<Workspace>("/workspace?" + new URLSearchParams({ editionId }));
      if (!workspace.enrolled || workspace.edition.id !== editionId) throw new StudyApiError("forbidden", 403);
      const response = await studyRequest<{ experiences: LearningExperience[] }>("/learning-experiences?" + new URLSearchParams({ editionId }));
      const experience = response.experiences.find(item => item.id === "poiseuille-boundary-v1"
        && item.steps.length > 0 && item.steps.every(step => step.activityId === "poiseuille-v1"));
      if (!experience) throw Error("journey_not_available");
      const data: JourneyData = { workspace, experience, checkpoints: [] };
      data.checkpoints = workspace.resources.flatMap(resource => {
        const draft = readCheckpoint(resource, me, data);
        return draft ? [{ resource, draft }] : [];
      });
      if (workspace.resources.some(resource => resource.ownerId === me.id && resource.kind === checkpointKind)
        && data.checkpoints.length === 0) throw Error("checkpoint_version_unavailable");
      return data;
    },
    async save(draft: JourneyDraft, base: StudyResource | null, key: string): Promise<StudyResource> {
      const text = JSON.stringify(draft);
      if (draft.editionId !== editionId) throw Error("checkpoint_scope_mismatch");
      if (!base) {
        const command = pendingCreate ??= { key, text };
        let resource: StudyResource;
        try {
          resource = await studyRequest<StudyResource>("/resources", {
            editionId, kind: checkpointKind, visibility: "private", text: command.text,
          }, { headers: { "Idempotency-Key": command.key } });
        } catch (reason) {
          const workspace = await studyRequest<Workspace>("/workspace?" + new URLSearchParams({ editionId })).catch(() => null);
          const recovered = workspace?.resources.filter(item => item.kind === checkpointKind && item.ownerId === me.id && item.text === command.text);
          if (recovered?.length !== 1) throw reason;
          resource = recovered[0];
        }
        pendingCreate = null;
        return resource.text === text ? resource : this.save(draft, resource, key);
      }
      if (base.ownerId !== me.id || base.editionId !== editionId || draft.editionId !== editionId) throw Error("checkpoint_scope_mismatch");
      try {
        return await studyRequest<StudyResource>(`/resources/${encodeURIComponent(base.id)}/revise`, { expectedRevision: base.revisionId, text });
      } catch (failure) {
        // The generic revise command has CAS, but no idempotency key. Recover an
        // acknowledged-equivalent head after response loss; never overwrite it.
        const current = await studyRequest<StudyResource>(`/resources/${encodeURIComponent(base.id)}`).catch(() => null);
        if (current && current.text === text && current.ownerId === me.id && current.editionId === editionId) return current;
        throw failure;
      }
    },
    async submit(draft: JourneyDraft, data: JourneyData): Promise<JourneyReceipt> {
      const step = data.experience.steps.find(item => item.id === draft.stepId);
      if (!step || draft.editionId !== editionId) throw Error("checkpoint_scope_mismatch");
      const body = submissionCommand(draft, data.experience, step);
      let result: JourneyReceipt;
      try { result = await studyRequest<JourneyReceipt>("/submissions", body, { headers: { "Idempotency-Key": draft.pendingKey! } }); }
      catch (reason) {
        if (reason instanceof StudyApiError && reason.status >= 400 && reason.status < 500
          && ![401, 403].includes(reason.status) && reason.message !== "idempotency_conflict")
          throw new JourneyCommandRejected(reason.message, reason.status);
        throw reason;
      }
      return this.receipt(result.receiptId, draft);
    },
    async receipt(id: string, draft: JourneyDraft): Promise<JourneyReceipt> {
      const receipt = await studyRequest<JourneyReceipt>(`/receipts/${encodeURIComponent(id)}`);
      if (receipt.receiptId !== id || receipt.studentId !== me.id || receipt.activityId !== "poiseuille-v1"
        || receipt.activityEvidence?.experienceId !== draft.experienceId || receipt.activityEvidence.stepId !== draft.stepId)
        throw Error("receipt_identity_mismatch");
      const workspace = await studyRequest<Workspace>("/workspace?" + new URLSearchParams({ editionId }));
      const submission = workspace.submissions.find(item => item.id === receipt.submissionId && item.receipt_id === id
        && item.student_id === me.id && item.activity_id === receipt.activityId);
      const primarySource = draft.source;
      const sourceMatches = primarySource && submission?.source_refs.some(ref => ref.resourceId === primarySource.resourceId && ref.revisionId === primarySource.revisionId);
      const expectedText = `Previsione: ${draft.ratio}; grandezza fissata: ${draft.boundary === "flow" ? "Q" : "Δp"}.\n\nProcedimento: ${draft.procedure.trim()}${draft.formula ? `\n\nFormula (LaTeX): ${draft.formula}` : ""}`;
      if (workspace.edition.id !== editionId || !submission || !sourceMatches || submission.text !== expectedText
        || receipt.activityEvidence.prediction.ratio !== Number(draft.ratio.replace(",", "."))
        || receipt.activityEvidence.prediction.fixedQuantity !== draft.boundary)
        throw Error("receipt_context_mismatch");
      return receipt;
    },
  };
}
export type JourneyAdapter = ReturnType<typeof coreJourneyAdapter>;
