import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";
import type {
  EventBus,
  PDFViewer,
  PDFLinkService,
} from "pdfjs-dist/web/pdf_viewer.mjs";
export type ReaderRuntime = {
  pdf: PDFDocumentProxy;
  viewer: PDFViewer;
  links: PDFLinkService;
  bus: EventBus;
  destroy: () => void;
};
/** Adopt the full installed upstream viewer; no second PDF.js, CDN, fake worker or scripting manager. */
export async function createReader(
  blob: Blob,
  container: HTMLDivElement,
  viewerElement: HTMLDivElement,
  signal: AbortSignal,
): Promise<ReaderRuntime> {
  const pdfjs = await import("pdfjs-dist");
  const [upstream, workerUrl] = await Promise.all([
    import("pdfjs-dist/web/pdf_viewer.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  signal.throwIfAborted();
  const port = new Worker(workerUrl.default, { type: "module" });
  const worker = pdfjs.PDFWorker.create({ port });
  let task: PDFDocumentLoadingTask | undefined;
  let viewer: PDFViewer | undefined;
  let closed = false;
  const destroy = () => {
    if (closed) return;
    closed = true;
    signal.removeEventListener("abort", destroy);
    viewer?.setDocument(null);
    void task?.destroy().catch(() => {});
    worker.destroy();
    port.terminate();
  };
  signal.addEventListener("abort", destroy, { once: true });
  try {
    const bytes = await blob.arrayBuffer();
    signal.throwIfAborted();
    const base = new URL(
      `${import.meta.env.BASE_URL}pdfjs/6.4.299/`,
      location.href,
    ).href;
    task = pdfjs.getDocument({
      data: new Uint8Array(bytes),
      worker,
      enableXfa: false,
      stopAtErrors: true,
      cMapUrl: base + "cmaps/",
      cMapPacked: true,
      standardFontDataUrl: base + "standard_fonts/",
      iccUrl: base + "iccs/",
      wasmUrl: base + "wasm/",
      canvasMaxAreaInBytes: 16 * 1024 * 1024,
    });
    const pdf = await task.promise;
    signal.throwIfAborted();
    if (pdf.numPages < 1 || pdf.numPages > 20) throw Error("pdf_page_limit");
    const bus = new upstream.EventBus();
    const links = new upstream.PDFLinkService({ eventBus: bus });
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
      // Upstream 6.4.299 supports AbortSignal cleanup; its generated d.ts omits it.
      ...{ abortSignal: signal },
    });
    links.externalLinkEnabled = false;
    links.setViewer(viewer);
    links.setDocument(pdf);
    viewer.setDocument(pdf);
    return { pdf, viewer, links, bus, destroy };
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
