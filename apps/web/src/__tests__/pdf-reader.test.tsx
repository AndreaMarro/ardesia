// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfReader } from "../integrations/notebook/PdfReader";
import { openPdf, type PdfTask } from "../integrations/notebook/pdfDocument";
import { renderPdfPage } from "../integrations/notebook/renderPdfPage";
import type { VerifiedOriginalAsset } from "../../../studio/src/study/originalAsset";

vi.mock("../integrations/notebook/pdfDocument", () => ({ openPdf: vi.fn() }));
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
