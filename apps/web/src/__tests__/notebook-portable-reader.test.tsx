// @vitest-environment jsdom
import { useEffect } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { NotebookPanel } from "../../../studio/src/study/NotebookPanel";
import { beginStudySessionCheck } from "../../../studio/src/study/sessionBoundary";
import { renderPortableNotebook } from "../integrations/notebook/PortableNotebook";
import { decodePortablePdf } from "../integrations/notebook/portablePdf";
import type { NotebookSnapshot } from "../../../studio/src/study/notebookPreview";

const { webcrypto } = await vi.importActual<{ webcrypto: Crypto }>("node:crypto");
const live = vi.hoisted(() => ({ mounted: 0, peak: 0 }));
vi.mock("../integrations/notebook/PdfReader", () => ({
  PdfReader: () => {
    useEffect(() => {
      live.mounted++; live.peak = Math.max(live.peak, live.mounted);
      return () => { live.mounted--; };
    }, []);
    return <div data-testid="local-pdf">Local PDF</div>;
  },
}));
vi.mock("../integrations/notebook/FormulaPreview", () => ({
  FormulaPreview: ({ value }: { value: string }) => <span>{value}</span>,
}));
const bytes = new TextEncoder().encode("%PDF-1.7\noriginal fixture");
const assetId = "a".repeat(32);
async function fixture() {
  const sha = Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256", bytes)),
    b => b.toString(16).padStart(2, "0")).join("");
  const asset = { id: assetId, mime: "application/pdf", bytes: bytes.length, base64: btoa(String.fromCharCode(...bytes)), sha256: sha };
  function source(revisionId: string, title: string) {
    const notebook: NotebookSnapshot = { v: 1, sha256: "b".repeat(64),
      source: { assetId, sha256: sha, pageCount: 2, coordinates: "pdf-normalized-unrotated-top-left-v1" },
      state: { v: 1, title, annotations: [{ id: "a1", page: 2, rect: [.1, .2, .3, .4], kind: "formula", content: `Q_${revisionId}=Av` }] } };
    return { id: "resource", revisionId, contextId: "context", ownerId: "student", editionId: "fluidi",
      kind: "scientific-notebook", visibility: "private", sha256: "c".repeat(64),
      text: `${title}\n[p. 2] Q_${revisionId}=Av`, notebook };
  }
  return { asset, bundle: { format: "ardesia-study-notebook-v1", schemaVersion: 1,
    resources: [source("v2", "Privata V2")], resourceRevisions: [source("v1", "Consegnata V1")],
    submissions: [], assets: [asset], omissions: [] } };
}
function upload(bundle: unknown) {
  const file = new File([JSON.stringify(bundle)], "test.study.json");
  Object.defineProperty(file, "text", { value: async () => JSON.stringify(bundle) });
  fireEvent.change(screen.getByLabelText("Riapri quaderno .study.json"), { target: { files: [file] } });
}
beforeEach(() => {
  live.mounted = 0; live.peak = 0;
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ valid: true }))));
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:local"), revokeObjectURL: vi.fn() });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

test("opening exact historical revisions mounts only one local reader; close and session switch release it", async () => {
  const { bundle } = await fixture();
  render(<NotebookPanel renderSource={renderPortableNotebook} />);
  upload(bundle);
  fireEvent.click(await screen.findByRole("button", { name: "Apri pagine annotate · Consegnata V1" }));
  await screen.findByTestId("local-pdf");
  expect(screen.getByText("Q_v1=Av")).toBeTruthy();
  expect(screen.queryByText("Q_v2=Av")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Apri pagine annotate · Privata V2" }));
  await screen.findByTestId("local-pdf");
  expect(screen.getByText("Q_v2=Av")).toBeTruthy();
  expect(screen.queryByText("Q_v1=Av")).toBeNull();
  expect(live.peak).toBe(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Chiudi pagine annotate · Privata V2" }));
  expect(live.mounted).toBe(0);
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button", { name: "Apri pagine annotate · Consegnata V1" }));
  await screen.findByTestId("local-pdf");
  act(() => { beginStudySessionCheck(); });
  expect(live.mounted).toBe(0);
  expect(screen.queryByText("Quaderno riaperto")).toBeNull();
  expect(vi.mocked(fetch).mock.calls.map(call => call[0])).toEqual(["/study/notebook/inspect"]);
});
test("a wrong local binary never starts the reader even if a mocked inspection accepts it", async () => {
  const { bundle } = await fixture();
  bundle.assets[0].base64 = btoa("X".repeat(bytes.length));
  render(<NotebookPanel renderSource={renderPortableNotebook} />);
  upload(bundle);
  fireEvent.click(await screen.findByRole("button", { name: "Apri pagine annotate · Consegnata V1" }));
  await screen.findByRole("alert");
  expect(live.mounted).toBe(0);
  expect(screen.getByText("Q_v1=Av")).toBeTruthy();
});
test("late file.text completion after session change does not reach inspect or restore the preview", async () => {
  let finish!: (value: string) => void;
  const { bundle } = await fixture();
  render(<NotebookPanel renderSource={renderPortableNotebook} />);
  const file = new File(["x"], "delayed.json");
  Object.defineProperty(file, "text", { value: () => new Promise<string>(resolve => { finish = resolve; }) });
  fireEvent.change(screen.getByLabelText("Riapri quaderno .study.json"), { target: { files: [file] } });
  act(() => { beginStudySessionCheck(); });
  await act(async () => { finish(JSON.stringify(bundle)); });
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.queryByText("Quaderno riaperto")).toBeNull();
});
test("late digest completion after closing is ignored and does not create a URL or reader", async () => {
  const { bundle } = await fixture();
  let finish!: (value: ArrayBuffer) => void;
  vi.stubGlobal("crypto", { subtle: { digest: vi.fn(() => new Promise<ArrayBuffer>(resolve => { finish = resolve; })) } });
  render(<NotebookPanel renderSource={renderPortableNotebook} />);
  upload(bundle);
  fireEvent.click(await screen.findByRole("button", { name: "Apri pagine annotate · Consegnata V1" }));
  await waitFor(() => expect(crypto.subtle.digest).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: "Chiudi pagine annotate · Consegnata V1" }));
  await act(async () => { finish(await webcrypto.subtle.digest("SHA-256", bytes)); });
  expect(live.mounted).toBe(0);
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});
test("local byte decoder verifies actual SHA and rejects malformed length, over-budget and aborted work", async () => {
  const { asset } = await fixture(), controller = new AbortController();
  expect((await decodePortablePdf(asset, asset.sha256, controller.signal)).blob.size).toBe(bytes.length);
  for (const altered of [{ ...asset, bytes: bytes.length - 1 }, { ...asset, base64: "!" + asset.base64.slice(1) },
    { ...asset, bytes: 20 * 1024 * 1024 + 1 }]) {
    await expect(decodePortablePdf(altered, asset.sha256, controller.signal)).rejects.toThrow();
  }
  controller.abort();
  await expect(decodePortablePdf(asset, asset.sha256, controller.signal)).rejects.toThrow();
});
