import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { createReader, nativeText, type ReaderRuntime } from "./pdfRuntime";
import {
  normalizedRects,
  textSelector,
  verifyTextSelector,
  targetFor,
  type SourceTarget,
  type LivingSource,
  type LivingAnnotation,
} from "./model";
import {
  displayRect,
  type Rect,
  type PageGeometry,
} from "../../integrations/notebook/model";
import "pdfjs-dist/web/pdf_viewer.css";
import "./living-sources.css";

type Props = {
  source: LivingSource;
  blob: Blob;
  target?: SourceTarget;
  resume?: LivingAnnotation["resume"];
  onSelect: (target: SourceTarget) => void;
  onResume: (resume: NonNullable<LivingAnnotation["resume"]>) => void;
};
export function PdfSurface({
  source,
  blob,
  target,
  resume,
  onSelect,
  onResume,
}: Props) {
  const container = useRef<HTMLDivElement>(null),
    pages = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState<ReaderRuntime | null>(null),
    [error, setError] = useState("");
  const [, setTick] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [zoomValue, setZoomValue] = useState("page-width");
  const [page, setPage] = useState(1),
    [mode, setMode] = useState<"text" | "region" | "pan">("text"),
    [query, setQuery] = useState(""),
    [matches, setMatches] = useState("");
  const [outline, setOutline] = useState<Awaited<
      ReturnType<PDFDocumentProxy["getOutline"]>
    > | null>(null),
    [text, setText] = useState("");
  const [selection, setSelection] = useState<SourceTarget | null>(null),
    [anchorNotice, setAnchorNotice] = useState("");
  const callbacks = useRef({ onSelect, onResume });
  callbacks.current = { onSelect, onResume };
  const pan = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  useLayoutEffect(() => {
    const ac = new AbortController();
    let active: ReaderRuntime | undefined;
    setRuntime(null);
    setError("");
    setSelection(null);
    void createReader(blob, container.current!, pages.current!, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) {
          r.destroy();
          return;
        }
        active = r;
        if (r.pdf.numPages !== source.document.pageCount)
          throw Error("source_page_count_mismatch");
        r.bus.on("pagesinit", () => {
          if (!ac.signal.aborted) {
            r.viewer.currentScaleValue = "page-width";
            setTick((n) => n + 1);
          }
        });
        r.bus.on("pagerendered", ({ error }: { error?: unknown }) => {
          if (!ac.signal.aborted) {
            setTick((n) => n + 1);
            if (error)
              setError(
                "Anteprima della pagina non disponibile. Usa il testo accessibile o scarica l’originale.",
              );
          }
        });
        r.bus.on("pagechanging", ({ pageNumber }: { pageNumber: number }) => {
          if (!ac.signal.aborted) {
            setPage(pageNumber);
            setSelection(null);
          }
        });
        r.bus.on(
          "updatefindmatchescount",
          ({
            matchesCount,
          }: {
            matchesCount: { current: number; total: number };
          }) => {
            if (!ac.signal.aborted)
              setMatches(`${matchesCount.current} / ${matchesCount.total}`);
          },
        );
        void r.failure.then(() => {
          if (!ac.signal.aborted) {
            r.destroy();
            setRuntime(null);
            setError(
              "La lettura del PDF si è interrotta. Puoi riprovare o scaricare l’originale.",
            );
          }
        });
        setRuntime(r);
        void r.viewer.pagesPromise.then(() => {
          if (!ac.signal.aborted) r.viewer.currentScaleValue = "page-width";
        });
        void r.pdf.getOutline().then((o) => {
          if (!ac.signal.aborted) setOutline(o);
        });
      })
      .catch(() => {
        if (!ac.signal.aborted)
          setError(
            "Il PDF non è leggibile. Riprova l’apertura o scarica l’originale.",
          );
      });
    return () => {
      ac.abort();
      active?.destroy();
    };
  }, [blob, source.document.pageCount, attempt]);
  useEffect(() => {
    if (!runtime) return;
    let valid = true;
    setText("");
    void nativeText(runtime.pdf, page)
      .then((t) => {
        if (valid) setText(t);
      })
      .catch(() => {
        if (valid)
          setError("Il testo nativo di questa pagina non è disponibile.");
      });
    return () => {
      valid = false;
    };
  }, [runtime, page]);
  useEffect(() => {
    if (!runtime || !target) return;
    let valid = true;
    const move = async () => {
      await runtime.viewer.pagesPromise;
      if (
        !valid ||
        !container.current?.isConnected ||
        !container.current.offsetParent
      )
        return;
      runtime.viewer.currentPageNumber = target.page;
      if (resume) {
        setZoomValue(String(resume.scale));
        runtime.viewer.currentScale = resume.scale;
        container.current!.scrollLeft = resume.left;
        container.current!.scrollTop = resume.top;
      }
      const pv = runtime.viewer.getPageView(target.page - 1);
      if (!pv.pdfPage) {
        await runtime.pdf.getPage(target.page);
      }
      const t = await nativeText(runtime.pdf, target.page);
      if (!valid) return;
      setAnchorNotice(
        target.text && !verifyTextSelector(t, target.text)
          ? "La selezione testuale non coincide con questa pagina. Il riferimento resta visibile, senza riancoraggio automatico."
          : "Pagina e regione della revisione citata ripristinate.",
      );
      // Center the first saved region using the actual rotated viewport.
      if (!resume && pv.viewport) {
        const [x, y] = displayRect(pv.viewport, target.rects[0]);
        container.current!.scrollTop = pv.div.offsetTop + Math.max(0, y - 100);
        container.current!.scrollLeft = Math.max(0, x - 60);
      }
      setTick((n) => n + 1);
    };
    void move().catch(() => {
      if (valid)
        setAnchorNotice(
          "Questo riferimento non è disponibile in questa pagina.",
        );
    });
    return () => {
      valid = false;
    };
  }, [runtime, target, resume]);
  useEffect(() => {
    if (!runtime || !container.current) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!container.current?.isConnected || !container.current.offsetParent)
          return;
        if (zoomValue === "page-width")
          runtime.viewer.currentScaleValue = "page-width";
        setTick((n) => n + 1);
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(container.current);
    runtime.bus.on("scalechanging", update);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      runtime.bus.off("scalechanging", update);
    };
  }, [runtime, zoomValue]);
  function find(previous = false) {
    runtime?.bus.dispatch("find", {
      source: container.current,
      type: "again",
      query,
      phraseSearch: true,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: previous,
      matchDiacritics: false,
    });
  }
  function capture() {
    if (mode !== "text" || !runtime) return;
    const sel = window.getSelection();
    if (!sel?.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0),
      element = range.startContainer.parentElement?.closest(".textLayer");
    if (
      !element ||
      element !== range.endContainer.parentElement?.closest(".textLayer") ||
      !pages.current?.contains(element)
    ) {
      setSelection(null);
      return;
    }
    const p = Number(
      element.closest("[data-page-number]")?.getAttribute("data-page-number"),
    );
    const pv = runtime.viewer.getPageView(p - 1),
      box = element.getBoundingClientRect();
    const prefix = document.createRange();
    prefix.selectNodeContents(element);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length,
      exact = range.toString(),
      all = element.textContent ?? "";
    if (!exact || exact.length > 5000) return;
    const rects = normalizedRects(
      pv.viewport,
      Array.from(range.getClientRects())
        .filter((r) => r.width > 0 && r.height > 0)
        .slice(0, 50)
        .map((r) => [
          ((r.left - box.left) * pv.viewport.width) / box.width,
          ((r.top - box.top) * pv.viewport.height) / box.height,
          (r.width * pv.viewport.width) / box.width,
          (r.height * pv.viewport.height) / box.height,
        ]),
    );
    if (!rects.length) return;
    const selector = textSelector(all, start, start + exact.length);
    void nativeText(runtime.pdf, p).then((t) => {
      if (verifyTextSelector(t, selector))
        setSelection(targetFor(source, p, rects, selector));
      else
        setAnchorNotice(
          "Selezione non allineata al testo nativo. Usa il testo accessibile o una regione grafica.",
        );
    });
  }
  function savePosition() {
    if (runtime && container.current)
      callbacks.current.onResume({
        scale: runtime.viewer.currentScale,
        left: container.current.scrollLeft,
        top: container.current.scrollTop,
      });
  }
  const overlays = runtime
    ? Array.from({ length: runtime.pdf.numPages }, (_, i) => {
        const pv = runtime.viewer.getPageView(i);
        if (!pv?.pdfPage || !container.current) return null;
        // PDFViewer owns and may remove every child of its page div on zoom/reset.
        // React owns only this separate sibling tree; never portal into upstream DOM.
        const box = pv.div.getBoundingClientRect(),
          host = container.current.getBoundingClientRect();
        return (
          <div
            key={i}
            className="ls-page-overlay"
            style={{
              left: box.left - host.left + container.current.scrollLeft,
              top: box.top - host.top + container.current.scrollTop,
              width: pv.viewport.width,
              height: pv.viewport.height,
              transform: `scale(${box.width / pv.viewport.width},${box.height / pv.viewport.height})`,
            }}
          >
            <RegionLayer
              geometry={pv.viewport}
              mode={mode}
              rects={target?.page === i + 1 ? target.rects : []}
              onSelect={(rect) =>
                callbacks.current.onSelect(targetFor(source, i + 1, [rect]))
              }
            />
          </div>
        );
      })
    : null;
  return (
    <section className="ls-reader" aria-label="Lettore della fonte originale">
      <div className="ls-toolbar" aria-label="Strumenti di lettura">
        <button
          disabled={!runtime || page === 1}
          onClick={() => {
            if (runtime) runtime.viewer.currentPageNumber = page - 1;
          }}
          aria-label="Pagina precedente"
        >
          Precedente
        </button>
        <label>
          Pagina{" "}
          <select
            aria-label="Pagina del documento"
            value={page}
            onChange={(e) => {
              if (runtime)
                runtime.viewer.currentPageNumber = Number(e.target.value);
            }}
          >
            {Array.from({ length: source.document.pageCount }, (_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>{" "}
          / {source.document.pageCount}
        </label>
        <button
          disabled={!runtime || page === source.document.pageCount}
          onClick={() => {
            if (runtime) runtime.viewer.currentPageNumber = page + 1;
          }}
          aria-label="Pagina successiva"
        >
          Successiva
        </button>
        <label>
          Zoom{" "}
          <select
            aria-label="Zoom del documento"
            value={zoomValue}
            onChange={(e) => {
              setZoomValue(e.target.value);
              if (runtime) runtime.viewer.currentScaleValue = e.target.value;
            }}
          >
            {!["page-width", "0.75", "1", "1.5", "2"].includes(zoomValue) && (
              <option value={zoomValue}>
                {Math.round(Number(zoomValue) * 100)}%
              </option>
            )}
            <option value="page-width">Larghezza</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
          </select>
        </label>
        {(["text", "region", "pan"] as const).map((m) => (
          <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {m === "text" ? "Testo" : m === "region" ? "Regione" : "Sposta"}
          </button>
        ))}
        <button disabled={!runtime} onClick={savePosition}>
          Conserva vista
        </button>
        <form
          className="ls-search"
          onSubmit={(e) => {
            e.preventDefault();
            find();
          }}
        >
          <input
            aria-label="Cerca nel PDF"
            value={query}
            maxLength={200}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca nel PDF"
          />
          <button disabled={!query || !runtime}>Cerca</button>
          <button
            type="button"
            disabled={!query || !runtime}
            onClick={() => find(true)}
            aria-label="Risultato precedente"
          >
            Indietro
          </button>
          <output aria-live="polite">{matches}</output>
        </form>
      </div>
      {selection && (
        <div className="ls-selection">
          <span>{selection.text?.exact}</span>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onSelect(selection);
              setSelection(null);
            }}
          >
            Collega selezione testuale
          </button>
        </div>
      )}
      {anchorNotice && <p role="status">{anchorNotice}</p>}
      {error && (
        <div>
          <p role="alert">{error}</p>
          <button onClick={() => setAttempt((n) => n + 1)}>
            Riprova lettura PDF
          </button>
        </div>
      )}
      <div className="ls-document-layout">
        <aside className="ls-pages" aria-label="Pagine e sezioni">
          <details open>
            <summary>Miniature</summary>
            {runtime &&
              Array.from({ length: source.document.pageCount }, (_, i) => (
                <Thumbnail
                  key={i}
                  pdf={runtime.pdf}
                  page={i + 1}
                  selected={page === i + 1}
                  onOpen={() => {
                    runtime.viewer.currentPageNumber = i + 1;
                  }}
                />
              ))}
          </details>
          <details>
            <summary>Sezioni del documento</summary>
            {outline?.length ? (
              <Outline
                items={outline}
                onOpen={(dest) => {
                  void runtime?.links.goToDestination(dest);
                }}
              />
            ) : (
              <p>Nessun indice incorporato.</p>
            )}
          </details>
        </aside>
        <div className="ls-stage">
          <div
            ref={container}
            className={`ls-viewport ls-${mode}`}
            role="region"
            tabIndex={0}
            aria-label="Documento PDF, scorrimento e selezione"
            onMouseUp={capture}
            onKeyUp={capture}
            onKeyDown={(e) => {
              if (
                mode === "pan" &&
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
                container.current!.scrollBy(
                  e.key === "ArrowRight" ? 60 : e.key === "ArrowLeft" ? -60 : 0,
                  e.key === "ArrowDown" ? 60 : e.key === "ArrowUp" ? -60 : 0,
                );
              }
            }}
            onPointerDown={(e) => {
              if (mode === "pan") {
                pan.current = {
                  x: e.clientX,
                  y: e.clientY,
                  left: e.currentTarget.scrollLeft,
                  top: e.currentTarget.scrollTop,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
                e.preventDefault();
              }
            }}
            onPointerMove={(e) => {
              const p = pan.current;
              if (p) {
                e.currentTarget.scrollLeft = p.left + p.x - e.clientX;
                e.currentTarget.scrollTop = p.top + p.y - e.clientY;
              }
            }}
            onPointerUp={() => {
              pan.current = null;
            }}
            onPointerCancel={() => {
              pan.current = null;
            }}
          >
            <div ref={pages} className="pdfViewer" />
            <div className="ls-overlays">{overlays}</div>
          </div>
        </div>
      </div>
      <details className="ls-accessible">
        <summary>Testo accessibile e selezione da tastiera</summary>
        <p>
          Testo nativo incorporato, senza OCR. Controlla formule e ordine
          sull’originale.
        </p>
        {text ? (
          <textarea
            aria-label="Testo nativo della pagina"
            readOnly
            value={text}
            rows={6}
            onSelect={(e) => {
              const el = e.currentTarget;
              if (
                el.selectionEnd > el.selectionStart &&
                el.selectionEnd - el.selectionStart <= 5000
              )
                setSelection(
                  targetFor(
                    source,
                    page,
                    [[0, 0, 1, 1]],
                    textSelector(text, el.selectionStart, el.selectionEnd),
                  ),
                );
            }}
          />
        ) : (
          <p>
            Pagina grafica: nessun testo nativo disponibile. Seleziona una
            regione; nessun riconoscimento è stato eseguito.
          </p>
        )}
        <button
          onClick={() =>
            onSelect(targetFor(source, page, [[0.1, 0.1, 0.8, 0.25]]))
          }
        >
          Seleziona una regione da tastiera
        </button>
      </details>
      <p className="ls-attribution">
        Lettore Mozilla PDF.js 6.4.299 ·{" "}
        <a href="/pdfjs/6.4.299/LICENSE" download>
          Licenza Apache 2.0
        </a>
      </p>
    </section>
  );
}
function RegionLayer({
  geometry,
  mode,
  rects,
  onSelect,
}: {
  geometry: PageGeometry;
  mode: string;
  rects: Rect[];
  onSelect: (r: Rect) => void;
}) {
  const start = useRef<[number, number] | null>(null);
  const [draft, setDraft] = useState<Rect | null>(null);
  const point = (e: PointerEvent<HTMLDivElement>): [number, number] => {
    const b = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - b.left) * geometry.width) / b.width,
      ((e.clientY - b.top) * geometry.height) / b.height,
    ];
  };
  return (
    <div
      className={`ls-overlay ${mode === "region" ? "ls-drawing" : ""}`}
      aria-hidden="true"
      onPointerDown={(e) => {
        if (mode !== "region" || e.button !== 0) return;
        start.current = point(e);
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const [x, y] = point(e),
          [a, b] = start.current;
        setDraft([
          Math.min(x, a),
          Math.min(y, b),
          Math.abs(x - a),
          Math.abs(y - b),
        ]);
      }}
      onPointerUp={(e) => {
        if (!start.current) return;
        const [x, y] = point(e),
          [a, b] = start.current;
        start.current = null;
        setDraft(null);
        if (Math.abs(x - a) < 4 || Math.abs(y - b) < 4) return;
        const r = normalizedRects(geometry, [
          [Math.min(x, a), Math.min(y, b), Math.abs(x - a), Math.abs(y - b)],
        ]);
        if (r.length) onSelect(r[0]);
      }}
      onPointerCancel={() => {
        start.current = null;
        setDraft(null);
      }}
    >
      {rects.map((r, i) => {
        const [left, top, width, height] = displayRect(geometry, r);
        return (
          <span
            key={i}
            className="ls-highlight"
            style={{ left, top, width, height }}
          />
        );
      })}
      {draft && (
        <span
          className="ls-highlight"
          style={{
            left: draft[0],
            top: draft[1],
            width: draft[2],
            height: draft[3],
          }}
        />
      )}
    </div>
  );
}
function Thumbnail({
  pdf,
  page,
  selected,
  onOpen,
}: {
  pdf: PDFDocumentProxy;
  page: number;
  selected: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let closed = false;
    let cancel = () => {};
    void pdf
      .getPage(page)
      .then((p) => {
        if (closed || !ref.current) return;
        const viewport = p.getViewport({
          scale: 96 / p.getViewport({ scale: 1 }).width,
        });
        const canvas = ref.current;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const task = p.render({
          canvas,
          canvasContext: canvas.getContext("2d")!,
          viewport,
        });
        cancel = () => task.cancel();
        void task.promise.catch(() => {});
      })
      .catch(() => {});
    return () => {
      closed = true;
      cancel();
    };
  }, [pdf, page]);
  return (
    <button
      className="ls-thumbnail"
      aria-label={`Apri pagina ${page}`}
      aria-current={selected ? "page" : undefined}
      onClick={onOpen}
    >
      <canvas ref={ref} />
      <span>Pagina {page}</span>
    </button>
  );
}
function Outline({
  items,
  onOpen,
}: {
  items: NonNullable<Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>>;
  onOpen: (dest: string | unknown[]) => void;
}) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          {item.dest ? (
            <button onClick={() => onOpen(item.dest!)}>{item.title}</button>
          ) : (
            <span>{item.title}</span>
          )}
          {item.items?.length > 0 && (
            <Outline items={item.items} onOpen={onOpen} />
          )}
        </li>
      ))}
    </ul>
  );
}
