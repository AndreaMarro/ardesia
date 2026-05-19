/**
 * VolumeViewer — PDF viewer with per-page annotations for ELAB Lavagna.
 * Annotations saved in localStorage per volume+page. Contributes to fumetto report.
 * (c) Andrea Marro — 03/04/2026
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import logger from '../../utils/logger';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import FloatingWindow from './FloatingWindow';
import css from './VolumeViewer.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const VOLUME_PATHS = { 1: '/volumes/volume1.pdf', 2: '/volumes/volume2.pdf', 3: '/volumes/volume3.pdf' };
const VOLUME_LABELS = { 1: 'Volume 1 — Le Basi', 2: 'Volume 2 — Approfondiamo', 3: 'Volume 3 — Arduino' };
const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
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
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

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

  // Load annotations when page/volume changes
  useEffect(() => {
    setPageNumber(initialPage || 1);
    setLoading(true);
    setError(null);
    setNumPages(null);
  }, [volumeNumber, initialPage]);

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

  return (
    <FloatingWindow id="volume-viewer" title={title} defaultPosition={{ x: 60, y: 80 }} defaultSize={{ w: 520, h: 600 }} onClose={onClose}>
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
            <button className={css.navBtn} onClick={prevPage} disabled={pageNumber <= 1} aria-label="Pagina precedente">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className={css.pageInfo}>
              <input type="number" className={css.pageInput} value={pageNumber} min={1} max={numPages || 1} onChange={(e) => goToPage(Number(e.target.value))} aria-label="Numero pagina" />
              <span className={css.pageSep}>/</span><span>{numPages || '...'}</span>
            </span>
            <button className={css.navBtn} onClick={nextPage} disabled={pageNumber >= (numPages || 1)} aria-label="Pagina successiva">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className={css.navGroup}>
            <button className={css.navBtn} onClick={zoomOut} aria-label="Zoom -"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 7h4M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
            <span className={css.zoomLabel}>{Math.round(zoom * 100)}%</span>
            <button className={css.navBtn} onClick={zoomIn} aria-label="Zoom +"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 7h4M7 5v4M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
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
            <button className={css.penToolBtn} onClick={handleUndo} title="Annulla" aria-label="Annulla tratto">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 7l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10h9a4 4 0 000-8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button className={css.penToolBtn} onClick={handleClear} title="Cancella tutto" aria-label="Cancella annotazioni">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M5 5l1 9h4l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {paths.length > 0 && <span className={css.penCount}>{paths.length}</span>}
          </div>
        )}

        {/* PDF + annotation layer */}
        <div className={css.pageContainer}>
          {loading && <div className={css.loadingOverlay}><div className={css.spinner} /><span>Caricamento volume...</span></div>}
          {error && <div className={css.errorOverlay}><span>{error}</span><button className={css.retryBtn} onClick={() => { setError(null); setLoading(true); }}>Riprova</button></div>}

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
