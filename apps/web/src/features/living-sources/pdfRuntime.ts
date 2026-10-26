import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  EventBus,
  PDFViewer,
  PDFLinkService,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import { openPdf, type PdfTask } from "../../integrations/notebook/pdfDocument";
export type ReaderRuntime = {
  pdf: PDFDocumentProxy;
  viewer: PDFViewer;
  links: PDFLinkService;
  bus: EventBus;
  failure: Promise<Error>;
  destroy: () => void;
};
/** Full installed upstream viewer over the existing retryable, isolated PDF loader. */
export async function createReader(
  blob: Blob,
  container: HTMLDivElement,
  viewerElement: HTMLDivElement,
  signal: AbortSignal,
): Promise<ReaderRuntime> {
  const pdfjs = await import("pdfjs-dist");
  const upstream = await import("pdfjs-dist/web/pdf_viewer.mjs");
  signal.throwIfAborted();
  let task: PdfTask | undefined, viewer: PDFViewer | undefined;
  let closed = false;
  const destroy = () => {
    if (closed) return;
    closed = true;
    signal.removeEventListener("abort", destroy);
    viewer?.setDocument(null);
    void task?.destroy().catch(() => {});
  };
  signal.addEventListener("abort", destroy, { once: true });
  try {
    const bytes = await blob.arrayBuffer();
    signal.throwIfAborted();
    task = await openPdf(bytes, signal);
    const pdf = await task.promise;
    signal.throwIfAborted();
    if (pdf.numPages < 1 || pdf.numPages > 20) throw Error("pdf_page_limit");
    const bus = new upstream.EventBus(),
      links = new upstream.PDFLinkService({ eventBus: bus });
    const find = new upstream.PDFFindController({
      eventBus: bus,
      linkService: links,
    });
    viewer = new upstream.PDFViewer({
      container,
      viewer: viewerElement,
      eventBus: bus,
      linkService: links,
      findController: find,
      annotationMode: pdfjs.AnnotationMode.DISABLE,
      annotationEditorMode: pdfjs.AnnotationEditorType.DISABLE,
      textLayerMode: 1,
      enableAutoLinking: false,
      maxCanvasPixels: 8 * 1024 * 1024,
      ...{ abortSignal: signal },
    });
    links.externalLinkEnabled = false;
    links.setViewer(viewer);
    links.setDocument(pdf);
    viewer.setDocument(pdf);
    return { pdf, viewer, links, bus, failure: task.failure, destroy };
  } catch (error) {
    destroy();
    throw error;
  }
}
export async function nativeText(
  pdf: PDFDocumentProxy,
  page: number,
): Promise<string> {
  const content = await (await pdf.getPage(page)).getTextContent();
  return content.items.map((i) => ("str" in i ? i.str : "")).join("");
}
