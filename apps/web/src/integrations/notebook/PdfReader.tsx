import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { VerifiedOriginalAsset } from "../../../../studio/src/study/originalAsset";
import { ErrorNotice, Loading } from "../../components/Feedback";
import { openPdf, type PdfTask } from "./pdfDocument";
import { renderPdfPage, type PdfFrame } from "./renderPdfPage";
import "./notebook.css";

export function PdfReader({ original }: { original: VerifiedOriginalAsset }) {
  const [loaded, setLoaded] = useState<{ original: VerifiedOriginalAsset; pdf: PDFDocumentProxy } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let loading: PdfTask | undefined;
    setLoaded(null); setLoadError("");
    void (async () => {
      // Blob remains immutable and downloadable; only this new buffer transfers to the worker.
      const bytes = await original.blob.arrayBuffer();
      controller.signal.throwIfAborted();
      loading = await openPdf(bytes, controller.signal);
      if (controller.signal.aborted) { void loading.destroy().catch(() => {}); return; }
      void loading.failure.then(() => {
        if (!controller.signal.aborted) {
          setLoaded(null);
          setLoadError("La lettura del PDF si è interrotta. Puoi riprovare o scaricare l’originale.");
        }
      });
      const pdf = await loading.promise;
      controller.signal.throwIfAborted();
      if (pdf.numPages < 1 || pdf.numPages > 20) throw new Error("pdf_page_limit");
      setLoaded({ original, pdf });
    })().catch(() => {
      if (!controller.signal.aborted) {
        setLoadError("Non riesco ad aprire questo PDF. Puoi riprovare o scaricare l’originale.");
        void loading?.destroy().catch(() => {});
      }
    });
    return () => {
      controller.abort();
      // Invalidate first. A blocked old worker cannot delay the next source.
      void loading?.destroy().catch(() => {});
    };
  }, [original, attempt]);
  if (loadError) return <ErrorNotice message={loadError} onRetry={() => setAttempt(n => n + 1)} />;
  if (!loaded || loaded.original !== original) return <Loading>Sto preparando le pagine…</Loading>;
  return <PdfPages key={attempt} pdf={loaded.pdf} />;
}

function PdfPages({ pdf }: { pdf: PDFDocumentProxy }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [number, setNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key?: string; frame?: PdfFrame; error?: string }>({});
  const key = `${number}/${width}/${zoom}/${rotation}/${attempt}`;
  const visible = state.key === key ? state : {};
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setState({});
    void renderPdfPage(pdf, { number, width, zoom, rotation }, controller.signal)
      .then(frame => { if (!controller.signal.aborted) setState({ key, frame }); })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ key, error: "Questa pagina non è leggibile nell’anteprima. L’originale resta disponibile." });
      });
    return () => controller.abort();
  }, [pdf, number, width, zoom, rotation, attempt, key]);
  return (
    <section className="pdf-reader" aria-label="Lettore PDF">
      <div className="pdf-toolbar">
        <div className="pdf-pagination" role="group" aria-label="Navigazione del PDF">
          <button aria-disabled={number === 1} onClick={() => setNumber(n => Math.max(1, n - 1))} aria-label="Pagina precedente">←</button>
          <label>Pagina <select aria-label="Pagina del PDF" value={number} onChange={e => setNumber(Number(e.target.value))}>
            {Array.from({ length: pdf.numPages }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
          </select><span>di {pdf.numPages}</span></label>
          <button aria-disabled={number === pdf.numPages} onClick={() => setNumber(n => Math.min(pdf.numPages, n + 1))} aria-label="Pagina successiva">→</button>
        </div>
        <div className="pdf-view-controls" role="group" aria-label="Vista del PDF">
          <select aria-label="Zoom del PDF" value={zoom} onChange={e => setZoom(Number(e.target.value))}>
            <option value={1}>Adatta alla larghezza</option><option value={1.5}>150%</option><option value={2}>200%</option>
          </select>
          <button onClick={() => setRotation(n => (n + 90) % 360)} aria-label="Ruota il PDF di 90 gradi">Ruota ↻</button>
        </div>
      </div>
      <div ref={host} className="pdf-viewport" tabIndex={0} aria-label="Pagina PDF, area scorrevole">
        {visible.error ? <ErrorNotice message={visible.error} onRetry={() => setAttempt(n => n + 1)} />
          : !visible.frame ? <Loading>Sto leggendo pagina {number}…</Loading>
          : <div className="pdf-paper" role="img" aria-label={`Pagina ${number} di ${pdf.numPages}`}
              ref={element => { if (element && visible.frame) element.replaceChildren(visible.frame.canvas); }} />}
      </div>
      <p className="pdf-page-status" role="status">
        {visible.frame ? `Pagina ${visible.frame.number} di ${pdf.numPages}` : visible.error ? "Anteprima non disponibile" : "Lettura in corso"}
      </p>
      {visible.frame && <details className="pdf-text">
        <summary>Leggi il testo di questa pagina</summary>
        <p>Trascrizione automatica del testo incorporato. Formule e impaginazione vanno verificate sull’originale.</p>
        <pre>{visible.frame.text || "Questa pagina non contiene testo estraibile. Consulta l’immagine o scarica il PDF."}</pre>
        {visible.frame.textTruncated && <p>Testo mostrato fino a 200.000 caratteri. Il PDF conserva la pagina completa.</p>}
      </details>}
    </section>
  );
}
