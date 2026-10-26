// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { StudyMe, StudyResource, Workspace } from "../../api";
import { clearResourceDrafts } from "../../components/sessionDraftCache";
import { useCourseWorkspace } from "../../useCourseWorkspace";
import { Classroom } from "../Classroom";

// The PDF worker has its own browser gate. The actual Classroom, journey hook,
// Core adapter and workspace hook remain mounted in these composition tests.
vi.mock("../../integrations/notebook/ScientificNotebooks", () => ({
  ScientificNotebooks: () => <section aria-label="Quaderno scientifico" />,
}));

const student: StudyMe = { id: "s20-mount-student", role: "student", synthetic: true };
const workspace: Workspace = {
  edition: { id: "fluidi", teacherId: "s20-mount-tutor", capacity: 10, priceMinor: 0,
    state: "collecting", sessions: [], timezone: "Europe/Rome", packId: "relazioni-fluidi-v1",
    packVersion: 1, packSha256: "a".repeat(64), title: "Fluidi", subject: "fisica" },
  enrolled: true, resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: "v1",
};
const experience = {
  id: "poiseuille-boundary-v1", title: "Una previsione che continua", objective: "Distingui i vincoli della pompa.",
  editorialStatus: "DRAFT", scientificApproval: "NOT_ATTESTED",
  steps: [{ id: "fixed-pressure", activityId: "poiseuille-v1", title: "Raggio doppio",
    prompt: "La pressione resta costante. Come cambia la portata?", parameters: { radiusRatio: 2, boundary: "pressure" } }],
};
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });

beforeEach(() => {
  vi.stubEnv("VITE_S20_LEARNING_JOURNEY", "1");
  history.replaceState(null, "", "/?edition=fluidi&view=classroom");
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
  vi.stubGlobal("fetch", vi.fn(async (path: string) => {
    if (path === "/study/me") return response(student);
    if (path.startsWith("/study/editions?")) return response({ items: [workspace.edition], nextCursor: null });
    if (path.startsWith("/study/workspace?")) return response(workspace);
    if (path.startsWith("/study/learning-experiences?")) return response({ experiences: [experience] });
    return response({ threads: [], confirmedOpenCount: 0, candidateCount: 0 });
  }));
});
afterEach(() => { cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); history.replaceState(null, "", "/"); });

test("the real Classroom opens the enrolled student's Core journey and keeps the existing classroom tools reachable", async () => {
  render(<Classroom me={student} data={workspace} onUpdate={async () => {}} />);
  await screen.findByRole("heading", { name: experience.title });
  expect(fetch).toHaveBeenCalledWith("/study/learning-experiences?editionId=fluidi", expect.anything());
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), { target: { value: "16" } });
  fireEvent.click(screen.getByRole("button", { name: "Apri gli strumenti dell’aula" }));
  expect(screen.queryByTestId("learning-journey")).toBeNull();
  expect(screen.getByRole("region", { name: "Quaderno scientifico" })).toBeTruthy();
  expect(screen.getByLabelText("Una nota, una domanda, un procedimento")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Riprendi il percorso guidato" }));
  await screen.findByTestId("learning-journey");
  await waitFor(() => expect(screen.getByLabelText("Rapporto previsto")).toHaveProperty("value", "16"));
});

test("the journey mount preserves an explicit retry through the existing submission editor", async () => {
  const previous = { id: "attempt-1", student_id: student.id, activity_id: "poiseuille-v1", revision: 1,
    parent_id: null, text: "Procedimento precedente", asset_refs: [], source_refs: [], receipt_id: "receipt-1", state: "received", feedback: [] };
  render(<Classroom me={student} data={{ ...workspace, submissions: [previous] }} parentId={previous.id} onUpdate={async () => {}} />);
  expect(screen.getByRole("heading", { name: "Nuovo tentativo" })).toBeTruthy();
  expect(screen.queryByTestId("learning-journey")).toBeNull();
});

test("an unavailable explicit checkpoint never silently opens another saved journey", async () => {
  history.replaceState(null, "", "/?edition=fluidi&view=classroom&journey=missing-checkpoint");
  const checkpoint: StudyResource = { id: "existing-checkpoint", kind: "learning-journey-checkpoint", revisionId: "r1",
    contextId: "c1", sha256: "c".repeat(64), ownerId: student.id, editionId: "fluidi", visibility: "private",
    text: JSON.stringify({ schema: "ardesia.learning-journey.v1", editionId: "fluidi", packSha256: workspace.edition.packSha256,
      experienceId: experience.id, stepId: experience.steps[0].id, phase: "prediction", ratio: "8", boundary: "pressure",
      procedure: "", formula: "", source: null, helpSource: null, support: [], pendingKey: null, receiptId: null }) };
  vi.stubGlobal("fetch", vi.fn(async (path: string) => path.endsWith("/me") ? response(student)
    : path.includes("/learning-experiences?") ? response({ experiences: [experience] })
      : response({ ...workspace, resources: [checkpoint] })));
  render(<Classroom me={student} data={workspace} onUpdate={async () => {}} />);
  await screen.findByText("Il passaggio richiesto non è disponibile in questa edizione. Nessun altro percorso è stato aperto al suo posto.");
  expect(screen.queryByLabelText("Rapporto previsto")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Apri il percorso di questa edizione" }));
  await waitFor(() => expect(screen.getByLabelText("Rapporto previsto")).toHaveProperty("value", "8"));
  expect(new URLSearchParams(location.search).has("journey")).toBe(false);
});

test.each(["teacher", "not-enrolled", "disabled"])("the journey is not mounted for %s", async condition => {
  if (condition === "disabled") vi.stubEnv("VITE_S20_LEARNING_JOURNEY", "0");
  const me: StudyMe = condition === "teacher" ? { ...student, id: "s20-mount-tutor", role: "teacher" } : student;
  render(<Classroom me={me} data={{ ...workspace, enrolled: condition !== "not-enrolled" }} onUpdate={async () => {}} />);
  expect(screen.queryByTestId("learning-journey")).toBeNull();
  expect((fetch as ReturnType<typeof vi.fn>).mock.calls.some(([path]) => String(path).includes("learning-experiences"))).toBe(false);
});

test("internal Core checkpoints stay out of the generic workspace before caching and after an unavailable refresh", async () => {
  const resource = (kind: string): StudyResource => ({ id: kind, kind, revisionId: "r1", contextId: "c1", sha256: "b".repeat(64),
    editionId: "fluidi", ownerId: student.id, visibility: "private", text: kind });
  const resources = ["notes", "learning-journey-checkpoint", "independent-study-plan-v1", "independent-study-source-v1", "independent-study-attempt-v1"].map(resource);
  let unavailable = false;
  vi.stubGlobal("fetch", vi.fn(async (path: string) => path.includes("/editions?")
    ? response({ items: [workspace.edition], nextCursor: null })
    : unavailable ? response({ error: "storage_unavailable" }, 503) : response({ ...workspace, resources })));
  function WorkspaceProbe() {
    const state = useCourseWorkspace(student);
    return <><output data-testid="resource-kinds">{state.data?.resources.map(item => item.kind).join(",") ?? "loading"}</output>
      <button onClick={() => void state.refresh().catch(() => {})}>Rileggi</button><p role="alert">{state.error}</p></>;
  }
  render(<WorkspaceProbe />);
  await waitFor(() => expect(screen.getByTestId("resource-kinds").textContent).toBe("notes"));
  unavailable = true;
  fireEvent.click(screen.getByRole("button", { name: "Rileggi" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).not.toBe(""));
  expect(screen.getByTestId("resource-kinds").textContent).toBe("notes");
});
