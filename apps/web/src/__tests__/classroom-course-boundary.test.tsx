// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Edition, StudyMe, Workspace } from "../api";
import { Classroom } from "../features/Classroom";
import { clearResourceDrafts } from "../components/sessionDraftCache";

// PDF rendering has its own worker/browser gates; this suite exercises the real
// classroom, laboratories, resource composer and submission editor boundaries.
vi.mock("../integrations/notebook/ScientificNotebooks", () => ({
  ScientificNotebooks: () => <section aria-label="Quaderno scientifico" />,
}));

const me: StudyMe = { id: "synthetic-student", role: "student", synthetic: true };
const original: Edition = {
  id: "synthetic-fluidi-a", teacherId: "teacher", capacity: 10, priceMinor: 0,
  state: "collecting", sessions: [], timezone: "Europe/Rome",
  packId: "relazioni-fluidi-v1", packVersion: 1, packSha256: "a".repeat(64),
  title: "Fluidi A", subject: "fisica",
};
const workspace = (edition: Edition): Workspace => ({
  edition, enrolled: true, resources: [], submissions: [], layouts: [],
  layoutSaved: false, layoutVersion: "b".repeat(64),
});
const onUpdate = async () => {};
const response = (value: unknown) => new Response(JSON.stringify(value));

beforeEach(() => {
  const cache = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => cache.get(key) ?? null,
    setItem: (key: string, value: string) => cache.set(key, value),
    removeItem: (key: string) => cache.delete(key),
  });
  vi.stubGlobal("fetch", vi.fn(async (path: string) => {
    if (path === "/study/activities/evaluate") return response({
      ratio: 16, fixedQuantity: "pressure", calculatedVariable: "flow", domain: "Synthetic fixture",
    });
    if (path === "/study/resources") return response({
      id: "source-fluidi-a", revisionId: "revision-a", contextId: "context-a",
    });
    return response({ threads: [], confirmedOpenCount: 0, candidateCount: 0 });
  }));
});
afterEach(() => { cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); });

test.each([undefined, null, "unsupported-lab-v1"])("an unsupported course (%s) keeps notes and notebooks without a foreign laboratory or submission", entryActivityId => {
  const edition = { ...original, packId: "synthetic-linear-algebra", subject: "algebra", entryActivityId };
  render(<Classroom me={me} data={workspace(edition)} onUpdate={onUpdate} />);
  expect(screen.queryByRole("heading", { name: "Che cosa tieni fisso?" })).toBeNull();
  expect(screen.queryByRole("heading", { name: "Quanto basta per approssimare?" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Consegna" })).toBeNull();
  expect(screen.getByLabelText("Una nota, una domanda, un procedimento")).toBeTruthy();
  expect(screen.getByRole("region", { name: "Quaderno scientifico" })).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});

test("switching editions using the same laboratory resets computed state, source and editor while preserving each edition's draft", async () => {
  const second = { ...original, id: "synthetic-fluidi-b", title: "Fluidi B" };
  const view = render(<Classroom me={me} data={workspace(original)} onUpdate={onUpdate} />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), { target: { value: "Previsione della prima edizione" } });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  await screen.findByTestId("physics-ratio");
  fireEvent.change(screen.getByLabelText("Una nota, una domanda, un procedimento"), { target: { value: "Fonte della prima edizione" } });
  fireEvent.click(screen.getByRole("button", { name: "Salva nota privata" }));
  await screen.findByText(/Fonte contestuale collegata/);
  fireEvent.change(screen.getByLabelText("Una nota, una domanda, un procedimento"), { target: { value: "Bozza privata da ritrovare" } });
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), { target: { value: "Procedimento della prima edizione" } });

  view.rerender(<Classroom me={me} data={workspace(second)} onUpdate={onUpdate} />);
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.getByLabelText("La tua previsione")).toHaveProperty("value", "");
  expect(screen.getByLabelText("Una nota, una domanda, un procedimento")).toHaveProperty("value", "");
  expect(screen.getByLabelText("La tua spiegazione")).toHaveProperty("value", "");
  expect(screen.getByText(/Nessuna fonte contestuale selezionata/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), { target: { value: "Procedimento distinto" } });
  expect(screen.getByRole("button", { name: "Consegna" })).toHaveProperty("disabled", true);

  view.rerender(<Classroom me={me} data={workspace(original)} onUpdate={onUpdate} />);
  expect(screen.getByLabelText("La tua previsione")).toHaveProperty("value", "Previsione della prima edizione");
  expect(screen.getByLabelText("Una nota, una domanda, un procedimento")).toHaveProperty("value", "Bozza privata da ritrovare");
  expect(screen.getByLabelText("La tua spiegazione")).toHaveProperty("value", "Procedimento della prima edizione");
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.getByRole("button", { name: "Consegna" })).toHaveProperty("disabled", true);
  expect(screen.getByText(/Nessuna fonte contestuale selezionata/)).toBeTruthy();
});

test("an evaluation acknowledged after switching the same lab to another edition cannot unlock its submission", async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
  const view = render(<Classroom me={me} data={workspace(original)} onUpdate={onUpdate} />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), { target: { value: "Prima previsione" } });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  view.rerender(<Classroom me={me} data={workspace({ ...original, id: "synthetic-fluidi-b" })} onUpdate={onUpdate} />);
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), { target: { value: "Altro procedimento" } });
  await act(async () => finish(response({ ratio: 16, fixedQuantity: "pressure", calculatedVariable: "flow", domain: "Synthetic fixture" })));
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.getByRole("button", { name: "Consegna" })).toHaveProperty("disabled", true);
});

test("a different principal cannot inherit the prior classroom prediction, note or source", async () => {
  const view = render(<Classroom me={me} data={workspace(original)} onUpdate={onUpdate} />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), { target: { value: "Previsione privata" } });
  fireEvent.change(screen.getByLabelText("Una nota, una domanda, un procedimento"), { target: { value: "Nota privata" } });
  view.rerender(<Classroom me={{ ...me, id: "synthetic-student-b" }} data={workspace(original)} onUpdate={onUpdate} />);
  expect(screen.getByLabelText("La tua previsione")).toHaveProperty("value", "");
  expect(screen.getByLabelText("Una nota, una domanda, un procedimento")).toHaveProperty("value", "");
  expect(screen.getByText(/Nessuna fonte contestuale selezionata/)).toBeTruthy();
});

test("a retry selection carried for one render across a course switch never enters the new course's submission", async () => {
  const first = workspace(original);
  first.submissions = [{ id: "attempt-a", student_id: me.id, activity_id: "poiseuille-v1", revision: 1,
    parent_id: null, text: "Primo tentativo", asset_refs: [], source_refs: [], receipt_id: "receipt-a", state: "received", feedback: [] }];
  const second = workspace({ ...original, id: "synthetic-fluidi-b" });
  const view = render(<Classroom me={me} data={first} parentId="attempt-a" onUpdate={onUpdate} />);
  expect(screen.getByRole("heading", { name: "Nuovo tentativo" })).toBeTruthy();
  // App clears parentId in an effect; the destination can render once before that reset.
  view.rerender(<Classroom me={me} data={second} parentId="attempt-a" onUpdate={onUpdate} />);
  view.rerender(<Classroom me={me} data={second} parentId={null} onUpdate={onUpdate} />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), { target: { value: "Previsione del nuovo corso" } });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  await screen.findByTestId("physics-ratio");
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), { target: { value: "Procedimento del nuovo corso" } });
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await waitFor(() => expect((fetch as ReturnType<typeof vi.fn>).mock.calls.some(([path]) => path === "/study/submissions")).toBe(true));
  const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls.find(([path]) => path === "/study/submissions")!;
  expect(JSON.parse(init.body)).toMatchObject({ editionId: second.edition.id, parentId: null });
});
