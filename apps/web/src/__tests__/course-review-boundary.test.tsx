// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Workspace } from "../api";
import { Diary } from "../features/Diary";
import { Review } from "../features/Review";
import { Work } from "../features/Work";

const student = { id: "synthetic-student", role: "student" as const, synthetic: true as const };
const teacher = { id: "synthetic-teacher", role: "teacher" as const, synthetic: true as const };
const workspace: Workspace = {
  edition: { id: "synthetic-algebra", teacherId: teacher.id, capacity: 10, priceMinor: 0,
    state: "collecting", sessions: [], timezone: "Europe/Rome", packId: "algebra-v1", packVersion: 1 },
  enrolled: true, resources: [], layouts: [], layoutSaved: false, layoutVersion: "a".repeat(64),
  submissions: [{ id: "synthetic-submission", student_id: student.id, activity_id: "poiseuille-v1", revision: 1,
    parent_id: null, text: "Testo storico della consegna", asset_refs: [], source_refs: [], receipt_id: "synthetic-receipt",
    state: "received", feedback: [] }],
};
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("an unsupported diary keeps historical observations but cannot assign a default fluid exercise", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    confirmedOpenCount: 0, candidateCount: 1,
    threads: [{ threadId: "synthetic-thread", studentId: student.id, editionId: workspace.edition.id,
      conceptId: "procedure", category: "algebra", status: "CANDIDATE", sourceState: "CURRENT",
      source: null, contested: false, attempts: [], history: [] }],
  }))));
  render(<Diary me={teacher} editionId={workspace.edition.id} activityId={null} />);
  await screen.findByRole("heading", { name: student.id });
  expect(screen.queryByText("Verifica e prepara il prossimo passo")).toBeNull();
  expect(screen.queryByLabelText("Rapporto originale r/r₀")).toBeNull();
  expect(screen.getByText("Archivia un’osservazione non pertinente")).toBeTruthy();
});

test("unsupported course feedback and diary observations remain manual without a guessed model", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ threads: [] }))));
  render(<Review data={workspace} onUpdate={async () => {}} onDiary={() => {}} />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: new RegExp(student.id) })); });
  expect(screen.getByText("Testo storico della consegna")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Inizia la correzione" })).toBeTruthy();
  expect(screen.getByText("Collega un passaggio al diario")).toBeTruthy();
  const concepts = screen.getByLabelText("Concetto") as HTMLSelectElement;
  expect(concepts.value).toBe("procedure");
  expect(Array.from(concepts.options, (option) => option.value)).toEqual(["unit-conversion", "model-selection", "procedure"]);
});

test("assigned transfer deliveries retain manual diary observations and recurrence without guessing a model", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ threads: [
    { threadId: "resolved-thread", studentId: student.id, conceptId: "radius-power", status: "VERIFIED_RESOLVED" },
    { threadId: "other-student-thread", studentId: "other-student", conceptId: "private-concept", status: "VERIFIED_RESOLVED" },
  ] }))));
  const fluidi: Workspace = { ...workspace,
    edition: { ...workspace.edition, id: "synthetic-fluidi", packId: "relazioni-fluidi-v1", packVersion: 1, entryActivityId: "poiseuille-v1" },
    submissions: [{ ...workspace.submissions[0], activity_id: "transfer-resolved-thread" }],
  };
  render(<Review data={fluidi} onUpdate={async () => {}} onDiary={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(student.id) }));
  expect(screen.getByText("Collega un passaggio al diario")).toBeTruthy();
  const recurrence = await screen.findByLabelText("Nuova osservazione o ricomparsa") as HTMLSelectElement;
  expect(Array.from(recurrence.options, (option) => option.value)).toEqual(["", "resolved-thread"]);
  const concepts = screen.getByLabelText("Concetto") as HTMLSelectElement;
  expect(concepts.value).toBe("procedure");
  expect(Array.from(concepts.options, (option) => option.value)).not.toContain("radius-power");
});

test("historical deliveries stay visible without offering a retry in an unrelated laboratory", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ threads: [], confirmedOpenCount: 0, candidateCount: 0 }))));
  render(<Work me={student} data={workspace} onRetry={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Consegne e feedback" }));
  expect(screen.getByText("Testo storico della consegna")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Prepara un nuovo tentativo" })).toBeNull();
});
