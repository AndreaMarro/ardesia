// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfReader } from "../integrations/notebook/PdfReader";
import { NotebookReading } from "../integrations/notebook/NotebookReading";
import type { NotebookState } from "../integrations/notebook/model";
import { openPdf, type PdfTask } from "../integrations/notebook/pdfDocument";
import { renderPdfPage } from "../integrations/notebook/renderPdfPage";
import type { VerifiedOriginalAsset } from "../../../studio/src/study/originalAsset";

vi.mock("../integrations/notebook/pdfDocument", () => ({ openPdf: vi.fn() }));
vi.mock("../integrations/notebook/FormulaPreview", () => ({
  FormulaPreview: ({ value }: { value: string }) => <span>{value}</span>,
}));
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const original = (id: string): VerifiedOriginalAsset => ({
  descriptor: { id, editionId: "fluidi", kind: "immutable-upload", mime: "application/pdf",
    bytes: 1, sha256: id.repeat(64).slice(0, 64), extractionStatus: "native_text" },
  blob: { arrayBuffer: async () => new ArrayBuffer(1) } as Blob,
});
function page(text: string) {
  return {
    rotate: 0,
    getViewport: vi.fn(({ scale, rotation }: { scale: number; rotation: number }) => ({
      width: (rotation % 180 ? 800 : 600) * scale, height: (rotation % 180 ? 600 : 800) * scale,
      viewBox: [0, 0, 600, 800],
      convertToViewportPoint: (x: number, y: number) => [x * scale, (800 - y) * scale],
      convertToPdfPoint: (x: number, y: number) => [x / scale, 800 - y / scale],
    })),
    render: vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() })),
    getTextContent: vi.fn(async () => ({ items: [{ str: text, hasEOL: true }] })),
  };
}
function loading(getPage = vi.fn(async () => page("CURRENT"))) {
  const pdf = { numPages: 2, getPage } as unknown as PDFDocumentProxy;
  const destroy = vi.fn(async () => {});
  const task: PdfTask = { promise: Promise.resolve(pdf), destroy, failure: new Promise(() => {}) };
  return { pdf, task, destroy };
}
beforeEach(() => {
  vi.mocked(openPdf).mockReset();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:original"), revokeObjectURL: vi.fn() });
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test.each(["getPage", "render", "getTextContent"] as const)(
  "a late %s rejection from V1 cannot overwrite V2 after source replacement",
  async phase => {
    const delayed = deferred<never>();
    const oldPage = page("OLD");
    const getPage = vi.fn(async () => oldPage);
    const first = loading(getPage), second = loading();
    vi.mocked(openPdf).mockResolvedValueOnce(first.task).mockResolvedValueOnce(second.task);
    const view = render(<PdfReader original={original("a")} />);
    await screen.findByText("OLD");
    if (phase === "getPage") getPage.mockReturnValueOnce(delayed.promise);
    else if (phase === "render") oldPage.render.mockReturnValueOnce({ promise: delayed.promise, cancel: vi.fn() });
    else oldPage.getTextContent.mockReturnValueOnce(delayed.promise);
    fireEvent.click(screen.getByRole("button", { name: "Pagina successiva" }));
    await act(async () => { await Promise.resolve(); });
    view.rerender(<PdfReader original={original("b")} />);
    await screen.findByText("CURRENT");
    await act(async () => { delayed.reject(new Error("late V1 failure")); });
    expect(screen.getByText("CURRENT")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(first.destroy).toHaveBeenCalledOnce();
  },
);

test("a late getPage success cannot publish its canvas or text after a newer page", async () => {
  const delayed = deferred<ReturnType<typeof page>>();
  const getPage = vi.fn(async () => page("ONE"));
  const first = loading(getPage);
  vi.mocked(openPdf).mockResolvedValue(first.task);
  render(<PdfReader original={original("a")} />);
  await screen.findByText("ONE");
  getPage.mockReturnValueOnce(delayed.promise);
  fireEvent.click(screen.getByRole("button", { name: "Pagina successiva" }));
  await act(async () => { await Promise.resolve(); });
  fireEvent.click(screen.getByRole("button", { name: "Pagina precedente" }));
  await screen.findByText("ONE");
  const stale = page("LATE TWO");
  await act(async () => delayed.resolve(stale));
  expect(stale.render).not.toHaveBeenCalled();
  expect(screen.queryByText("LATE TWO")).toBeNull();
  expect(screen.getByRole("img", { name: "Pagina 1 di 2" })).toBeTruthy();
});

test("new source does not wait for a stalled old worker cleanup", async () => {
  const pending = deferred<void>();
  const first = loading(), second = loading(vi.fn(async () => page("NEW SOURCE")));
  first.destroy.mockReturnValue(pending.promise);
  vi.mocked(openPdf).mockResolvedValueOnce(first.task).mockResolvedValueOnce(second.task);
  const view = render(<PdfReader original={original("a")} />);
  await screen.findByText("CURRENT");
  view.rerender(<PdfReader original={original("b")} />);
  await screen.findByText("NEW SOURCE");
  expect(first.destroy).toHaveBeenCalledOnce();
  await act(async () => pending.resolve());
});

test("closing before Blob conversion finishes never creates a worker", async () => {
  const bytes = deferred<ArrayBuffer>();
  const source = original("a");
  source.blob = { arrayBuffer: () => bytes.promise } as Blob;
  const view = render(<PdfReader original={source} />);
  view.unmount();
  await act(async () => bytes.resolve(new ArrayBuffer(1)));
  expect(openPdf).not.toHaveBeenCalled();
});

test("a local PDF with a different page count never renders annotations against the wrong geometry", async () => {
  const first = loading();
  const overlay = vi.fn(() => <span>Misbound annotation</span>);
  vi.mocked(openPdf).mockResolvedValue(first.task);
  render(<PdfReader original={original("a")} expectedPages={3} overlay={overlay} />);
  await screen.findByRole("alert");
  expect(first.pdf.getPage).not.toHaveBeenCalled();
  expect(overlay).not.toHaveBeenCalled();
  expect(first.destroy).toHaveBeenCalledOnce();
});

test("render failure offers retry and preserves the document", async () => {
  const first = loading();
  first.pdf.getPage = vi.fn().mockRejectedValueOnce(new Error("render failed"))
    .mockResolvedValueOnce(page("RECOVERED"));
  vi.mocked(openPdf).mockResolvedValue(first.task);
  render(<PdfReader original={original("a")} />);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  await screen.findByText("RECOVERED");
  expect(first.destroy).not.toHaveBeenCalled();
});

test("raster size stays bounded without omitting large source images", async () => {
  const first = loading();
  const result = await renderPdfPage(first.pdf,
    { number: 1, width: 8000, zoom: 2, rotation: 90 }, new AbortController().signal);
  expect(result.canvas.width * result.canvas.height).toBeLessThanOrEqual(4_000_000);
  expect(Math.max(result.canvas.width, result.canvas.height)).toBeLessThanOrEqual(8192);
  expect(result.text).toBe("CURRENT");
});

const notebook = (content = "Q=Av", annotationPage = 2): NotebookState => ({
  v: 1, title: "Continuità", annotations: [
    { id: "formula-1", page: annotationPage, rect: [.1, .2, .3, .1], kind: "formula", content },
  ],
});

test("a reading annotation opens its exact page again after manual navigation without reloading the PDF", async () => {
  const source = original("a"), first = loading();
  vi.mocked(openPdf).mockResolvedValue(first.task);
  render(<NotebookReading state={notebook()} revisionId="revision-1" original={source} assetId="a" pageCount={2} />);
  await screen.findByRole("img", { name: "Pagina 1 di 2" });
  fireEvent.click(screen.getByRole("button", { name: "Apri pagina 2, annotazione 1" }));
  await screen.findByRole("img", { name: "Pagina 2 di 2" });
  expect(document.activeElement).toBe(screen.getByRole("region", { name: "Pagina PDF, area scorrevole" }));
  fireEvent.click(screen.getByRole("button", { name: "Pagina precedente" }));
  await screen.findByRole("img", { name: "Pagina 1 di 2" });
  fireEvent.click(screen.getByRole("button", { name: "Apri pagina 2, annotazione 1" }));
  await screen.findByRole("img", { name: "Pagina 2 di 2" });
  expect(openPdf).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

test("a pending annotation jump cannot survive a revision change on the same PDF", async () => {
  const source = original("a"), delayed = deferred<ReturnType<typeof page>>();
  const oldGetPage = vi.fn(async () => page("OLD PAGE"));
  const first = loading(oldGetPage), second = loading(vi.fn(async () => page("NEW PAGE")));
  vi.mocked(openPdf).mockResolvedValueOnce(first.task).mockResolvedValueOnce(second.task);
  const view = render(<NotebookReading state={notebook("old formula")} revisionId="revision-1"
    original={source} assetId="a" pageCount={2} />);
  await screen.findByRole("img", { name: "Pagina 1 di 2" });
  oldGetPage.mockReturnValueOnce(delayed.promise);
  fireEvent.click(screen.getByRole("button", { name: "Apri pagina 2, annotazione 1" }));
  await act(async () => { await Promise.resolve(); });
  view.rerender(<NotebookReading state={notebook("new formula")} revisionId="revision-2"
    original={source} assetId="a" pageCount={2} />);
  await screen.findByText("NEW PAGE");
  await act(async () => delayed.resolve(page("LATE OLD PAGE")));
  expect(screen.getByRole("img", { name: "Pagina 1 di 2" })).toBeTruthy();
  expect(screen.queryByText("LATE OLD PAGE")).toBeNull();
  expect(screen.queryByText("old formula")).toBeNull();
  expect(second.pdf.getPage).toHaveBeenCalledExactlyOnceWith(1);
  expect(first.destroy).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

test("page requests reject malformed pages and requests bound to another original", async () => {
  const source = original("a"), first = loading();
  vi.mocked(openPdf).mockResolvedValue(first.task);
  const view = render(<PdfReader original={source} pageRequest={{ original: source, page: 2 }} />);
  await screen.findByRole("img", { name: "Pagina 2 di 2" });
  vi.mocked(first.pdf.getPage).mockClear();
  for (const invalid of [0, -1, 1.5, 3, Number.NaN, Infinity, Number.MAX_VALUE]) {
    view.rerender(<PdfReader original={source} pageRequest={{ original: source, page: invalid }} />);
    await act(async () => { await Promise.resolve(); });
  }
  view.rerender(<PdfReader original={source} pageRequest={{ original: original("b"), page: 1 }} />);
  await act(async () => { await Promise.resolve(); });
  expect(screen.getByRole("img", { name: "Pagina 2 di 2" })).toBeTruthy();
  expect(first.pdf.getPage).not.toHaveBeenCalled();
});

test("reading notes remain available without offering navigation to missing PDFs or invalid pages", async () => {
  const view = render(<NotebookReading state={notebook()} revisionId="revision-1" assetId="a" pageCount={2} />);
  expect(screen.getByText("Q=Av")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Apri pagina/ })).toBeNull();
  vi.mocked(openPdf).mockResolvedValue(loading().task);
  view.rerender(<NotebookReading state={notebook("Q=Av", 3)} revisionId="revision-1"
    original={original("a")} assetId="a" pageCount={2} />);
  await screen.findByRole("img", { name: "Pagina 1 di 2" });
  expect(screen.queryByRole("button", { name: /Apri pagina/ })).toBeNull();
});
