/**
 * ELAB Simulator — Whiteboard Overlay V4
 * Canvas 2D drawing layer with pencil, eraser, text, shapes, undo/redo, export.
 * V3: Selection, move, delete, resize for shapes/text/arrows/lines.
 * V4 (S112): Pointer Events API — unified mouse/touch/Apple Pencil.
 *   - Pressure-sensitive strokes (pen pointerType)
 *   - Palm rejection (ignore touch while pen in use)
 *   - setPointerCapture for reliable drag tracking
 * Andrea Marro — 11/03/2026
 */

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
const COLORS_PRESET = ['var(--elab-navy)', 'var(--elab-red)', 'var(--elab-lime)', 'var(--elab-orange)', '#333333', '#FFFFFF'];
const THICKNESS = [2, 4, 8];
const MAX_HISTORY = 30;
const HANDLE_SIZE = 7;

// 2026-05-06 Bug #6: persistenza posizione toolbar lavagna (draggable)
const TOOLBAR_POS_KEY = 'elab-wb-toolbar-pos';
function loadToolbarPos() {
  try {
    const raw = localStorage.getItem(TOOLBAR_POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.left === 'number' && typeof p?.top === 'number') return p;
    return null;
  } catch { return null; }
}
function saveToolbarPos(pos) {
  try { localStorage.setItem(TOOLBAR_POS_KEY, JSON.stringify(pos)); } catch { /* quota */ }
}
// 2026-05-06 Bug #2: persistenza stato collassato toolbar
const TOOLBAR_COLLAPSED_KEY = 'elab-wb-toolbar-collapsed';
function loadToolbarCollapsed() {
  try { return localStorage.getItem(TOOLBAR_COLLAPSED_KEY) === '1'; } catch { return false; }
}
function saveToolbarCollapsed(v) {
  try { localStorage.setItem(TOOLBAR_COLLAPSED_KEY, v ? '1' : '0'); } catch { /* quota */ }
}

// ── Element ID generator ────────────────────────
let _nextId = 1;
function nextElementId() { return `el_${_nextId++}_${Date.now()}`; }

export default function WhiteboardOverlay({
  active = false,
  experimentId = null,
  onClose,
  onSendToUNLIM,
}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const shapeStart = useRef(null);
  const preShapeSnapshot = useRef(null);

  // 'pencil' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'line' | 'select'
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState(COLORS_PRESET[0]);
  const [thickness, setThickness] = useState(THICKNESS[0]);

  // ── Undo / Redo history (raster + elements snapshots) ─────
  const historyStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ── Text input state ───────────────────────────────
  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);

  // 2026-05-06 Bug #2/#6: toolbar collassabile + traslabile
  const [toolbarCollapsed, setToolbarCollapsed] = useState(() => loadToolbarCollapsed());
  const [toolbarPos, setToolbarPos] = useState(() => loadToolbarPos());
  const toolbarRef = useRef(null);
  const toolbarDragHandleRef = useRef(null);

  const toggleToolbarCollapsed = useCallback(() => {
    setToolbarCollapsed(prev => {
      const next = !prev;
      saveToolbarCollapsed(next);
      return next;
    });
  }, []);

  // 2026-05-06 Bug #6: pointer-down sull'handle di drag muove la toolbar.
  // Click sui pulsanti continua a funzionare (no drag se target è un button).
  const handleToolbarDragStart = useCallback((e) => {
    if (e.target?.closest && e.target.closest('button, input, label')) return;
    if (!toolbarRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = toolbarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    try { toolbarDragHandleRef.current?.setPointerCapture?.(e.pointerId); } catch { /* */ }

    const onMove = (ev) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Mantieni la toolbar sempre visibile (clamp 8px di margine)
      const left = Math.max(8, Math.min(ev.clientX - offsetX, vw - rect.width - 8));
      const top = Math.max(8, Math.min(ev.clientY - offsetY, vh - rect.height - 8));
      setToolbarPos({ left, top });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setToolbarPos(prev => { if (prev) saveToolbarPos(prev); return prev; });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  const handleToolbarDoubleClick = useCallback((e) => {
    if (e.target?.closest && e.target.closest('button, input, label')) return;
    setToolbarPos(null);
    try { localStorage.removeItem(TOOLBAR_POS_KEY); } catch { /* */ }
  }, []);

  // ── Zoom & Grid state ─────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);

  // ── V3: Vector element tracking ───────────────────
  const elements = useRef([]);
  const rasterLayer = useRef(null);

  // ── V3: Selection state ───────────────────────────
  const [selectedId, setSelectedId] = useState(null);
  const dragStart = useRef(null);
  const resizeHandle = useRef(null);
  const [, forceUpdate] = useState(0);

  const isShapeTool = tool === 'rect' || tool === 'circle' || tool === 'arrow' || tool === 'line';

  const selectedElement = useMemo(
    () => elements.current.find(el => el.id === selectedId) || null,
    [selectedId, forceUpdate] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Save raster layer ─────────────────────────────
  const saveRasterLayer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    rasterLayer.current = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  // ── Draw a single vector element to context ─────
  function drawElement(ctx, el) {
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.color;
    ctx.lineWidth = el.thickness * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.type === 'rect') {
      ctx.beginPath();
      ctx.strokeRect(el.x, el.y, el.w, el.h);
    } else if (el.type === 'circle') {
      const rx = Math.abs(el.w) / 2;
      const ry = Math.abs(el.h) / 2;
      const cx = el.x + el.w / 2;
      const cy = el.y + el.h / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x + el.w, el.y + el.h);
      ctx.stroke();
    } else if (el.type === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      const ex = el.x + el.w;
      const ey = el.y + el.h;
      ctx.lineTo(ex, ey);
      ctx.stroke();
      const angle = Math.atan2(el.h, el.w);
      const headLen = Math.max(12, el.thickness * 4);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - 0.4), ey - headLen * Math.sin(angle - 0.4));
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle + 0.4), ey - headLen * Math.sin(angle + 0.4));
      ctx.stroke();
    } else if (el.type === 'text') {
      const baseFontSize = el.fontSize || Math.max(16, el.thickness * 6);
      const fontSize = baseFontSize * dpr;
      ctx.font = `${fontSize}px 'Open Sans', sans-serif`;
      ctx.textBaseline = 'top';
      const lines = (el.text || '').split('\n');
      const lineHeight = baseFontSize * dpr * 1.3;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], el.x, el.y + i * lineHeight);
      }
    }
    ctx.restore();
  }

  // ── Redraw canvas from raster + vector elements ─────
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (rasterLayer.current) {
      ctx.putImageData(rasterLayer.current, 0, 0);
    }
    for (const el of elements.current) {
      drawElement(ctx, el);
    }
  }, []);

  // ── Get element bounding box ─────────────
  function getElementBounds(el) {
    if (el.type === 'rect' || el.type === 'circle') {
      const x = el.w >= 0 ? el.x : el.x + el.w;
      const y = el.h >= 0 ? el.y : el.y + el.h;
      return { x, y, w: Math.abs(el.w), h: Math.abs(el.h) };
    }
    if (el.type === 'line' || el.type === 'arrow') {
      const x1 = el.x, y1 = el.y, x2 = el.x + el.w, y2 = el.y + el.h;
      return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(el.w), h: Math.abs(el.h) };
    }
    if (el.type === 'text') {
      return { x: el.x, y: el.y, w: el.textWidth || 100, h: el.textHeight || 30 };
    }
    return { x: el.x, y: el.y, w: 10, h: 10 };
  }

  // ── Check resize handle at point ─────────────
  function getResizeHandleAtPoint(el, pt) {
    if (!el || el.type === 'text') return null;
    const bounds = getElementBounds(el);
    const handles = [
      { key: 'nw', x: bounds.x, y: bounds.y },
      { key: 'ne', x: bounds.x + bounds.w, y: bounds.y },
      { key: 'sw', x: bounds.x, y: bounds.y + bounds.h },
      { key: 'se', x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    ];
    for (const h of handles) {
      if (Math.abs(pt.x - h.x) <= HANDLE_SIZE && Math.abs(pt.y - h.y) <= HANDLE_SIZE) {
        return h.key;
      }
    }
    return null;
  }

  // ── Hit test — find element at point ─────
  const hitTest = useCallback((pt) => {
    const margin = 8;
    for (let i = elements.current.length - 1; i >= 0; i--) {
      const el = elements.current[i];
      const bounds = getElementBounds(el);
      if (pt.x >= bounds.x - margin && pt.x <= bounds.x + bounds.w + margin &&
          pt.y >= bounds.y - margin && pt.y <= bounds.y + bounds.h + margin) {
        return el;
      }
    }
    return null;
  }, []);

  // ── Draw selection overlay ─────────────────
  const drawSelectionOverlay = useCallback(() => {
    if (!selectedId) return;
    const el = elements.current.find(el => el.id === selectedId);
    if (!el) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bounds = getElementBounds(el);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setLineDash([6 * dpr, 4 * dpr]);
    ctx.strokeStyle = 'var(--elab-navy)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeRect(bounds.x - 4 * dpr, bounds.y - 4 * dpr, bounds.w + 8 * dpr, bounds.h + 8 * dpr);
    ctx.setLineDash([]);

    if (el.type !== 'text') {
      const corners = [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.w, y: bounds.y },
        { x: bounds.x, y: bounds.y + bounds.h },
        { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
      ];
      const hs = HANDLE_SIZE * dpr;
      for (const c of corners) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(c.x - hs / 2, c.y - hs / 2, hs, hs);
        ctx.strokeStyle = 'var(--elab-navy)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeRect(c.x - hs / 2, c.y - hs / 2, hs, hs);
      }
    }
    ctx.restore();
  }, [selectedId]);

  // ── Push current state to history ─────────────────
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyStack.current.push({
      raster: rasterLayer.current ? new ImageData(
        new Uint8ClampedArray(rasterLayer.current.data),
        rasterLayer.current.width, rasterLayer.current.height
      ) : null,
      elements: JSON.parse(JSON.stringify(elements.current)),
    });
    if (historyStack.current.length > MAX_HISTORY) historyStack.current.shift();
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  // ── Undo ───────────────────────────────────────────
  const undo = useCallback(() => {
    if (historyStack.current.length === 0) return;
    redoStack.current.push({
      raster: rasterLayer.current ? new ImageData(
        new Uint8ClampedArray(rasterLayer.current.data),
        rasterLayer.current.width, rasterLayer.current.height
      ) : null,
      elements: JSON.parse(JSON.stringify(elements.current)),
    });
    const prev = historyStack.current.pop();
    rasterLayer.current = prev.raster;
    elements.current = prev.elements;
    setSelectedId(null);
    redrawCanvas();
    setCanUndo(historyStack.current.length > 0);
    setCanRedo(true);
    saveToStorage();
  }, [redrawCanvas]);

  // ── Redo ───────────────────────────────────────────
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    historyStack.current.push({
      raster: rasterLayer.current ? new ImageData(
        new Uint8ClampedArray(rasterLayer.current.data),
        rasterLayer.current.width, rasterLayer.current.height
      ) : null,
      elements: JSON.parse(JSON.stringify(elements.current)),
    });
    const next = redoStack.current.pop();
    rasterLayer.current = next.raster;
    elements.current = next.elements;
    setSelectedId(null);
    redrawCanvas();
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
    saveToStorage();
  }, [redrawCanvas]);

  // ── Keyboard shortcuts ────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && tool === 'select' && !textInput) {
        e.preventDefault();
        pushHistory();
        elements.current = elements.current.filter(el => el.id !== selectedId);
        setSelectedId(null);
        redrawCanvas();
        saveToStorage();
      } else if (e.key === 'Escape' && selectedId) {
        setSelectedId(null);
        forceUpdate(v => v + 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, undo, redo, selectedId, tool, textInput, pushHistory, redrawCanvas]);

  // ── Ctrl+Scroll zoom ─────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(prev => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          return Math.min(2, Math.max(0.5, Math.round((prev + delta) * 10) / 10));
        });
      }
    };
    const el = canvasRef.current?.parentElement;
    if (el) el.addEventListener('wheel', handler, { passive: false });
    return () => el?.removeEventListener('wheel', handler);
  }, [active]);

  // ── Resize canvas to match parent ────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = parent.offsetWidth;
      const cssH = parent.offsetHeight;
      const saved = canvas.toDataURL();
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        rasterLayer.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      img.src = saved;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // ── Load saved drawing from localStorage ─────
  // T1-002 fix: use fallback key 'elab_wb_sandbox' when experimentId is null
  // 2026-05-06 Bug #4: reset canvas/elements/history INCONDIZIONATAMENTE
  // al cambio esperimento. Prima `if (!saved) return` lasciava residuo del
  // precedente quando si passava a un esperimento mai visitato.
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    rasterLayer.current = null;
    elements.current = [];
    historyStack.current = [];
    redoStack.current = [];
    setSelectedId(null);
    setCanUndo(false);
    setCanRedo(false);

    const key = experimentId ? `elab_wb_${experimentId}` : 'elab_wb_sandbox';
    const saved = localStorage.getItem(key);
    if (!saved) {
      redrawCanvas();
      return;
    }
    try {
      const data = JSON.parse(saved);
      if (data.version === 3) {
        elements.current = data.elements || [];
        if (data.raster) {
          const img = new Image();
          img.onload = () => {
            const ctx2 = canvasRef.current?.getContext('2d');
            if (!ctx2) return;
            ctx2.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx2.drawImage(img, 0, 0);
            rasterLayer.current = ctx2.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            redrawCanvas();
          };
          img.src = data.raster;
        } else {
          redrawCanvas();
        }
        return;
      }
    } catch { /* legacy format */ }
    const img = new Image();
    img.onload = () => {
      const ctx2 = canvasRef.current?.getContext('2d');
      if (!ctx2) return;
      ctx2.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx2.drawImage(img, 0, 0);
      rasterLayer.current = ctx2.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    img.src = saved;
  }, [experimentId, redrawCanvas]);

  // ── Save drawing to localStorage (V3 format) ─────
  // T1-002 fix: use fallback key 'elab_wb_sandbox' when experimentId is null
  const saveToStorage = useCallback(() => {
    if (!canvasRef.current) return;
    const key = experimentId ? `elab_wb_${experimentId}` : 'elab_wb_sandbox';
    try {
      // Evict oldest whiteboard entries if over cap (max 10)
      const MAX_WB_ENTRIES = 10;
      const MAX_WB_ENTRY_SIZE = 500_000; // 500KB
      const wbKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('elab_wb_')) {
          try {
            const val = localStorage.getItem(k);
            const parsed = val ? JSON.parse(val) : null;
            wbKeys.push({ key: k, timestamp: parsed?.timestamp || 0 });
          } catch { wbKeys.push({ key: k, timestamp: 0 }); }
        }
      }
      // If at cap (excluding current key), remove oldest
      const otherKeys = wbKeys.filter(e => e.key !== key);
      if (otherKeys.length >= MAX_WB_ENTRIES) {
        otherKeys.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = otherKeys.length - MAX_WB_ENTRIES + 1; // make room for 1
        for (let i = 0; i < toRemove; i++) {
          localStorage.removeItem(otherKeys[i].key);
        }
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (rasterLayer.current) tempCtx.putImageData(rasterLayer.current, 0, 0);

      // Size-cap: try JPEG 0.5, then 0.3, then skip raster
      let rasterData = tempCanvas.toDataURL('image/jpeg', 0.5);
      if (rasterData.length > MAX_WB_ENTRY_SIZE) {
        rasterData = tempCanvas.toDataURL('image/jpeg', 0.3);
      }

      const entry = {
        version: 3,
        raster: rasterData.length <= MAX_WB_ENTRY_SIZE ? rasterData : null,
        elements: elements.current,
        timestamp: Date.now(),
      };
      const jsonStr = JSON.stringify(entry);
      // Final size check: if JSON > 500KB even without raster, save elements only
      if (jsonStr.length > MAX_WB_ENTRY_SIZE) {
        localStorage.setItem(key, JSON.stringify({
          version: 3,
          raster: null,
          elements: elements.current,
          timestamp: Date.now(),
        }));
      } else {
        localStorage.setItem(key, jsonStr);
      }
    } catch { /* quota exceeded */ }
  }, [experimentId]);

  // T1-002 fix: auto-save every 5s while whiteboard is active
  // Protects against crash/close without explicit save
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      saveToStorage();
    }, 5000);
    return () => clearInterval(interval);
  }, [active, saveToStorage]);

  // ── Get canvas coords from event ─────────────
  // S112: Pointer Events API — unified mouse/touch/stylus with pressure support
  const getCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    // Pointer Events provide clientX/clientY directly (no e.touches needed)
    const clientX = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
    const clientY = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
      pressure: e.pressure ?? 0.5, // Apple Pencil: 0-1, mouse: 0.5 default
      pointerType: e.pointerType || 'mouse', // 'pen' for Apple Pencil, 'touch', 'mouse'
    };
  }, []);

  // ── Draw shape preview (during creation) ─────
  const drawShapePreview = useCallback((start, end) => {
    const canvas = canvasRef.current;
    if (!canvas || !preShapeSnapshot.current) return;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(preShapeSnapshot.current, 0, 0);
    for (const el of elements.current) { drawElement(ctx, el); }
    const dpr = window.devicePixelRatio || 1;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'rect') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (tool === 'circle') {
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      ctx.ellipse((start.x + end.x) / 2, (start.y + end.y) / 2, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    } else if (tool === 'arrow') {
      ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = Math.max(12, thickness * 4);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle - 0.4), end.y - headLen * Math.sin(angle - 0.4));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle + 0.4), end.y - headLen * Math.sin(angle + 0.4));
      ctx.stroke();
    }
  }, [color, thickness, tool]);

  // S112: Track if Apple Pencil (pen) is being used — enables palm rejection
  const lastPointerType = useRef('mouse');

  // ── Start drawing / shape / select ────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    // S112: Palm rejection — if pen was used recently, ignore touch events
    if (e.pointerType) lastPointerType.current = e.pointerType;
    if (e.pointerType === 'touch' && lastPointerType.current === 'pen') return;
    if (tool === 'text') return;
    const pt = getCoords(e);
    if (!pt) return;

    if (tool === 'select') {
      if (selectedId) {
        const selEl = elements.current.find(el => el.id === selectedId);
        const handle = selEl ? getResizeHandleAtPoint(selEl, pt) : null;
        if (handle) {
          resizeHandle.current = handle;
          dragStart.current = { x: pt.x, y: pt.y, origEl: { ...selEl } };
          isDrawing.current = true;
          return;
        }
      }
      const hit = hitTest(pt);
      if (hit) {
        setSelectedId(hit.id);
        dragStart.current = { x: pt.x, y: pt.y, origX: hit.x, origY: hit.y };
        resizeHandle.current = null;
        isDrawing.current = true;
      } else {
        setSelectedId(null);
      }
      forceUpdate(v => v + 1);
      return;
    }

    pushHistory();
    isDrawing.current = true;
    lastPoint.current = pt;

    if (isShapeTool) {
      shapeStart.current = pt;
      const canvas = canvasRef.current;
      if (canvas) {
        preShapeSnapshot.current = rasterLayer.current
          ? new ImageData(new Uint8ClampedArray(rasterLayer.current.data), rasterLayer.current.width, rasterLayer.current.height)
          : canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      }
    }
  }, [getCoords, pushHistory, tool, isShapeTool, hitTest, selectedId]);

  // ── Continue drawing / move / resize ─────────
  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    // S112: Palm rejection — ignore touch while pen is in use
    if (e.pointerType === 'touch' && lastPointerType.current === 'pen') return;
    const pt = getCoords(e);
    if (!pt) return;

    if (tool === 'select' && dragStart.current) {
      const dx = pt.x - dragStart.current.x;
      const dy = pt.y - dragStart.current.y;

      if (resizeHandle.current && selectedId) {
        const el = elements.current.find(el => el.id === selectedId);
        if (!el) return;
        const orig = dragStart.current.origEl;
        const handle = resizeHandle.current;
        const sh = e.shiftKey;
        if (el.type === 'rect' || el.type === 'circle') {
          if (handle === 'se') { el.w = orig.w + dx; el.h = sh ? orig.w + dx : orig.h + dy; }
          else if (handle === 'nw') { el.x = orig.x + dx; el.y = sh ? orig.y + dx : orig.y + dy; el.w = orig.w - dx; el.h = sh ? orig.w - dx : orig.h - dy; }
          else if (handle === 'ne') { el.w = orig.w + dx; el.y = sh ? orig.y - dx : orig.y + dy; el.h = sh ? orig.w + dx : orig.h - dy; }
          else if (handle === 'sw') { el.x = orig.x + dx; el.w = orig.w - dx; el.h = sh ? orig.w - dx : orig.h + dy; }
        } else if (el.type === 'line' || el.type === 'arrow') {
          if (handle === 'se' || handle === 'ne') { el.w = orig.w + dx; el.h = orig.h + dy; }
          else { el.x = orig.x + dx; el.y = orig.y + dy; el.w = orig.w - dx; el.h = orig.h - dy; }
        }
        redrawCanvas(); drawSelectionOverlay(); forceUpdate(v => v + 1);
        return;
      }

      if (selectedId) {
        const el = elements.current.find(el => el.id === selectedId);
        if (el) {
          el.x = dragStart.current.origX + dx;
          el.y = dragStart.current.origY + dy;
          redrawCanvas(); drawSelectionOverlay(); forceUpdate(v => v + 1);
        }
      }
      return;
    }

    if (isShapeTool && shapeStart.current) { lastPoint.current = pt; drawShapePreview(shapeStart.current, pt); return; }

    if (!lastPoint.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    const dpr = window.devicePixelRatio || 1;
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
    // S112: Pressure-sensitive stroke width for Apple Pencil (pen pointerType)
    const pressureMultiplier = pt.pointerType === 'pen'
      ? 0.5 + pt.pressure * 1.5 // pen: 0.5x → 2x based on pressure
      : 1; // mouse/touch: no pressure scaling
    const baseWidth = tool === 'eraser' ? thickness * 4 : thickness;
    ctx.lineWidth = baseWidth * dpr * pressureMultiplier;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    lastPoint.current = pt;
  }, [color, thickness, tool, getCoords, isShapeTool, drawShapePreview, selectedId, redrawCanvas, drawSelectionOverlay]);

  // ── End drawing / finalize ─────────────
  const endDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (tool === 'select') {
      if (dragStart.current && selectedId) { pushHistory(); saveToStorage(); }
      dragStart.current = null; resizeHandle.current = null;
      redrawCanvas(); drawSelectionOverlay();
      return;
    }

    if (isShapeTool && shapeStart.current && lastPoint.current) {
      const start = shapeStart.current;
      const end = lastPoint.current;
      const w = end.x - start.x;
      const h = end.y - start.y;
      if (Math.abs(w) > 2 || Math.abs(h) > 2) {
        elements.current.push({ id: nextElementId(), type: tool, x: start.x, y: start.y, w, h, color, thickness });
      }
      redrawCanvas();
    } else if (tool === 'pencil' || tool === 'eraser') {
      saveRasterLayer();
    }

    lastPoint.current = null; shapeStart.current = null; preShapeSnapshot.current = null;
    saveToStorage();
  }, [saveToStorage, tool, isShapeTool, color, thickness, redrawCanvas, saveRasterLayer, selectedId, pushHistory, drawSelectionOverlay]);

  // ── Text tool click ─────────────────────────
  const handleCanvasClick = useCallback((e) => {
    if (tool === 'text') {
      const pt = getCoords(e);
      if (!pt) return;
      setTextInput(pt);
      setTimeout(() => textInputRef.current?.focus(), 50);
    }
  }, [tool, getCoords]);

  // ── Commit text → vector element ────────────
  // Andrea /goal 25/05 PM-3 bug-fix: "Quando scrivo sulla lavagna la scritta
  // si sposta rispetto a dove avevo scritto".
  //
  // Root cause (systematic-debugging Phase 1-3):
  //   - Input element ha padding:4px 8px + border:2px solid → testo digitato
  //     visivamente offset di (10px,6px) CSS dall'outer edge dell'input.
  //   - commitText storeava element.x = textInput.x (outer edge) → canvas
  //     fillText(baseline='top') rendeva il testo all'outer edge invece che
  //     dove l'utente lo aveva visto digitato. Drift visibile su commit.
  //   - Aggravante: font dimensione diversa (input 14-20px vs canvas 16-24px)
  //     → text width/height percepiti differenti = "si sposta" subjective.
  //
  // Fix: (1) match font sizes input ↔ canvas (vedi style sotto),
  //      (2) offset element.x/y di (padding+border)*dpr per allineare
  //      canvas render al testo visibile dentro l'input.
  const TEXT_INPUT_PADDING_LEFT_CSS = 8;
  const TEXT_INPUT_PADDING_TOP_CSS = 4;
  const TEXT_INPUT_BORDER_CSS = 2;
  const commitText = useCallback((value) => {
    if (!value || !textInput) { setTextInput(null); return; }
    const canvas = canvasRef.current;
    if (!canvas) { setTextInput(null); return; }
    pushHistory();
    const dpr = window.devicePixelRatio || 1;
    const fontSize = Math.max(16, thickness * 6);
    const deviceFontSize = fontSize * dpr;
    const ctx = canvas.getContext('2d');
    ctx.font = `${deviceFontSize}px 'Open Sans', sans-serif`;
    // Padding+border offsets (CSS px) converted to canvas-internal coords
    const offsetX = (TEXT_INPUT_PADDING_LEFT_CSS + TEXT_INPUT_BORDER_CSS) * dpr;
    const offsetY = (TEXT_INPUT_PADDING_TOP_CSS + TEXT_INPUT_BORDER_CSS) * dpr;
    const elX = textInput.x + offsetX;
    const elY = textInput.y + offsetY;
    const maxWidth = canvas.width - elX - 10;
    const words = value.split(' ');
    let line = '';
    let lines = [];
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    const textWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
    const textHeight = lines.length * deviceFontSize * 1.3;
    elements.current.push({ id: nextElementId(), type: 'text', x: elX, y: elY, text: lines.join('\n'), color, thickness, fontSize, textWidth, textHeight });
    setTextInput(null);
    redrawCanvas();
    saveToStorage();
  }, [textInput, color, thickness, pushHistory, redrawCanvas, saveToStorage]);

  // ── Clear all ────────────────────────────────
  // 2026-05-06 Bug #3: prima di cancellare tutto chiedi conferma.
  // L'utente confondeva il cestino (Cancella tutto) con la X (Chiudi lavagna)
  // perdendo i disegni. Ora il cestino richiede conferma esplicita; la X chiude
  // solo l'overlay senza toccare lo storage (i disegni restano).
  const clearAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hasContent = !!rasterLayer.current || elements.current.length > 0;
    if (hasContent && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm('Cancellare tutto il disegno della lavagna? Operazione non reversibile (puoi annullare con Ctrl+Z subito dopo).');
      if (!ok) return;
    }
    pushHistory();
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    rasterLayer.current = null;
    elements.current = [];
    setSelectedId(null);
    saveToStorage();
  }, [pushHistory, saveToStorage]);

  // ── Export PNG ────────────────────────────────
  const exportPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSelectedId(null);
    redrawCanvas();
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `elab-lavagna-${experimentId || 'disegno'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }, 50);
  }, [experimentId, redrawCanvas]);

  // ── Send to UNLIM AI ────────────────────────
  const sendToUNLIM = useCallback(() => {
    if (!onSendToUNLIM) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSelectedId(null);
    redrawCanvas();
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      onSendToUNLIM(dataUrl);
    }, 50);
  }, [onSendToUNLIM, redrawCanvas]);

  // ── Cursor ─────────────────────────────────
  const getCursor = () => {
    if (tool === 'select') return resizeHandle.current ? 'nwse-resize' : 'default';
    if (tool === 'text') return 'text';
    if (tool === 'eraser') return 'cell';
    return 'crosshair';
  };

  // ── Re-draw selection overlay after state change ─────
  useEffect(() => {
    if (selectedId && tool === 'select') { redrawCanvas(); drawSelectionOverlay(); }
  }, [selectedId, tool, redrawCanvas, drawSelectionOverlay]);

  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'auto', overflow: 'hidden' }}>
      {showGrid && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--elab-hex-c0c0c0) 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          pointerEvents: 'none', zIndex: 19, opacity: 0.5,
        }} />
      )}

      {/* S112: Pointer Events API — unified mouse/touch/Apple Pencil with pressure */}
      <canvas
        ref={canvasRef}
        data-elab-whiteboard-canvas="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          cursor: getCursor(), touchAction: 'none',
          transform: `scale(${zoom})`, transformOrigin: '0 0',
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId); // capture all pointer moves
          startDraw(e);
        }}
        onPointerMove={draw}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          endDraw(e);
        }}
        onPointerLeave={endDraw}
        onPointerCancel={endDraw}
        onClick={handleCanvasClick}
      />

      {textInput && (
        <input
          ref={textInputRef} type="text" autoFocus placeholder="Scrivi qui..."
          style={{
            position: 'absolute',
            left: `${(textInput.x / (canvasRef.current?.width || 1)) * 100}%`,
            top: `${(textInput.y / (canvasRef.current?.height || 1)) * 100}%`,
            background: 'rgba(255,255,255,0.9)', border: `2px solid ${color}`,
            borderRadius: '4px', padding: '4px 8px',
            /* Andrea /goal 25/05 PM-3: match canvas fontSize (vedi commitText)
               per evitare drift visivo "scritta si sposta" su commit. */
            fontSize: `${Math.max(16, thickness * 6)}px`,
            lineHeight: 1.3,
            boxSizing: 'content-box',
            fontFamily: "var(--font-sans, 'Open Sans', sans-serif)", color, outline: 'none',
            zIndex: 22, minWidth: '120px', maxWidth: '300px',
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') commitText(e.target.value); if (e.key === 'Escape') setTextInput(null); }}
          onBlur={(e) => commitText(e.target.value)}
        />
      )}

      {/* Toolbar — 2026-05-06 Bug #2/#6: collassabile + traslabile.
          Drag handle sinistra (icona puntini) sposta la toolbar; double-click reset.
          Bottone collapse destra minimizza in pill restore. */}
      {!toolbarCollapsed && (
        <div
          ref={toolbarRef}
          style={{
            position: 'absolute',
            top: toolbarPos ? `${toolbarPos.top}px` : '8px',
            left: toolbarPos ? `${toolbarPos.left}px` : '50%',
            transform: toolbarPos ? 'none' : 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: '3px',
            background: 'rgba(255,255,255,0.96)', borderRadius: '12px',
            padding: '5px 8px', boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            zIndex: 21, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 'calc(100% - 16px)',
            touchAction: 'none',
          }}
        >
          {/* Drag handle (left) */}
          <div
            ref={toolbarDragHandleRef}
            onPointerDown={handleToolbarDragStart}
            onDoubleClick={handleToolbarDoubleClick}
            title="Trascina per spostare la barra (doppio click per ricentrare)"
            aria-label="Trascina barra strumenti"
            style={{
              width: '12px', height: '32px', cursor: 'grab',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: 'var(--color-text-gray-500, #888)',
              userSelect: 'none',
            }}
          >
            <svg width="6" height="20" viewBox="0 0 6 20" fill="currentColor" aria-hidden="true">
              <circle cx="1.5" cy="3" r="1.2" /><circle cx="4.5" cy="3" r="1.2" />
              <circle cx="1.5" cy="10" r="1.2" /><circle cx="4.5" cy="10" r="1.2" />
              <circle cx="1.5" cy="17" r="1.2" /><circle cx="4.5" cy="17" r="1.2" />
            </svg>
          </div>
          <Sep />
          <ToolBtn active={tool === 'select'} label="Seleziona" onClick={() => setTool('select')}>
            <IconSelect />
          </ToolBtn>
          <Sep />
          <ToolBtn active={tool === 'pencil'} label="Matita" onClick={() => { setTool('pencil'); setSelectedId(null); }}>
            <IconPencil />
          </ToolBtn>
          <ToolBtn active={tool === 'eraser'} label="Gomma" onClick={() => { setTool('eraser'); setSelectedId(null); }} highlight="eraser">
            <IconEraser />
          </ToolBtn>
          <ToolBtn active={tool === 'text'} label="Testo" onClick={() => { setTool('text'); setSelectedId(null); }}>
            <IconText />
          </ToolBtn>
          <Sep />
          <ToolBtn active={tool === 'rect'} label="Rettangolo" onClick={() => { setTool('rect'); setSelectedId(null); }}>
            <IconRect />
          </ToolBtn>
          <ToolBtn active={tool === 'circle'} label="Cerchio" onClick={() => { setTool('circle'); setSelectedId(null); }}>
            <IconCircle />
          </ToolBtn>
          <ToolBtn active={tool === 'arrow'} label="Freccia" onClick={() => { setTool('arrow'); setSelectedId(null); }}>
            <IconArrow />
          </ToolBtn>
          <ToolBtn active={tool === 'line'} label="Linea" onClick={() => { setTool('line'); setSelectedId(null); }}>
            <IconLine />
          </ToolBtn>
          <Sep />
          {COLORS_PRESET.map(c => (
            <button key={c} onClick={() => { setColor(c); if (tool === 'eraser') setTool('pencil'); }}
              title={c} aria-label={`Colore ${c}`}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', background: c,
                cursor: 'pointer', padding: 0, flexShrink: 0, minWidth: '44px', minHeight: '44px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundClip: 'content-box', boxSizing: 'border-box', paddingInline: '4px', paddingBlock: '4px',
                border: color === c ? '2px solid var(--color-text-gray-700, #333)' : c === '#FFFFFF' ? '1px solid var(--color-border, #ccc)' : '2px solid transparent',
                boxShadow: color === c ? '0 0 0 2px #fff, 0 0 0 3px var(--color-text-gray-700, #333)' : 'none',
              }}
            />
          ))}
          <label title="Colore personalizzato" style={{
            width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
            background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            minWidth: '44px', minHeight: '44px', boxSizing: 'border-box', padding: '4px', backgroundClip: 'content-box',
            border: !COLORS_PRESET.includes(color) ? '2px solid var(--color-text-gray-700, #333)' : '2px solid transparent',
            boxShadow: !COLORS_PRESET.includes(color) ? '0 0 0 2px #fff, 0 0 0 3px var(--color-text-gray-700, #333)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative', overflow: 'hidden',
          }}>
            <input type="color" value={color}
              onChange={e => { setColor(e.target.value); if (tool === 'eraser') setTool('pencil'); }}
              style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
          </label>
          <Sep />
          {THICKNESS.map(t => (
            <button key={t} onClick={() => setThickness(t)} title={`Spessore ${t}px`} aria-label={`Spessore ${t}px`}
              style={{ ...toolBtnStyle(thickness === t), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: `${Math.min(t * 2.5, 16)}px`, height: `${Math.min(t * 2.5, 16)}px`, borderRadius: '50%', background: 'var(--color-text-gray-700, #333)' }} />
            </button>
          ))}
          <Sep />
          <ToolBtn label="Annulla (Ctrl+Z)" onClick={undo} disabled={!canUndo}><IconUndo /></ToolBtn>
          <ToolBtn label="Ripeti (Ctrl+Y)" onClick={redo} disabled={!canRedo}><IconRedo /></ToolBtn>
          <Sep />
          <ToolBtn label="Zoom indietro" onClick={() => setZoom(z => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))} disabled={zoom <= 0.5}><IconZoomOut /></ToolBtn>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-gray-500, #555)', minWidth: '36px', textAlign: 'center', lineHeight: '30px' }}>
            {Math.round(zoom * 100)}%
          </span>
          <ToolBtn label="Zoom avanti" onClick={() => setZoom(z => Math.min(2, Math.round((z + 0.1) * 10) / 10))} disabled={zoom >= 2}><IconZoomIn /></ToolBtn>
          <ToolBtn label={showGrid ? 'Nascondi griglia' : 'Mostra griglia'} active={showGrid} onClick={() => setShowGrid(g => !g)}><IconGrid /></ToolBtn>
          <Sep />
          <ToolBtn label="Salva PNG" onClick={exportPng}><IconDownload /></ToolBtn>
          {onSendToUNLIM && <ToolBtn label="Invia a UNLIM" onClick={sendToUNLIM}><IconUNLIM /></ToolBtn>}
          <ToolBtn label="Cancella tutto (chiede conferma)" onClick={clearAll} danger><IconTrash /></ToolBtn>
          <ToolBtn label="Chiudi lavagna (i disegni restano salvati)" onClick={onClose}><IconClose /></ToolBtn>
          <Sep />
          {/* Collapse — minimize toolbar in pill */}
          <ToolBtn label="Nascondi barra strumenti" onClick={toggleToolbarCollapsed}><IconCollapse /></ToolBtn>
        </div>
      )}

      {/* Restore pill when collapsed */}
      {toolbarCollapsed && (
        <button
          onClick={toggleToolbarCollapsed}
          title="Mostra barra strumenti"
          aria-label="Mostra barra strumenti"
          style={{
            position: 'absolute',
            top: toolbarPos ? `${toolbarPos.top}px` : '8px',
            left: toolbarPos ? `${toolbarPos.left}px` : '50%',
            transform: toolbarPos ? 'none' : 'translateX(-50%)',
            zIndex: 21,
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.96)', boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            border: '1px solid var(--color-border, #ddd)',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: 'var(--color-primary, #1E4D8C)', fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
          }}
        >
          <IconExpand />
          <span>Strumenti</span>
        </button>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────── */

function ToolBtn({ children, label, active, onClick, disabled, danger, highlight }) {
  // 2026-05-06 Bug #1: highlight="eraser" rende la Gomma sempre visibile con
  // ring rosso pastello, anche quando non attiva, per migliorarne l'affordance.
  // Stesso pattern applicabile ad altri tool che si fatica a riconoscere.
  const baseStyle = toolBtnStyle(active);
  const highlightStyle = highlight === 'eraser' && !active
    ? { boxShadow: 'inset 0 0 0 2px rgba(229,75,61,0.35)', background: 'rgba(229,75,61,0.08)' }
    : null;
  return (
    <button onClick={onClick} title={label} aria-label={label} disabled={disabled}
      style={{
        ...baseStyle,
        ...(highlightStyle || {}),
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'default' : 'pointer',
        color: danger ? 'var(--color-vol3, var(--elab-red))' : (active ? 'var(--color-primary, var(--elab-navy))' : 'var(--color-text-gray-500, #555)'),
      }}>
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: '1px', height: '20px', background: 'var(--color-border, #ddd)', flexShrink: 0 }} />;
}

function toolBtnStyle(active) {
  return {
    width: '44px', height: '44px', borderRadius: '6px',
    border: 'none', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: active ? 'var(--color-accent-light, #E8F5E9)' : 'transparent',
    color: active ? 'var(--color-primary, var(--elab-navy))' : 'var(--color-text-gray-500, #555)',
    transition: 'background 0.15s', padding: 0, flexShrink: 0,
  };
}

/* ── SVG Icons ──────────────────────────────── */
const svgProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

function IconSelect() { return <svg {...svgProps}><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" /></svg>; }
function IconPencil() { return <svg {...svgProps}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>; }
function IconEraser() { return <svg {...svgProps}><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /></svg>; }
function IconText() { return <svg {...svgProps}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>; }
function IconRect() { return <svg {...svgProps}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>; }
function IconCircle() { return <svg {...svgProps}><circle cx="12" cy="12" r="10" /></svg>; }
function IconArrow() { return <svg {...svgProps}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>; }
function IconLine() { return <svg {...svgProps}><line x1="5" y1="19" x2="19" y2="5" /></svg>; }
function IconUndo() { return <svg {...svgProps}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>; }
function IconRedo() { return <svg {...svgProps}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" /></svg>; }
function IconDownload() { return <svg {...svgProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }
function IconTrash() { return <svg {...svgProps}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>; }
function IconClose() { return <svg {...svgProps}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
// 2026-05-06 Bug #2: collapse/expand icons per nascondere/mostrare la toolbar.
function IconCollapse() { return <svg {...svgProps}><polyline points="6 9 12 15 18 9" /></svg>; }
function IconExpand() { return <svg {...svgProps}><polyline points="6 15 12 9 18 15" /></svg>; }
function IconZoomIn() { return <svg {...svgProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>; }
function IconZoomOut() { return <svg {...svgProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>; }
function IconGrid() { return <svg {...svgProps}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>; }
function IconUNLIM() { return <svg {...svgProps} stroke="var(--color-primary)"><circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" /><path d="M8 8l2 2 4-4" strokeWidth="1.5" /></svg>; }
// Andrea Marro — 20/02/2026
