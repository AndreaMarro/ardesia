// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NotebookPanel } from "../../../studio/src/study/NotebookPanel";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const source = (revisionId: string, text: string) => ({
  id: "same-source",
  revisionId,
  text,
  contextId: "context",
  ownerId: "student",
  editionId: "analysis",
  kind: "notes",
  visibility: "private",
  sha256: "a".repeat(64),
});
const bundle = {
  format: "ardesia-study-notebook-v1",
  schemaVersion: 1,
  resources: [source("v2", "Nuova bozza privata v2")],
  resourceRevisions: [source("v1", "Procedimento consegnato v1")],
  unavailableResourceRefs: [],
  submissions: [
    {
      id: "submission",
      student_id: "student",
      text: "Tentativo",
      revision: 1,
      parent_id: null,
      receipt_id: "receipt",
      source_refs: [
        { resourceId: "same-source", revisionId: "v1", contextId: "context" },
      ],
      asset_refs: [],
      feedback: [],
    },
  ],
  assets: [],
  omissions: [
    "Solo versioni correnti accessibili e revisioni referenziate, senza storia completa.",
  ],
};
function upload(value: unknown) {
  const file = new File([JSON.stringify(value)], "quaderno.study.json", {
    type: "application/json",
  });
  Object.defineProperty(file, "text", {
    value: async () => JSON.stringify(value),
  });
  fireEvent.change(screen.getByLabelText("Riapri quaderno .study.json"), {
    target: { files: [file] },
  });
}
function setup(extra = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            valid: true,
            resources: 1,
            resourceRevisions: 1,
            submissions: 1,
            canonicalAuthenticity: "NOT_VERIFIED",
            referenceIntegrity: "CHECKED_INTERNALLY",
            referenceIntegrityScope: "RESOURCE_REVISION_REFERENCES",
            referencesComplete: true,
            ...extra,
          }),
        ),
    ),
  );
  render(<NotebookPanel editionId="analysis" />);
}
test("portable preview renders exact historical and current pairs; never substitutes a current head for a submitted pin", async () => {
  setup();
  upload(bundle);
  await screen.findByText("Procedimento consegnato v1");
  expect(screen.getByText("Nuova bozza privata v2")).toBeTruthy();
  expect(screen.queryByText("Versione non collegata v0")).toBeNull();
  expect(screen.getByText(/Autenticità canonica non verificata/)).toBeTruthy();
  expect(
    (fetch as ReturnType<typeof vi.fn>).mock.calls.map((call) => call[0]),
  ).toEqual(["/study/notebook/inspect"]);
});
test("a tutor artifact with no readable current head still renders the submitted historical snapshot", async () => {
  setup();
  upload({ ...bundle, resources: [] });
  await screen.findByText("Procedimento consegnato v1");
  expect(screen.queryByText("Nuova bozza privata v2")).toBeNull();
});
test("malformed presentation fields are rejected even when an internal-integrity inspect could accept them", async () => {
  setup();
  upload({ ...bundle, submissions: [{}] });
  await screen.findByText(/struttura non leggibile/);
  expect(screen.queryByText("Quaderno riaperto")).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
test("legacy reference scope and declared missing revisions remain explicit; no head is opened to fill the gap", async () => {
  setup({ referenceIntegrity: "NOT_CHECKED_LEGACY", referencesComplete: null });
  const { resourceRevisions: _, ...legacy } = bundle;
  void _;
  upload(legacy);
  await screen.findByText(
    /Formato precedente: i riferimenti storici non sono verificati/,
  );
  expect(
    screen.getByText(/versione non inclusa, nessuna sostituzione/),
  ).toBeTruthy();
});
test("declared losses and unsigned authenticity are visible without granting imported access", async () => {
  setup({
    referenceIntegrity: "CHECKED_WITH_DECLARED_LOSSES",
    referencesComplete: false,
  });
  upload({
    ...bundle,
    resourceRevisions: [],
    unavailableResourceRefs: [
      { resourceId: "same-source", revisionId: "v1", reason: "unavailable" },
    ],
  });
  await screen.findByText("Revisioni dichiarate non disponibili");
  expect(screen.getByText(/versioni non disponibili dichiarate/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Apri.*Core/ })).toBeNull();
});
test("unsupported artifacts never enter the preview or the inspect API", async () => {
  setup();
  upload({ ...bundle, format: "lesson-v0" });
  await screen.findByText(/Quaderno non supportato/);
  expect(fetch).not.toHaveBeenCalled();
});
test("source text stays escaped and file sizes above the old75MiB ceiling reach the96MiB inspect boundary", async () => {
  setup();
  const text = '<img src=x onerror="globalThis.injected=true">';
  const value = { ...bundle, resources: [source("v2", text)] };
  const file = new File(["fixture"], "quaderno.study.json");
  Object.defineProperty(file, "text", {
    value: async () => JSON.stringify(value),
  });
  Object.defineProperty(file, "size", { value: 79_756_325 });
  fireEvent.change(screen.getByLabelText("Riapri quaderno .study.json"), {
    target: { files: [file] },
  });
  await screen.findByText(text);
  expect(document.querySelector("img")).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(1);
});
test("download uses the same compact JSON representation that the inspect client sends", async () => {
  let serialized: Blob | undefined;
  const createObjectURL = vi.fn((blob: Blob) => {
    serialized = blob;
    return "blob:local-preview";
  });
  vi.stubGlobal("URL", { createObjectURL, revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const fetcher = vi.fn(
    async (_path: string) => new Response(JSON.stringify(bundle)),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<NotebookPanel editionId="analysis" />);
  fireEvent.click(screen.getByRole("button", { name: "Esporta quaderno" }));
  await waitFor(() =>
    expect(serialized?.size).toBe(new Blob([JSON.stringify(bundle)]).size),
  );
  expect(fetcher.mock.calls[0][0]).toBe("/study/notebook?editionId=analysis");
});
