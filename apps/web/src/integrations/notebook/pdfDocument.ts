import type { PDFDocumentProxy } from "pdfjs-dist";

export type PdfTask = {
  promise: Promise<PDFDocumentProxy>;
  failure: Promise<Error>;
  destroy: () => Promise<void>;
};

/** Import only on opening a PDF; bytes have already passed Core/client validation. */
export async function openPdf(bytes: ArrayBuffer, signal: AbortSignal): Promise<PdfTask> {
  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  signal.throwIfAborted();
  // Own a fresh port per attempt. PDF.js's automatic fake-worker fallback caches
  // a failed module import for the lifetime of the page and cannot retry a 503.
  const port = new Worker(workerModule.default, { type: "module" });
  const worker = (() => {
    try { return pdfjs.PDFWorker.create({ port }); }
    catch (error) { port.terminate(); throw error; }
  })();
  const base = new URL(`${import.meta.env.BASE_URL}pdfjs/6.4.299/`, location.href).href;
  let task: ReturnType<typeof pdfjs.getDocument>;
  try { task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    worker,
    cMapUrl: `${base}cmaps/`, cMapPacked: true,
    standardFontDataUrl: `${base}standard_fonts/`,
    iccUrl: `${base}iccs/`, wasmUrl: `${base}wasm/`,
    enableXfa: false, stopAtErrors: true,
    // Resize decoded images when possible. This is not a process-memory ceiling.
    canvasMaxAreaInBytes: 16 * 1024 * 1024,
    // Do not silently omit scans larger than the original prototype's 4M pixels.
    maxImageSize: -1,
  }); } catch (error) {
    worker.destroy(); port.terminate(); throw error;
  }
  let report!: (error: Error) => void;
  const failure = new Promise<Error>(resolve => { report = resolve; });
  let closed = false;
  let cleanup: Promise<void> | undefined;
  const stop = () => {
    if (cleanup) return cleanup;
    closed = true;
    signal.removeEventListener("abort", abort);
    port.removeEventListener("error", failed);
    port.removeEventListener("messageerror", failed);
    report(new Error("pdf_closed"));
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Give healthy workers time to release fonts/transports. A failed worker may
    // never answer; it still gets terminated without blocking the next source.
    cleanup = Promise.race([
      task.destroy().catch(() => {}),
      new Promise<void>(resolve => { timer = setTimeout(resolve, 1000); }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
      worker.destroy(); port.terminate();
    });
    return cleanup;
  };
  const abort = () => { void stop(); };
  const failed = () => {
    if (closed) return;
    report(new Error("pdf_worker_failed"));
    void stop();
  };
  port.addEventListener("error", failed);
  port.addEventListener("messageerror", failed);
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) void stop();
  const promise = Promise.race([task.promise, failure.then(error => { throw error; })]);
  // A caller may close between this function's return and observing its task.
  void promise.catch(() => {});
  return {
    promise,
    failure,
    destroy: stop,
  };
}
