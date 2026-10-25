// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Workspace } from "../api";
import { Diary } from "../features/Diary";
import { Work } from "../features/Work";

const teacher = { id: "tutor-synthetic", role: "teacher" as const, synthetic: true as const };
const workspace: Workspace = {
  edition: { id: "fluidi", teacherId: teacher.id, capacity: 10, priceMinor: 0,
    state: "collecting", sessions: [], timezone: "Europe/Rome", packId: "relazioni-fluidi-v1", packVersion: 1,
    entryActivityId: "poiseuille-v1" },
  enrolled: true, resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: "a".repeat(64),
};
function thread(id: string, originalExerciseId: string | null | undefined, editionId = "fluidi") {
  return { threadId: id, studentId: "student-" + id, editionId, submissionId: "submission-" + id,
    originalExerciseId, attemptRevision: 1, conceptId: "model-selection", category: "model_selection",
    status: "CANDIDATE", sourceState: "CURRENT", source: null,
    contested: false, attempts: [], history: [] };
}
function api(threads: ReturnType<typeof thread>[]) {
  const commands: { path: string; body: Record<string, unknown> }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    if (path.startsWith("/study/diary?")) return new Response(JSON.stringify({ threads, candidateCount: threads.length, confirmedOpenCount: 0 }));
    if (path.endsWith("/confirm")) { commands.push({ path, body: JSON.parse(init!.body as string) }); return new Response("{}"); }
    throw new Error("Unexpected request " + path);
  }));
  return commands;
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("the same Fluidi diary offers Poiseuille only for its exact originating activity, while Hydro stays manual", async () => {
  const commands = api([thread("hydro", "hydrostatic-v1"), thread("poiseuille", "poiseuille-v1")]);
  render(<Work me={teacher} data={workspace} onRetry={vi.fn()} />);
  const hydro = (await screen.findByRole("heading", { name: "student-hydro" })).closest("article")!;
  const poiseuille = screen.getByRole("heading", { name: "student-poiseuille" }).closest("article")!;
  expect(within(hydro).queryByText("Verifica e prepara il prossimo passo")).toBeNull();
  expect(within(hydro).queryByLabelText("Rapporto originale r/r₀")).toBeNull();
  expect(within(hydro).getByText(/resta da verificare manualmente/)).toBeTruthy();
  expect(within(hydro).getByText("Archivia un’osservazione non pertinente")).toBeTruthy();
  expect(within(poiseuille).getByText("Verifica e prepara il prossimo passo")).toBeTruthy();
  expect(commands).toHaveLength(0);
});

test.each([
  ["missing", undefined, "fluidi"],
  ["null", null, "fluidi"],
  ["assigned-transfer", "transfer-another-thread", "fluidi"],
  ["different-capability", "taylor-exp-v1", "fluidi"],
  ["different-edition", "poiseuille-v1", "another-edition"],
] as const)("%s provenance cannot inherit the edition's Poiseuille form or infer one from the concept", async (id, origin, edition) => {
  const item = { ...thread(id, origin, edition), conceptId: "radius-power" };
  const commands = api([item]);
  render(<Diary me={teacher} editionId="fluidi" activityId="poiseuille-v1" />);
  await screen.findByRole("heading", { name: item.studentId });
  expect(screen.queryByText("Verifica e prepara il prossimo passo")).toBeNull();
  expect(screen.queryByLabelText("Rapporto originale r/r₀")).toBeNull();
  expect(screen.queryByLabelText("Argomento originale x")).toBeNull();
  expect(screen.getByText(/resta da verificare manualmente/)).toBeTruthy();
  expect(commands).toHaveLength(0);
});

test.each(["poiseuille-v1", "taylor-exp-v1"] as const)("exact %s provenance preserves the supported confirmation command and parameter family", async (activityId) => {
  const edition = activityId === "taylor-exp-v1" ? "analisi" : "fluidi";
  const item = thread("supported", activityId, edition); const commands = api([item]);
  render(<Diary me={teacher} editionId={edition} activityId={activityId} />);
  fireEvent.click(await screen.findByText("Verifica e prepara il prossimo passo"));
  for (const label of ["Spiegazione del tutor", "Criterio della rubrica", "Prossimo passo", "Nuovo problema"])
    fireEvent.change(screen.getByLabelText(label), { target: { value: "Testo originale sintetico per " + label } });
  if (activityId === "taylor-exp-v1") {
    expect(screen.queryByLabelText("Rapporto originale r/r₀")).toBeNull();
    expect(screen.getByLabelText("Argomento originale x")).toHaveProperty("value", "0.5");
  } else {
    expect(screen.queryByLabelText("Argomento originale x")).toBeNull();
    expect(screen.getByLabelText("Rapporto originale r/r₀")).toHaveProperty("value", "1.5");
  }
  fireEvent.click(screen.getByRole("button", { name: "Conferma osservazione e assegna la nuova prova" }));
  await waitFor(() => expect(commands).toHaveLength(1));
  expect(commands[0].path).toBe("/study/diary/threads/supported/confirm");
  expect(commands[0].body.transferExercise).toMatchObject(activityId === "taylor-exp-v1"
    ? { originalParameters: { x: .5, degree: 3 }, parameters: { x: -.5, degree: 3 } }
    : { originalParameters: { radiusRatio: 1.5, boundary: "pressure" }, parameters: { radiusRatio: 2, boundary: "pressure" } });
});
