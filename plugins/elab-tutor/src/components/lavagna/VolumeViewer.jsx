/**
 * VolumeViewer — PDF viewer with per-page annotations for ELAB Lavagna.
 * Annotations saved in localStorage per volume+page. Contributes to fumetto report.
 * (c) Andrea Marro — 03/04/2026
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import logger from '../../utils/logger';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import FloatingWindow from './FloatingWindow';
import css from './VolumeViewer.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const VOLUME_PATHS = { 1: '/volumes/volume1.pdf', 2: '/volumes/volume2.pdf', 3: '/volumes/volume3.pdf' };
const VOLUME_LABELS = { 1: 'Volume 1 — Le Basi', 2: 'Volume 2 — Approfondiamo', 3: 'Volume 3 — Arduino' };
// Andrea ratify 2026-05-24: zoom esteso 0.5..3.0 per ingrandimento fino full
// page + drawing su zoom alto.
const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
const ANNO_STORAGE = 'elab-annotations-';
const PEN_COLORS = ['var(--elab-red)', 'var(--elab-navy)', 'var(--elab-lime)', '#222', 'var(--elab-orange)'];
const PEN_SIZES = [2, 4, 7];

// ── Annotation storage ──
function loadAnnotations(vol, page) {
  try { const d = localStorage.getItem(`${ANNO_STORAGE}v${vol}-p${page}`); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveAnnotations(vol, page, paths) {
  try { localStorage.setItem(`${ANNO_STORAGE}v${vol}-p${page}`, JSON.stringify(paths)); } catch { /* full */ }
}

// ── Smooth bezier from points ──
function pointsToPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x},${pts[i].y} ${mx},${my}`;
  }
  d += ` L ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
}

export default function VolumeViewer({
  visible = false, volumeNumber = 1, onClose, onPageChange, onVolumeChange, initialPage = 1,
  // Andrea feedback 2026-05-25: Passo Passo unified mode. When `unifiedMode`
  // is true (driven by LavagnaShell when modalita === 'passo-passo' AND
  // volumeOpen), the floating window expands to ~80vw×80vh and renders the
  // PDF on the left + a step panel on the right. Step nav buttons dispatch
  // window events that NewElabSimulator listens to. In other modalita the
  // viewer behaves as before (standalone floating PDF).
  unifiedMode = false,
  experimentTitle = '',
  currentStepIndex = -1,
  totalSteps = 0,
  stepText = '',
  stepHint = '',
  onUnifiedStepNext,
  onUnifiedStepPrev,
}) {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  // Andrea ratify 2026-05-24: dialog "vai a pagina N" + fullscreen toggle.
  const [showGotoDialog, setShowGotoDialog] = useState(false);
  const [gotoValue, setGotoValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Annotation state
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [penSize, setPenSize] = useState(PEN_SIZES[1]);
  const [paths, setPaths] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef(null);
  const undoStack = useRef([]);

  const filePath = VOLUME_PATHS[volumeNumber] || VOLUME_PATHS[1];
  const title = VOLUME_LABELS[volumeNumber] || 'Volume';

  // Andrea bug fix 2026-05-25: PDF freeze in Passo Passo. Previous effect
  // reset loading+numPages on EVERY initialPage change. But when only the
  // page changes (same volume = same PDF file), the <Document> component
  // does NOT reload, so onLoadSuccess never re-fires → spinner stuck.
  // Split by concern: page change = navigate only; volume change = reload.
  useEffect(() => {
    setPageNumber(initialPage || 1);
  }, [initialPage]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNumPages(null);
  }, [volumeNumber]);

  useEffect(() => {
    setPaths(loadAnnotations(volumeNumber, pageNumber));
    undoStack.current = [];
  }, [volumeNumber, pageNumber]);

  // Save annotations on change
  useEffect(() => {
    saveAnnotations(volumeNumber, pageNumber, paths);
  }, [paths, volumeNumber, pageNumber]);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }) => { setNumPages(total); setLoading(false); setError(null); }, []);
  const onDocumentLoadError = useCallback((err) => { logger.error('[VolumeViewer] PDF load error:', err); setError('Errore nel caricamento del PDF'); setLoading(false); }, []);

  const goToPage = useCallback((p) => {
    const page = Math.max(1, Math.min(p, numPages || 1));
    setPageNumber(page);
    onPageChange?.(page, volumeNumber);
  }, [numPages, onPageChange, volumeNumber]);

  const prevPage = useCallback(() => goToPage(pageNumber - 1), [goToPage, pageNumber]);
  const nextPage = useCallback(() => goToPage(pageNumber + 1), [goToPage, pageNumber]);
  const zoomIn = useCallback(() => setZoom(z => { const i = ZOOM_LEVELS.indexOf(z); return i < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[i + 1] : z; }), []);
  const zoomOut = useCallback(() => setZoom(z => { const i = ZOOM_LEVELS.indexOf(z); return i > 0 ? ZOOM_LEVELS[i - 1] : z; }), []);

  // Andrea ratify 2026-05-24: dialog "vai a pagina N" submit handler.
  const handleGotoSubmit = useCallback((e) => {
    e?.preventDefault?.();
    const n = parseInt(gotoValue, 10);
    if (Number.isFinite(n) && n >= 1 && n <= (numPages || 1)) {
      goToPage(n);
    }
    setShowGotoDialog(false);
    setGotoValue('');
  }, [gotoValue, numPages, goToPage]);

  // ── Drawing handlers ──
  const getCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return { x: Math.round((e.clientX - rect.left) * 10) / 10, y: Math.round((e.clientY - rect.top) * 10) / 10 };
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (!drawingEnabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCoords(e);
    if (!pt) return;
    setIsDrawing(true);
    setCurrentStroke({ points: [pt], color: penColor, width: penSize });
  }, [drawingEnabled, penColor, penSize, getCoords]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing || !currentStroke) return;
    const pt = getCoords(e);
    if (!pt) return;
    setCurrentStroke(prev => ({ ...prev, points: [...prev.points, pt] }));
  }, [isDrawing, currentStroke, getCoords]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    if (currentStroke.points.length > 1) {
      undoStack.current.push(paths);
      setPaths(prev => [...prev, { d: pointsToPath(currentStroke.points), color: currentStroke.color, width: currentStroke.width }]);
    }
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, paths]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length > 0) {
      setPaths(undoStack.current.pop());
    } else if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
    }
  }, [paths]);

  const handleClear = useCallback(() => {
    if (paths.length > 0) {
      undoStack.current.push(paths);
      setPaths([]);
    }
  }, [paths]);

  const documentOptions = useMemo(() => ({ cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`, cMapPacked: true }), []);

  if (!visible) return null;

  // Andrea ratify 2026-05-24: fullscreen mode = window grande quasi-viewport.
  const fullscreenSize = typeof window !== 'undefined'
    ? { w: Math.max(800, window.innerWidth - 60), h: Math.max(600, window.innerHeight - 80) }
    : { w: 1200, h: 800 };
  const fullscreenPos = { x: 20, y: 20 };
  const winSize = isFullscreen ? fullscreenSize : { w: 520, h: 600 };
  const winPos = isFullscreen ? fullscreenPos : { x: 60, y: 80 };

  return (
    <FloatingWindow
      id="volume-viewer"
      key={isFullscreen ? 'fs' : 'win'}
      title={title}
      defaultPosition={winPos}
      defaultSize={winSize}
      onClose={onClose}
    >
      <div className={css.viewer}>
        {/* Volume tabs */}
        {onVolumeChange && (
          <div className={css.volTabs}>
            {[1, 2, 3].map(v => (
              <button
                key={v}
                className={`${css.volTab} ${v === volumeNumber ? css.volTabActive : ''}`}
                onClick={() => onVolumeChange(v)}
                aria-label={`Volume ${v}`}
              >
                Vol {v}
              </button>
            ))}
          </div>
        )}

        {/* Nav bar */}
        <div className={css.navBar}>
          <div className={css.navGroup}>
            <button className={css.navBtn} onClick={prevPage} disabled={pageNumber <= 1} aria-label={t('volume_viewer.prev_page')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {/* Andrea ratify 2026-05-24: pulsante esplicito "vai a pagina N".
                Input legacy preservato come quick edit. */}
            <button
              type="button"
              className={css.navBtn}
              onClick={() => { setShowGotoDialog(true); setGotoValue(String(pageNumber)); }}
              aria-label="Vai a pagina specifica"
              title="Vai a pagina specifica"
              style={{ minWidth: 80, gap: 6, padding: '0 10px', fontFamily: 'Open Sans, sans-serif', fontSize: 13, fontWeight: 700 }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3h12v10H2z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Pag.
            </button>
            <span className={css.pageInfo}>
              <input type="number" className={css.pageInput} value={pageNumber} min={1} max={numPages || 1} onChange={(e) => goToPage(Number(e.target.value))} aria-label={t('volume_viewer.page_number_aria')} />
              <span className={css.pageSep}>/</span><span>{numPages || '...'}</span>
            </span>
            <button className={css.navBtn} onClick={nextPage} disabled={pageNumber >= (numPages || 1)} aria-label={t('volume_viewer.next_page')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className={css.navGroup}>
            <button className={css.navBtn} onClick={zoomOut} aria-label="Zoom -"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 7h4M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
            <span className={css.zoomLabel}>{Math.round(zoom * 100)}%</span>
            <button className={css.navBtn} onClick={zoomIn} aria-label="Zoom +"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 7h4M7 5v4M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
            {/* Andrea ratify 2026-05-24: fullscreen toggle PDF a tutto schermo */}
            <button
              className={css.navBtn}
              onClick={() => setIsFullscreen(f => !f)}
              aria-label={isFullscreen ? 'Esci fullscreen' : 'Schermo intero'}
              title={isFullscreen ? 'Esci fullscreen' : 'Schermo intero'}
              style={{ background: isFullscreen ? 'var(--elab-navy)' : 'transparent', color: isFullscreen ? '#fff' : 'inherit', borderRadius: 6 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {isFullscreen ? (
                  <path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
          <button
            className={css.navBtn}
            onClick={() => setDrawingEnabled(d => !d)}
            aria-label={drawingEnabled ? 'Disattiva penna' : 'Attiva penna'}
            title={drawingEnabled ? 'Disattiva penna' : 'Attiva penna'}
            style={{ background: drawingEnabled ? 'var(--elab-lime)' : 'transparent', color: drawingEnabled ? '#fff' : 'inherit', borderRadius: 6 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Andrea ratify 2026-05-24: dialog "Vai a pagina N" — input centrale
            con submit Enter. Chiude su Esc o backdrop click. */}
        {showGotoDialog && (
          <div
            onClick={() => setShowGotoDialog(false)}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            }}
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleGotoSubmit}
              style={{
                background: '#fff', padding: 20, borderRadius: 12, minWidth: 240,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <label style={{ fontFamily: 'Open Sans, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--elab-navy)' }}>
                Vai a pagina (1 - {numPages || '?'})
              </label>
              <input
                type="number"
                autoFocus
                value={gotoValue}
                onChange={(e) => setGotoValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setShowGotoDialog(false); }}
                min={1}
                max={numPages || 1}
                style={{
                  padding: '10px 14px', fontSize: 16, fontFamily: 'Open Sans, sans-serif',
                  border: '2px solid var(--elab-navy)', borderRadius: 8, minHeight: 44,
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowGotoDialog(false)}
                  style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: 8, minHeight: 44, cursor: 'pointer' }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', border: 'none', background: 'var(--elab-navy)', color: '#fff', borderRadius: 8, minHeight: 44, fontWeight: 700, cursor: 'pointer' }}
                >
                  Vai
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pen toolbar — only when drawing enabled */}
        {drawingEnabled && (
          <div className={css.penBar}>
            {PEN_COLORS.map(c => (
              <button key={c} onClick={() => setPenColor(c)} className={css.penColorBtn} style={{ background: c, border: penColor === c ? '2px solid #fff' : '2px solid transparent', boxShadow: penColor === c ? `0 0 6px ${c}` : 'none' }} aria-label={`Colore ${c}`} />
            ))}
            <span className={css.penSep} />
            {PEN_SIZES.map(s => (
              <button key={s} onClick={() => setPenSize(s)} className={css.penSizeBtn} aria-label={`Spessore ${s}`} style={{ border: penSize === s ? '1px solid var(--elab-navy)' : '1px solid transparent' }}>
                <span style={{ width: s + 4, height: s + 4, borderRadius: '50%', background: penSize === s ? 'var(--elab-navy)' : '#5A6B7D', display: 'block' }} />
              </button>
            ))}
            <span className={css.penSep} />
            <button className={css.penToolBtn} onClick={handleUndo} title={t('volume_viewer.pen_undo_title')} aria-label={t('volume_viewer.pen_undo_aria')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 7l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10h9a4 4 0 000-8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button className={css.penToolBtn} onClick={handleClear} title={t('volume_viewer.pen_clear_title')} aria-label={t('volume_viewer.pen_clear_aria')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M5 5l1 9h4l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {paths.length > 0 && <span className={css.penCount}>{paths.length}</span>}
          </div>
        )}

        {/* PDF + annotation layer */}
        <div className={css.pageContainer}>
          {loading && <div className={css.loadingOverlay}><div className={css.spinner} /><span>{t('volume_viewer.loading')}</span></div>}
          {error && <div className={css.errorOverlay}><span>{error}</span><button className={css.retryBtn} onClick={() => { setError(null); setLoading(true); }}>{t('volume_viewer.retry')}</button></div>}

          <div className={css.pdfStage}>
            <Document file={filePath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} options={documentOptions} loading="">
              <Page pageNumber={pageNumber} scale={zoom} renderTextLayer={!drawingEnabled} renderAnnotationLayer={!drawingEnabled} className={css.pdfPage} loading="" />
            </Document>
          </div>

          {/* SVG annotation overlay — covers the whole visible manual work area, not only the PDF page. */}
          <svg
            ref={svgRef}
            className={css.annotationLayer}
            style={{ cursor: drawingEnabled ? 'crosshair' : 'default', pointerEvents: drawingEnabled ? 'auto' : 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Saved annotations */}
            {paths.map((p, i) => (
              <path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {/* Current stroke */}
            {currentStroke && currentStroke.points.length > 1 && (
              <path d={pointsToPath(currentStroke.points)} stroke={currentStroke.color} strokeWidth={currentStroke.width} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            )}
          </svg>
        </div>
      </div>
    </FloatingWindow>
  );
}
