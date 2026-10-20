import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PageGeometry } from "./model";

export type PdfFrame = {
  canvas: HTMLCanvasElement;
  text: string;
  textTruncated: boolean;
  number: number;
  geometry: PageGeometry;
};
export type PageView = { number: number; width: number; zoom: number; rotation: number };

/** Each request owns a detached canvas. Stale work can never paint the visible page. */
export async function renderPdfPage(
  pdf: PDFDocumentProxy, view: PageView, signal: AbortSignal,
): Promise<PdfFrame> {
  signal.throwIfAborted();
  const page = await pdf.getPage(view.number);
  signal.throwIfAborted();
  const base = page.getViewport({ scale: 1, rotation: view.rotation + page.rotate });
  const scale = (Math.max(200, view.width) / base.width) * view.zoom;
  const viewport = page.getViewport({ scale, rotation: view.rotation + page.rotate });
  if (![viewport.width, viewport.height].every(n => Number.isFinite(n) && n > 0))
    throw new Error("invalid_pdf_page_geometry");
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1, 2,
    Math.sqrt(4_000_000 / (Math.ceil(viewport.width) * Math.ceil(viewport.height))),
    8192 / Math.max(viewport.width, viewport.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width * pixelRatio));
  canvas.height = Math.max(1, Math.floor(viewport.height * pixelRatio));
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas_unavailable");
  const rendering = page.render({
    canvas, canvasContext: context, viewport,
    transform: [pixelRatio, 0, 0, pixelRatio, 0, 0],
    annotationMode: 0, // No PDF forms, annotation actions or scripting host.
  });
  const cancel = () => rendering.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    await rendering.promise;
    signal.throwIfAborted();
    const content = await page.getTextContent();
    signal.throwIfAborted();
    const parts: string[] = [];
    let length = 0;
    const limit = 200_000;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const text = item.str + (item.hasEOL ? "\n" : " ");
      parts.push(text.slice(0, Math.max(0, limit - length)));
      length += text.length;
      if (length > limit) break;
    }
    return { canvas, text: parts.join("").trim(), textTruncated: length > limit, number: view.number,
      geometry: viewport };
  } finally {
    signal.removeEventListener("abort", cancel);
  }
}
