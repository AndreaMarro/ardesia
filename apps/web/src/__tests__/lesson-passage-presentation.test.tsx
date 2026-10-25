// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { StudyResource, Workspace } from "../api";
import { SourceLibrary } from "../components/SourceLibrary";
import { SourceViewer } from "../components/SourceViewer";
import { displaySourceTitle } from "../components/lessonPassageReference";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const digest = "a".repeat(64);
const transcript = "Pressione relativa: zero alla superficie. Pressione assoluta: superficie più colonna di liquido.";
const descriptor = {
  schema: "ardesia.lesson-passage.v1", workspaceId: "local-default",
  lessonId: "lesson-01", sessionId: "session-01", recordingId: "recording-01",
  startEpoch: 100, endEpoch: 200, sha256: digest,
  objectRefs: [{ elementId: "obj-01", version: 1, label: "R2 · Pressione relativa e assoluta" }],
  replayUrl: "http://127.0.0.1:5199/studio/?vista=replay&at=150&recording=recording-01&object=obj-01&session=session-01&sha=" +
    digest + "&objectVersion=1#lesson-01",
};
const original = JSON.stringify({
  schema: "ardesia.lesson-passage-source.v1", descriptor, transcript,
});
const resource: StudyResource = {
  id: "lesson-source-01", revisionId: "revision-01", contextId: "context-01",
  ownerId: "teacher-01", editionId: "fluidi", kind: "lesson-passage",
  visibility: "group", text: original, sha256: digest,
};
const workspace = {
  enrolled: true,
  edition: { id: "fluidi", teacherId: "teacher-01", capacity: 10,
    priceMinor: 4900, state: "collecting", sessions: [], timezone: "Europe/Rome" },
  resources: [resource], submissions: [], layouts: [], layoutSaved: false, layoutVersion: digest,
} as Workspace;

test("source library indexes the authorized exact lesson revision by a human label, never a JSON prefix", async () => {
  const onOpen = vi.fn();
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(resource))));
  render(<SourceLibrary data={workspace} full={false} onOpen={onOpen} />);
  expect(screen.getByText("R2 · Pressione relativa e assoluta")).toBeTruthy();
  expect(document.querySelector(".board-library")?.textContent).not.toContain('"schema"');
  fireEvent.click(screen.getByRole("button", { name: /Apri una vista: fonte 1/ }));
  await waitFor(() => expect(onOpen).toHaveBeenCalledWith(resource));
  expect(onOpen.mock.calls[0][0].revisionId).toBe("revision-01");
});

test("lesson source reader renders the declared transcript while preserving the exact revision", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(resource))));
  render(<SourceViewer reference={{ resourceId: resource.id, revisionId: resource.revisionId, contextId: resource.contextId }} />);
  expect(await screen.findByText(transcript)).toBeTruthy();
  expect(screen.getByText("R2 · Pressione relativa e assoluta")).toBeTruthy();
  expect(document.querySelector(".source-viewer")?.textContent).not.toContain('"schema"');
  // The compact header shows only a short revision prefix; the exact ID lives in provenance.
  expect(screen.getByText(resource.revisionId)).toBeTruthy();
});

test("invalid lesson passage fails closed with a readable title and no raw JSON display", async () => {
  const invalid = { ...resource, text: '{"schema":"ardesia.lesson-passage-source.v1","oops":true}' };
  expect(displaySourceTitle(invalid)).toBe("Passaggio della lezione non leggibile");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(invalid))));
  render(<SourceViewer reference={{ resourceId: resource.id, revisionId: resource.revisionId, contextId: resource.contextId }} />);
  expect(await screen.findByText(/non è leggibile in questa revisione/)).toBeTruthy();
  expect(document.querySelector(".source-viewer")?.textContent).not.toContain('"oops"');
});

test("teacher exact-text selection remains byte-addressed to the original structured resource", async () => {
  const onSelect = vi.fn();
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(resource))));
  render(<SourceViewer reference={{ resourceId: resource.id, revisionId: resource.revisionId, contextId: resource.contextId }} onSelect={onSelect} />);
  expect(await screen.findByText(transcript)).toBeTruthy();
  const summary = screen.getByText("Seleziona un frammento della fonte strutturata");
  fireEvent.click(summary);
  const textarea = screen.getByRole("textbox", { name: "Originale della fonte" }) as HTMLTextAreaElement;
  const start = resource.text.indexOf("Pressione relativa:");
  const end = start + "Pressione relativa:".length;
  textarea.setSelectionRange(start, end);
  fireEvent.select(textarea);
  expect(onSelect).toHaveBeenCalledWith(start, end, "Pressione relativa:");
});
