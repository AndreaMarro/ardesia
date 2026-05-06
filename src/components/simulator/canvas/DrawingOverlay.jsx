/**
 * ELAB Simulator — DrawingOverlay
 * SVG-based annotation/drawing layer on top of circuit canvas.
 * Supports freehand drawing, color picker, eraser, pen sizes, and fullscreen mode.
 * Touch, mouse, and Apple Pencil compatible.
 * Smooth bezier path rendering for LIM writing quality.
 * © Andrea Marro — 13/03/2026 — Updated S1 31/03/2026
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { loadDrawingPaths, saveDrawingPaths } from '../../../utils/drawingStorage';
import {
  loadPaths as loadPathsRemote,
  debouncedSave as debouncedSaveRemote,
  cancelDebouncedSave as cancelDebouncedSaveRemote,
  subscribePaths as subscribePathsRemote,
} from '../../../services/drawingSync';

/**
 * Sprint T iter 28 — Bug 3 Supabase sync (drawingPaths cross-device).
 *
 * Sync è OPT-IN via prop `syncEnabled` (Lavagna mode). Quando false (simulator
 * standalone) il comportamento iter 25 è invariato: solo localStorage.
 *
 * HONEST CAVEATS (NOT production-ready):
 *  - migration `scribble_paths` NOT applied (Andrea decide).
 *  - last-write-wins on (experiment_id, user_id); NO CRDT merge.
 *  - realtime channel funziona solo se ALTER PUBLICATION supabase_realtime
 *    ADD TABLE scribble_paths è stato eseguito (NON automatico in migration).
 *  - se Supabase non configurato, comportamento === iter 25 invariato.
 */
const REMOTE_SAVE_DEBOUNCE_MS = 2000;

const COLORS = [
  { name: 'Rosso', hex: 'var(--elab-hex-ef4444)', label: 'Rosso' },
  { name: 'Blu', hex: 'var(--elab-hex-2563eb)', label: 'Blu' },
  { name: 'Verde', hex: 'var(--elab-hex-16a34a)', label: 'Verde' },
  { name: 'Nero', hex: 'var(--elab-hex-1f2937)', label: 'Nero' },
  { name: 'Arancio', hex: 'var(--elab-hex-f97316)', label: 'Arancio' },
];

const DEFAULT_COLOR = 'var(--elab-hex-ef4444)';

const PEN_SIZES = [
  { label: 'S', value: 1.5, title: 'Sottile' },
  { label: 'M', value: 3,   title: 'Medio'  },
  { label: 'L', value: 6,   title: 'Spesso' },
];
const DEFAULT_PEN_SIZE = 1.5;
const ERASER_WIDTH = 18;

/**
 * Convert raw point string "x1,y1 x2,y2 ..." into smooth SVG quadratic bezier path.
 * Uses midpoint algorithm: each pair of consecutive points has a midpoint used as
 * the on-curve anchor, and the original points become control points.
 *
 * @param {string} pointsStr - space-separated "x,y" pairs
 * @returns {string} SVG path data
 */
function pointsToSmoothPath(pointsStr) {
  const pts = pointsStr.trim().split(/\s+/).map(p => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));

  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y} l 0.1,0.1`;
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

  // Build smooth path with quadratic bezier curves through midpoints
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mid = {
      x: (pts[i].x + pts[i + 1].x) / 2,
      y: (pts[i].y + pts[i + 1].y) / 2,
    };
    d += ` Q ${pts[i].x},${pts[i].y} ${mid.x},${mid.y}`;
  }
  // Last point
  const last = pts[pts.length - 1];
  d += ` L ${last.x},${last.y}`;
  return d;
}

/**
 * DrawingOverlay Component
 *
 * Props:
 * - drawingEnabled: boolean — whether drawing mode is enabled
 * - canvasWidth: number — width of parent canvas container (used in normal mode)
 * - canvasHeight: number — height of parent canvas container (used in normal mode)
 * - onPathsChange: (paths) => void — callback when paths change
 * - experimentId: string | null — when provided, paths are persisted per-experiment
 *   so drawings do not bleed across lessons (18/04/2026 — Principio Zero fix).
 * - syncEnabled: boolean — opt-in Supabase cross-device sync (iter 28 Bug 3).
 *   ON only in Lavagna mode; OFF in simulator standalone (Principio Zero V3 enforce).
 */
export default function DrawingOverlay({
  drawingEnabled = false,
  canvasWidth = 800,
  canvasHeight = 600,
  onPathsChange,
  onClose,
  initialFullscreen = false,
  experimentId = null,
  syncEnabled = false,
}) {
  const svgRef = useRef(null);
  const [paths, setPaths] = useState(() => loadDrawingPaths(experimentId));
  const [currentPath, setCurrentPath] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingMode, setDrawingMode] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [penSize, setPenSize] = useState(DEFAULT_PEN_SIZE);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

  // Undo/Redo stacks (store path snapshots)
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const MAX_UNDO = 50;

  // iter 28 Bug 3 — track last local save timestamp so realtime echoes from
  // our own writes don't overwrite live paint state. (cheap monotonic clock)
  const lastLocalSaveAtRef = useRef(0);

  // When the active experiment changes, load THAT experiment's paths.
  // Without this the overlay would keep showing ink from whichever lesson
  // was open at mount time — exactly the bug reported on the lavagna.
  //
  // iter 25 fix (Andrea mandate "contenuto sparisce SOLO con cancellazione esplicita"):
  // on null → real expId transition, MIGRATE current paths into the new experiment
  // bucket instead of resetting. Otherwise the user who drew in sandbox loses ink
  // the moment they pick an experiment. See investigation
  // docs/audits/2026-04-29-iter-25-LAVAGNA-PERSISTENCE-investigation.md (Bug 1).
  const prevExpIdRef = useRef(experimentId);
  useEffect(() => {
    const prevId = prevExpIdRef.current;
    const newId = experimentId;
    if (prevId === null && newId && paths.length > 0) {
      // migrate sandbox paths into the new experiment bucket; do NOT clear local state
      saveDrawingPaths(paths, newId);
      saveDrawingPaths([], null);
    } else {
      setPaths(loadDrawingPaths(newId));
      undoStackRef.current = [];
      redoStackRef.current = [];
    }
    prevExpIdRef.current = newId;
    // paths intentionally not in deps — we read it via closure for the migration check.
    // Re-running this effect on every paths mutation would double-save and erase undo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  // iter 28 Bug 3 — Supabase remote load (Lavagna sync mode only).
  // Hydrate state from remote ONCE on mount / experimentId change. Last-write-wins:
  // if remote has more recent paths, replace local. If remote returns null (no row,
  // not configured, error), we keep the localStorage fallback we already loaded.
  // Principio Zero V3: gated by syncEnabled — simulator standalone mai sync.
  useEffect(() => {
    if (!syncEnabled) return undefined;
    let cancelled = false;
    loadPathsRemote(experimentId).then((remote) => {
      if (cancelled || !remote) return;
      if (Array.isArray(remote.paths)) {
        // Iter 34 P0 fix Andrea bug "Lavagna persistence: premi Esci scritti
        // spariscono" — root cause: empty remote array overwrites local cache
        // on hydration. Last-write-wins should NOT trigger when remote is empty
        // and local has paths (user just drew before navigation).
        // Use timestamp comparison: only replace if remote.updatedAt > local
        // OR if local cache is empty. Otherwise local takes precedence.
        const localPaths = loadDrawingPaths(experimentId);
        const remoteIsEmpty = remote.paths.length === 0;
        const localHasPaths = Array.isArray(localPaths) && localPaths.length > 0;
        const remoteTs = remote.updatedAt ? Date.parse(remote.updatedAt) : 0;
        const localTs = lastLocalSaveAtRef.current || 0;
        const remoteIsNewer = remoteTs > localTs;

        // Sprint V iter 1 Atom A2.1 — gap iter 34/35 fix parziale.
        // localTs=0 quando user non ha disegnato sessione corrente → remote
        // empty NON skippato (remoteIsNewer falso match) → wipe locale.
        // Fix: se remote vuoto E local ha paths → skip incondizionato.
        // Local prevale; perdita solo se utente cancella esplicitamente
        // da altro device (edge case non primario classe LIM).
        if (remoteIsEmpty && localHasPaths) {
          return;
        }
        // Skip remote overwrite quando entrambi non-vuoti + remote non più nuovo
        if (!remoteIsEmpty && localHasPaths && !remoteIsNewer) {
          return;
        }
        setPaths(remote.paths);
        // mirror to localStorage so cross-device load == local cache next visit
        saveDrawingPaths(remote.paths, experimentId);
      }
    }).catch(() => { /* swallow */ });
    return () => { cancelled = true; };
  }, [syncEnabled, experimentId]);

  // iter 28 Bug 3 — debounced remote save on paths change.
  // We DO NOT call savePaths inline in handlePointerUp/Undo/Redo/Clear to avoid
  // hammering Supabase on every stroke. Debounce 2s after last change.
  useEffect(() => {
    if (!syncEnabled) return undefined;
    debouncedSaveRemote(experimentId, paths, REMOTE_SAVE_DEBOUNCE_MS);
    return undefined;
  }, [syncEnabled, experimentId, paths]);

  // iter 28 Bug 3 — realtime subscription so other devices' updates appear here.
  // Only re-renders when remote `updated_at` is newer than our last local save.
  useEffect(() => {
    if (!syncEnabled) return undefined;
    const unsubscribe = subscribePathsRemote(experimentId, ({ paths: remotePaths, updatedAt }) => {
      try {
        const remoteTs = updatedAt ? Date.parse(updatedAt) : 0;
        if (!remoteTs || remoteTs <= lastLocalSaveAtRef.current) return;
        if (!Array.isArray(remotePaths)) return;
        setPaths(remotePaths);
        saveDrawingPaths(remotePaths, experimentId);
      } catch { /* swallow */ }
    });
    return () => {
      try { unsubscribe?.(); } catch { /* ignore */ }
    };
  }, [syncEnabled, experimentId]);

  // iter 28 Bug 3 — flush any pending debounced remote save on unmount.
  useEffect(() => {
    return () => {
      try { cancelDebouncedSaveRemote(experimentId); } catch { /* ignore */ }
    };
  }, [experimentId]);

  // Current stroke width: eraser is always large, pen uses selected size
  const strokeWidth = isEraser ? ERASER_WIDTH : penSize;

  const getEventCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (!drawingMode || !drawingEnabled || !showToolbar) return;
    if (svgRef.current) svgRef.current.setPointerCapture(e.pointerId);
    const { x, y } = getEventCoords(e);
    setIsDrawing(true);
    setCurrentPath({
      points: `${x},${y}`,
      color: isEraser ? 'transparent' : currentColor,
      width: strokeWidth,
      isEraser,
    });
  }, [drawingMode, drawingEnabled, showToolbar, isEraser, currentColor, strokeWidth, getEventCoords]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing || !currentPath) return;
    const { x, y } = getEventCoords(e);
    setCurrentPath(prev => ({
      ...prev,
      points: `${prev.points} ${x},${y}`,
    }));
  }, [isDrawing, currentPath, getEventCoords]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !currentPath) return;
    setIsDrawing(false);
    const newPath = { ...currentPath };
    // Push current state to undo stack before adding new path
    undoStackRef.current = [...undoStackRef.current.slice(-MAX_UNDO + 1), paths];
    redoStackRef.current = []; // Clear redo on new action
    const updatedPaths = [...paths, newPath];
    setPaths(updatedPaths);
    saveDrawingPaths(updatedPaths, experimentId);
    lastLocalSaveAtRef.current = Date.now(); // iter 35 fix Bug 2 persistence: track local write timestamp for remote-vs-local race condition
    setCurrentPath(null);
    onPathsChange?.(updatedPaths);
  }, [isDrawing, currentPath, paths, onPathsChange, experimentId]);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    redoStackRef.current.push(paths);
    setPaths(prev);
    saveDrawingPaths(prev, experimentId);
    lastLocalSaveAtRef.current = Date.now(); // iter 35 fix Bug 2 persistence
    onPathsChange?.(prev);
  }, [paths, onPathsChange, experimentId]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop();
    undoStackRef.current.push(paths);
    setPaths(next);
    saveDrawingPaths(next, experimentId);
    lastLocalSaveAtRef.current = Date.now(); // iter 35 fix Bug 2 persistence
    onPathsChange?.(next);
  }, [paths, onPathsChange, experimentId]);

  const handleClearAll = useCallback(() => {
    if (paths.length > 0) {
      undoStackRef.current = [...undoStackRef.current.slice(-MAX_UNDO + 1), paths];
      redoStackRef.current = [];
    }
    setPaths([]);
    saveDrawingPaths([], experimentId);
    lastLocalSaveAtRef.current = Date.now(); // iter 35 fix Bug 2 persistence
    setCurrentPath(null);
    onPathsChange?.([]);
  }, [paths, onPathsChange, experimentId]);

  const handleToggleDrawing = useCallback(() => {
    setDrawingMode(prev => !prev);
  }, []);

  // T1-002 edge case #8: flush current stroke before closing.
  // If the user is mid-stroke (pointer down, no pointer up yet) when they
  // press ESC or click ESCI, the in-progress path would be lost. This
  // handler commits it to paths + localStorage before unmounting.
  const handleClose = useCallback(() => {
    if (isDrawing && currentPath) {
      const newPath = { ...currentPath };
      const updatedPaths = [...paths, newPath];
      setPaths(updatedPaths);
      saveDrawingPaths(updatedPaths, experimentId);
      lastLocalSaveAtRef.current = Date.now(); // iter 35 fix Bug 2 persistence: handleClose flush mid-stroke
      setIsDrawing(false);
      setCurrentPath(null);
      onPathsChange?.(updatedPaths);
    }
    onClose?.();
  }, [isDrawing, currentPath, paths, experimentId, onPathsChange, onClose]);

  // Event handlers attached via JSX props (no useEffect timing issues)

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!drawingEnabled) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drawingEnabled, handleUndo, handleRedo, handleClose]);

  if (!drawingEnabled) return null;

  // In fullscreen mode: cover entire viewport with position:fixed
  const containerStyle = isFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: drawingMode ? 9000 : 0,
        pointerEvents: drawingMode ? 'auto' : 'none',
        cursor: drawingMode ? (isEraser ? 'not-allowed' : 'crosshair') : 'default',
      }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        width: canvasWidth,
        height: canvasHeight,
        zIndex: drawingMode ? 50 : 0,
        pointerEvents: drawingMode ? 'auto' : 'none',
        cursor: drawingMode ? (isEraser ? 'not-allowed' : 'crosshair') : 'default',
      };

  const svgW = isFullscreen ? '100vw' : canvasWidth;
  const svgH = isFullscreen ? '100vh' : canvasHeight;

  const renderPath = (path, key, opacity = 1) => {
    const d = path.isEraser
      ? `M ${path.points}` // eraser stays as polyline for performance
      : pointsToSmoothPath(path.points);
    return (
      <path
        key={key}
        d={d}
        stroke={path.isEraser ? 'white' : path.color}
        strokeWidth={path.width || 2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={path.isEraser ? 0.85 : opacity}
      />
    );
  };

  return (
    <div style={containerStyle}>
      {/* SVG canvas */}
      <svg
        ref={svgRef}
        width={svgW}
        height={svgH}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'transparent',
          display: drawingMode ? 'block' : 'none',
          touchAction: 'none',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, i) => renderPath(path, i))}
        {currentPath && renderPath(currentPath, 'current', 0.8)}
      </svg>

      {/* Compact horizontal toolbar — top center */}
      {showToolbar && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderRadius: 12,
          padding: '6px 10px',
          zIndex: isFullscreen ? 9001 : 51,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        }}>
          {/* Colors — small circles */}
          {COLORS.map(color => (
            <button
              key={color.hex}
              onClick={() => { setCurrentColor(color.hex); setIsEraser(false); }}
              title={color.label}
              aria-label={`Colore: ${color.label}`}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: currentColor === color.hex && !isEraser ? '2px solid white' : '2px solid transparent',
                background: color.hex,
                cursor: 'pointer',
                transition: 'all 120ms',
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}

          {/* Separator */}
          <div style={{ width: 1, height: 20, background: 'rgba(71,85,105,0.5)', margin: '0 2px', flexShrink: 0 }} />

          {/* Pen sizes — 3 dots */}
          {PEN_SIZES.map(ps => (
            <button
              key={ps.value}
              onClick={() => { setPenSize(ps.value); setIsEraser(false); }}
              title={ps.title}
              aria-label={`Spessore: ${ps.title}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: penSize === ps.value && !isEraser ? '1px solid var(--elab-hex-6366f1)' : '1px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <div style={{
                width: ps.value * 2 + 4,
                height: ps.value * 2 + 4,
                borderRadius: '50%',
                background: penSize === ps.value && !isEraser ? 'var(--elab-hex-6366f1)' : 'var(--elab-hex-94a3b8)',
              }} />
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: 'rgba(71,85,105,0.5)', margin: '0 2px', flexShrink: 0 }} />

          {/* Eraser */}
          <ToolBtn onClick={() => setIsEraser(prev => !prev)} active={isEraser} activeColor="var(--elab-hex-fca5a5)" title="Gomma" aria-label="Gomma">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 13h10M5 9l6-6 2 2-6 6H5V9z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </ToolBtn>

          {/* Undo */}
          <ToolBtn onClick={handleUndo} active={false} activeColor="var(--elab-hex-94a3b8)" title="Annulla (Ctrl+Z)" aria-label="Annulla">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 7l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10h9a4 4 0 000-8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </ToolBtn>

          {/* Redo */}
          <ToolBtn onClick={handleRedo} active={false} activeColor="var(--elab-hex-94a3b8)" title="Ripristina (Ctrl+Y)" aria-label="Ripristina">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 7l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 10H6a4 4 0 010-8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </ToolBtn>

          {/* Clear */}
          <ToolBtn onClick={handleClearAll} active={false} activeColor="var(--elab-hex-94a3b8)" title="Cancella tutto" aria-label="Cancella">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M5 5l1 9h4l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </ToolBtn>

          <div style={{ width: 1, height: 20, background: 'rgba(71,85,105,0.5)', margin: '0 2px', flexShrink: 0 }} />

          {/* Exit drawing mode */}
          <button
            onClick={handleClose}
            title="Esci dalla penna (ESC)"
            aria-label="Esci dalla modalità penna"
            style={{
              height: 36,
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.5)',
              background: 'rgba(239,68,68,0.15)',
              color: 'var(--elab-hex-fca5a5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 10px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '0.5px',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            ESCI
          </button>
        </div>
      )}

      {/* Minimized toolbar indicator */}
      {!showToolbar && (
        <button
          onClick={() => setShowToolbar(true)}
          title="Mostra barra strumenti"
          aria-label="Mostra barra strumenti disegno"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 44,
            height: 44,
            borderRadius: 10,
            border: '1px solid rgba(71, 85, 105, 0.5)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: 'var(--elab-hex-94a3b8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            zIndex: isFullscreen ? 9001 : 51,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            transition: 'all 150ms',
          }}
        >
          Penna
        </button>
      )}
    </div>
  );
}

/** Small reusable toolbar button */
function ToolBtn({ children, onClick, active, activeColor, title, style = {}, ...rest }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${active ? activeColor : 'rgba(100,116,139,0.4)'}`,
        background: active ? `${activeColor}25` : 'rgba(71,85,105,0.3)',
        color: active ? activeColor : 'var(--elab-hex-94a3b8)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        transition: 'all 120ms',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
