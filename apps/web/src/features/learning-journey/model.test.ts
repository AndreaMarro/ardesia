import { describe, expect, it } from "vitest";
import { emptyDraft, readCheckpoint, submissionCommand, unavailableIntegrations, withinCheckpointLimit, ready, type JourneyData } from "./model";
import type { StudyResource } from "../../api";

const me = { id: "student", role: "student" as const, synthetic: true as const };
const data = { workspace: { edition: { id: "fluidi", packSha256: "pack-a" } },
  experience: { id: "poiseuille-boundary-v1", steps: [{ id: "fixed-pressure", activityId: "poiseuille-v1", parameters: { boundary: "pressure", radiusRatio: 2 } }] }, checkpoints: [] } as unknown as JourneyData;
const resource = (change = {}): StudyResource => ({ id: "checkpoint", revisionId: "r1", contextId: "c", sha256: "",
  kind: "learning-journey-checkpoint", ownerId: me.id, editionId: "fluidi", visibility: "private", text: JSON.stringify(emptyDraft(data)), ...change });

describe("checkpoint boundaries", () => {
  it("reopens only the same actor, edition and course pack", () => {
    expect(readCheckpoint(resource(), me, data)?.stepId).toBe("fixed-pressure");
    for (const change of [{ ownerId: "peer" }, { editionId: "other" }, { visibility: "group" }, { kind: "notes" }])
      expect(readCheckpoint(resource(change), me, data)).toBeNull();
    expect(readCheckpoint(resource(), me, { ...data, workspace: { ...data.workspace, edition: { ...data.workspace.edition, packSha256: "pack-b" } } })).toBeNull();
  });
  it("rejects malformed and oversized state instead of silently creating a new answer", () => {
    for (const change of [{ stepId: "not-in-pack" }, { support: ["made-up-help"] }, { support: ["model-result", "model-result"] },
      { procedure: "x".repeat(8001) }, { source: { resourceId: "a" } }, { phase: "exam" }, { pendingKey: "k", receiptId: "r" }])
      expect(readCheckpoint(resource({ text: JSON.stringify({ ...emptyDraft(data), ...change }) }), me, data)).toBeNull();
  });
  it("keeps the exact source revision and pending request through cold serialization", () => {
    const draft = { ...emptyDraft(data), source: { resourceId: "source", revisionId: "old-revision", contextId: "c" }, pendingKey: "same-key" };
    expect(readCheckpoint(resource({ text: JSON.stringify(draft) }), me, data)).toEqual(draft);
  });
  it("freezes the same Core command for a retry and does not claim independent mastery", () => {
    const draft = { ...emptyDraft(data), source: { resourceId: "source", revisionId: "r1", contextId: "c" }, pendingKey: "retry-key",
      ratio: "16,0", boundary: "pressure" as const, procedure: "Mantengo Δp costante e confronto r alla quarta.", support: ["model-result" as const] };
    const command = submissionCommand(draft, data.experience, data.experience.steps[0]);
    expect(command).toEqual(submissionCommand(JSON.parse(JSON.stringify(draft)), data.experience, data.experience.steps[0]));
    expect(command.activityEvidence.supportUsed).toEqual(["model-result"]);
    expect(command.sourceRefs[0]?.revisionId).toBe("r1");
    expect(() => submissionCommand({ ...draft, pendingKey: null }, data.experience, data.experience.steps[0])).toThrow();
  });
  it("does not turn unmerged streams into available capabilities", () => {
    expect(Object.values(unavailableIntegrations).every(item => item.state === "NOT_AVAILABLE")).toBe(true);
  });
  it("keeps the actual help passage after changing the primary source", () => {
    const draft = { ...emptyDraft(data), source: { resourceId: "notes-B", revisionId: "b", contextId: "cb" },
      helpSource: { resourceId: "passage-A", revisionId: "a", contextId: "ca" }, support: ["lesson-passage" as const],
      ratio: "16", boundary: "pressure" as const, procedure: "Il raggio entra alla quarta potenza.", pendingKey: "key" };
    const command = submissionCommand(draft, data.experience, data.experience.steps[0]);
    expect(command.activityEvidence.lessonPassageRef).toEqual({ resourceId: "passage-A", revisionId: "a" });
    expect(command.sourceRefs.map(ref => ref?.resourceId)).toEqual(["notes-B", "passage-A"]);
  });
  it("refuses oversized escaped drafts before a pending command can freeze editing", () => {
    const draft = { ...emptyDraft(data), source: { resourceId: "a", revisionId: "b", contextId: "c" },
      ratio: "16", boundary: "pressure" as const, procedure: '"'.repeat(8000), formula: '\\'.repeat(2000) };
    expect(withinCheckpointLimit(draft)).toBe(false); expect(ready(draft)).toBe(false);
  });
  it("uses the same capacity check before and after freezing the pending UUID", () => {
    for (const length of [7650, 7708, 7750, 7800, 7850]) {
      const draft = { ...emptyDraft(data), source: { resourceId: "a", revisionId: "b", contextId: "c" },
        ratio: "16", boundary: "pressure" as const, procedure: '"'.repeat(length), formula: '\\'.repeat(2000) };
      const pending = { ...draft, pendingKey: "12345678-1234-1234-1234-123456789abc" };
      expect(ready(pending)).toBe(ready(draft));
      if (ready(draft)) expect(() => submissionCommand(pending, data.experience, data.experience.steps[0])).not.toThrow();
    }
  });
});
