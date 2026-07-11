import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import type { LessonOsEvent } from "../lessonos/eventlog";

export type PluginAnnotationTool = "select" | "pen" | "highlighter" | "arrow" | "text" | "eraser";
export type PluginAnnotationAuthorRole = "teacher" | "student";
export type PluginAnnotationPoint = { x: number; y: number };

export type PluginAnnotationItem =
  | {
      id: string;
      kind: "stroke";
      tool: "pen" | "highlighter";
      points: PluginAnnotationPoint[];
      color: string;
      width: number;
      authorRole: PluginAnnotationAuthorRole;
    }
  | {
      id: string;
      kind: "arrow";
      from: PluginAnnotationPoint;
      to: PluginAnnotationPoint;
      color: string;
      authorRole: PluginAnnotationAuthorRole;
    }
  | {
      id: string;
      kind: "text";
      at: PluginAnnotationPoint;
      text: string;
      color: string;
      alternativeText: string;
      authorRole: PluginAnnotationAuthorRole;
    };

export type PluginAnnotationDocument = {
  v: 1;
  visible: boolean;
  locked: boolean;
  items: PluginAnnotationItem[];
  undo: PluginAnnotationItem[][];
  redo: PluginAnnotationItem[][];
};

type AnnotationEvent = Extract<LessonOsEvent, { kind: "plugin.annotation.changed" }>;
type AnnotationOperation = AnnotationEvent["operation"];

export function emptyPluginAnnotations(): PluginAnnotationDocument {
  return { v: 1, visible: true, locked: false, items: [], undo: [], redo: [] };
}

type PluginInkOverlayProps = {
  instanceId: string;
  pluginId?: string;
  value: PluginAnnotationDocument;
  onChange: (next: PluginAnnotationDocument) => void;
  emitLessonEvent?: (event: LessonOsEvent) => void;
  authorRole?: PluginAnnotationAuthorRole;
  children?: ReactNode;
};

type Draft =
  | { pointerId: number; kind: "stroke"; tool: "pen" | "highlighter"; points: PluginAnnotationPoint[] }
  | { pointerId: number; kind: "arrow"; from: PluginAnnotationPoint; to: PluginAnnotationPoint };

type SelectionDrag = {
  pointerId: number;
  annotationId: string;
  from: PluginAnnotationPoint;
};

const TOOL_BUTTONS: Array<{ tool: PluginAnnotationTool; label: string; glyph: string }> = [
  { tool: "pen", label: "Penna", glyph: "P" },
  { tool: "highlighter", label: "Evidenziatore", glyph: "H" },
  { tool: "arrow", label: "Freccia", glyph: "↗" },
  { tool: "text", label: "Testo", glyph: "T" },
  { tool: "eraser", label: "Gomma", glyph: "E" },
  { tool: "select", label: "Seleziona", glyph: "S" },
];

const OPERATION_LABELS: Record<AnnotationOperation, string> = {
  add: "Annotazione aggiunta",
  update: "Annotazione aggiornata",
  remove: "Annotazione rimossa",
  clear: "Annotazioni cancellate",
  undo: "Annotazione annullata",
  redo: "Annotazione ripristinata",
  visibility: "Visibilità annotazioni aggiornata",
  lock: "Blocco annotazioni aggiornato",
};

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function stableCoordinate(value: number): number {
  return Math.round(clamp(value) * 10_000) / 10_000;
}

function pointFromEvent(event: ReactPointerEvent<HTMLElement>, bounds: Element | null): PluginAnnotationPoint {
  const rect = (bounds ?? event.currentTarget).getBoundingClientRect();
  const width = rect.width || 100;
  const height = rect.height || 100;
  return {
    x: stableCoordinate((event.clientX - rect.left) / width),
    y: stableCoordinate((event.clientY - rect.top) / height),
  };
}

function appendPoint(points: PluginAnnotationPoint[], next: PluginAnnotationPoint): PluginAnnotationPoint[] {
  const last = points.at(-1);
  return last?.x === next.x && last.y === next.y ? points : [...points, next];
}

function translatePoint(point: PluginAnnotationPoint, dx: number, dy: number): PluginAnnotationPoint {
  return { x: stableCoordinate(point.x + dx), y: stableCoordinate(point.y + dy) };
}

function translateItem(item: PluginAnnotationItem, dx: number, dy: number): PluginAnnotationItem {
  if (item.kind === "stroke") {
    return { ...item, points: item.points.map((point) => translatePoint(point, dx, dy)) };
  }
  if (item.kind === "arrow") {
    return { ...item, from: translatePoint(item.from, dx, dy), to: translatePoint(item.to, dx, dy) };
  }
  return { ...item, at: translatePoint(item.at, dx, dy) };
}

function annotationIdFromTarget(target: EventTarget | null): string | undefined {
  return target instanceof Element
    ? target.closest<HTMLElement>("[data-plugin-annotation-id]")?.dataset.pluginAnnotationId
    : undefined;
}

function isInkControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-plugin-ink-control]") !== null;
}

function nextOrdinal(instanceId: string, value: PluginAnnotationDocument): number {
  const prefix = `${instanceId}:annotation:`;
  const ids = [value.items, ...value.undo, ...value.redo].flat().map((item) => item.id);
  return ids.reduce((highest, id) => {
    if (!id.startsWith(prefix)) return highest;
    const ordinal = Number(id.slice(prefix.length));
    return Number.isInteger(ordinal) ? Math.max(highest, ordinal) : highest;
  }, 0) + 1;
}

export function PluginInkOverlay({
  instanceId,
  pluginId = instanceId,
  value,
  onChange,
  emitLessonEvent,
  authorRole = "teacher",
  children,
}: PluginInkOverlayProps) {
  const [activeTool, setActiveTool] = useState<PluginAnnotationTool>("select");
  const [annotationMode, setAnnotationMode] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selectionDrag, setSelectionDrag] = useState<SelectionDrag | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textAt, setTextAt] = useState<PluginAnnotationPoint | null>(null);
  const [text, setText] = useState("");
  const [alternativeText, setAlternativeText] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const stageRef = useRef<SVGSVGElement>(null);
  const nextIdRef = useRef(nextOrdinal(instanceId, value));
  const arrowMarkerId = useMemo(
    () => `plugin-ink-arrow-${instanceId.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    [instanceId],
  );

  function emit(operation: AnnotationOperation, annotationId?: string) {
    emitLessonEvent?.({
      kind: "plugin.annotation.changed",
      pluginId,
      instanceId,
      operation,
      ...(annotationId ? { annotationId } : {}),
      authorRole,
      labels: { it: OPERATION_LABELS[operation] },
      t: Date.now(),
      evidence: [`plugin:${pluginId}@${instanceId}`],
      causationId: `${instanceId}:annotation:${operation}:${annotationId ?? "document"}`,
      provenance: {
        surface: "overlay",
        pluginId,
        source: "Plugin live annotation overlay",
      },
    });
  }

  function commit(next: PluginAnnotationDocument, operation: AnnotationOperation, annotationId?: string) {
    onChange(next);
    emit(operation, annotationId);
  }

  function commitItems(items: PluginAnnotationItem[], operation: "add" | "update" | "remove" | "clear", annotationId?: string) {
    commit({ ...value, items, undo: [...value.undo, value.items], redo: [] }, operation, annotationId);
  }

  function createId(): string {
    const ordinal = Math.max(nextIdRef.current, nextOrdinal(instanceId, value));
    const id = `${instanceId}:annotation:${ordinal}`;
    nextIdRef.current = ordinal + 1;
    return id;
  }

  function removeAnnotation(annotationId: string) {
    if (value.locked) return;
    const items = value.items.filter((item) => item.id !== annotationId);
    if (items.length === value.items.length) return;
    setSelectedId(null);
    commitItems(items, "remove", annotationId);
  }

  function chooseTool(tool: PluginAnnotationTool) {
    if (value.locked || !value.visible) return;
    setActiveTool(tool);
    setAnnotationMode(true);
    setSelectedId(null);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isInkControl(event.target) || value.locked || !value.visible) return;

    const annotationId = annotationIdFromTarget(event.target);
    const tool = event.pointerType === "pen" && !annotationMode ? "pen" : activeTool;
    const canUsePointer = event.pointerType === "pen" || annotationMode;
    if (!canUsePointer) return;

    if (tool === "select") {
      setSelectedId(annotationId ?? null);
      if (annotationId) {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setSelectionDrag({ pointerId: event.pointerId, annotationId, from: pointFromEvent(event, stageRef.current) });
      }
      return;
    }
    if (tool === "eraser") {
      if (annotationId) removeAnnotation(annotationId);
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = pointFromEvent(event, stageRef.current);
    if (tool === "text") {
      setTextAt(point);
      setText("");
      setAlternativeText("");
      return;
    }
    if (tool === "arrow") {
      setDraft({ pointerId: event.pointerId, kind: "arrow", from: point, to: point });
      return;
    }
    if (tool === "pen" || tool === "highlighter") {
      setDraft({ pointerId: event.pointerId, kind: "stroke", tool, points: [point] });
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (selectionDrag?.pointerId === event.pointerId) {
      event.preventDefault();
      return;
    }
    if (!draft || draft.pointerId !== event.pointerId) return;
    event.preventDefault();
    const point = pointFromEvent(event, stageRef.current);
    setDraft(draft.kind === "stroke"
      ? { ...draft, points: appendPoint(draft.points, point) }
      : { ...draft, to: point });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (selectionDrag?.pointerId === event.pointerId) {
      event.preventDefault();
      const to = pointFromEvent(event, stageRef.current);
      const dx = to.x - selectionDrag.from.x;
      const dy = to.y - selectionDrag.from.y;
      setSelectionDrag(null);
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      if (dx !== 0 || dy !== 0) {
        commitItems(
          value.items.map((item) => item.id === selectionDrag.annotationId ? translateItem(item, dx, dy) : item),
          "update",
          selectionDrag.annotationId,
        );
      }
      return;
    }
    if (!draft || draft.pointerId !== event.pointerId) return;
    event.preventDefault();
    const point = pointFromEvent(event, stageRef.current);
    const id = createId();
    const item: PluginAnnotationItem = draft.kind === "stroke"
      ? {
          id,
          kind: "stroke",
          tool: draft.tool,
          points: appendPoint(draft.points, point),
          color: draft.tool === "highlighter" ? "#f4c542" : "#173f73",
          width: draft.tool === "highlighter" ? 0.035 : 0.008,
          authorRole,
        }
      : {
          id,
          kind: "arrow",
          from: draft.from,
          to: point,
          color: "#173f73",
          authorRole,
        };
    setDraft(null);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    commitItems([...value.items, item], "add", id);
  }

  function addText() {
    const shortText = text.trim();
    if (!textAt || !shortText) return;
    const id = createId();
    const item: PluginAnnotationItem = {
      id,
      kind: "text",
      at: textAt,
      text: shortText,
      color: "#173f73",
      alternativeText: alternativeText.trim() || shortText,
      authorRole,
    };
    setTextAt(null);
    commitItems([...value.items, item], "add", id);
  }

  function undo() {
    if (value.locked || value.undo.length === 0) return;
    const previous = value.undo.at(-1) ?? [];
    commit({
      ...value,
      items: previous,
      undo: value.undo.slice(0, -1),
      redo: [...value.redo, value.items],
    }, "undo");
  }

  function redo() {
    if (value.locked || value.redo.length === 0) return;
    const next = value.redo.at(-1) ?? [];
    commit({
      ...value,
      items: next,
      undo: [...value.undo, value.items],
      redo: value.redo.slice(0, -1),
    }, "redo");
  }

  function toggleVisibility() {
    commit({ ...value, visible: !value.visible }, "visibility");
  }

  function toggleLock() {
    const locked = !value.locked;
    if (locked) {
      setAnnotationMode(false);
      setDraft(null);
      setSelectedId(null);
    }
    commit({ ...value, locked }, "lock");
  }

  function clear() {
    setConfirmClear(false);
    if (value.locked || value.items.length === 0) return;
    setSelectedId(null);
    commitItems([], "clear");
  }

  function handleStageKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if ((event.key === "Backspace" || event.key === "Delete") && selectedId) {
      event.preventDefault();
      removeAnnotation(selectedId);
    }
    if (event.key === "Escape") {
      setAnnotationMode(false);
      setSelectedId(null);
      setDraft(null);
    }
  }

  const previewItems: PluginAnnotationItem[] = draft === null
    ? []
    : draft.kind === "stroke"
      ? [{
          id: "draft",
          kind: "stroke",
          tool: draft.tool,
          points: draft.points,
          color: draft.tool === "highlighter" ? "#f4c542" : "#173f73",
          width: draft.tool === "highlighter" ? 0.035 : 0.008,
          authorRole,
        }]
      : [{ id: "draft", kind: "arrow", from: draft.from, to: draft.to, color: "#173f73", authorRole }];

  return (
    <div
      data-plugin-annotation-surface={instanceId}
      style={overlayRootStyle}
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
      onPointerCancelCapture={() => { setDraft(null); setSelectionDrag(null); }}
      onKeyDown={handleStageKeyDown}
    >
      <div data-plugin-ink-content style={contentStyle}>{children}</div>
      <svg
        ref={stageRef}
        data-testid="plugin-ink-stage"
        aria-label="Annotazioni del plugin"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        style={{
          ...stageStyle,
          pointerEvents: annotationMode ? "auto" : "none",
          cursor: value.locked ? "not-allowed" : annotationMode ? "crosshair" : "default",
          visibility: value.visible ? "visible" : "hidden",
        }}
      >
        <defs>
          <marker id={arrowMarkerId} markerWidth="0.04" markerHeight="0.04" refX="0.035" refY="0.02" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0.04,0.02 L0,0.04 z" fill="#173f73" />
          </marker>
        </defs>
        {[...value.items, ...previewItems].map((item) => (
          <AnnotationVector
            key={item.id}
            item={item}
            markerId={arrowMarkerId}
            selected={item.id === selectedId}
            interactive={annotationMode && item.id !== "draft"}
          />
        ))}
      </svg>

      <div role="toolbar" aria-label="Strumenti annotazione plugin" data-plugin-ink-control style={toolbarStyle}>
        {TOOL_BUTTONS.map(({ tool, label, glyph }) => (
          <button
            key={tool}
            type="button"
            aria-label={label}
            aria-pressed={annotationMode && activeTool === tool}
            title={label}
            disabled={value.locked || !value.visible}
            style={toolButtonStyle(annotationMode && activeTool === tool)}
            onClick={() => chooseTool(tool)}
          >
            <span aria-hidden>{glyph}</span>
          </button>
        ))}
        <button
          type="button"
          aria-label={value.visible ? "Nascondi annotazioni" : "Mostra annotazioni"}
          title={value.visible ? "Nascondi annotazioni" : "Mostra annotazioni"}
          style={buttonStyle}
          onClick={toggleVisibility}
        >
          <span aria-hidden>{value.visible ? "V" : "-"}</span>
        </button>
        <button
          type="button"
          aria-label={value.locked ? "Sblocca annotazioni" : "Blocca annotazioni"}
          title={value.locked ? "Sblocca annotazioni" : "Blocca annotazioni"}
          aria-pressed={value.locked}
          style={buttonStyle}
          onClick={toggleLock}
        >
          <span aria-hidden>{value.locked ? "U" : "L"}</span>
        </button>
        <button type="button" aria-label="Annulla" title="Annulla" disabled={value.locked || value.undo.length === 0} style={buttonStyle} onClick={undo}>
          <span aria-hidden>↶</span>
        </button>
        <button type="button" aria-label="Ripristina" title="Ripristina" disabled={value.locked || value.redo.length === 0} style={buttonStyle} onClick={redo}>
          <span aria-hidden>↷</span>
        </button>
        <button
          type="button"
          aria-label="Cancella annotazioni"
          title="Cancella annotazioni"
          disabled={value.locked || value.items.length === 0}
          style={buttonStyle}
          onClick={() => setConfirmClear(true)}
        >
          <span aria-hidden>×</span>
        </button>
      </div>

      {textAt && (
        <div role="dialog" aria-modal="true" aria-label="Aggiungi annotazione testuale" data-plugin-ink-control style={dialogBackdropStyle}>
          <form style={dialogStyle} onSubmit={(event) => { event.preventDefault(); addText(); }}>
            <strong>Aggiungi testo</strong>
            <label style={fieldStyle}>
              Testo breve
              <input autoFocus maxLength={120} value={text} onChange={(event) => setText(event.currentTarget.value)} />
            </label>
            <label style={fieldStyle}>
              Testo alternativo
              <input maxLength={180} value={alternativeText} onChange={(event) => setAlternativeText(event.currentTarget.value)} />
            </label>
            <div style={dialogActionsStyle}>
              <button type="button" style={dialogButtonStyle} onClick={() => setTextAt(null)}>Annulla</button>
              <button type="submit" style={dialogButtonStyle} disabled={!text.trim()}>Aggiungi testo</button>
            </div>
          </form>
        </div>
      )}

      {confirmClear && (
        <div role="dialog" aria-modal="true" aria-label="Conferma cancellazione annotazioni" data-plugin-ink-control style={dialogBackdropStyle}>
          <div style={dialogStyle}>
            <strong>Cancellare tutte le annotazioni?</strong>
            <div style={dialogActionsStyle}>
              <button type="button" style={dialogButtonStyle} onClick={() => setConfirmClear(false)}>Annulla</button>
              <button type="button" style={dialogButtonStyle} onClick={clear}>Conferma cancellazione</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [data-plugin-annotation-surface] [data-plugin-ink-content] > [data-plugin-runtime-surface] { min-height: 100%; }
        [data-plugin-annotation-surface] button:focus-visible,
        [data-plugin-annotation-surface] input:focus-visible { outline: 3px solid #4b88c7; outline-offset: 2px; }
        @media (max-width: 768px) {
          [data-plugin-annotation-surface] [data-plugin-ink-content] > [data-plugin-runtime-surface="simulation"] > main {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-plugin-annotation-surface], [data-plugin-annotation-surface] * {
            animation: none !important; transition: none !important; scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function AnnotationVector({
  item,
  markerId,
  selected,
  interactive,
}: {
  item: PluginAnnotationItem;
  markerId: string;
  selected: boolean;
  interactive: boolean;
}) {
  const common = {
    "data-plugin-annotation-id": item.id,
    "data-testid": `plugin-annotation-${item.id}`,
    "data-selected": selected ? "true" : "false",
    style: { pointerEvents: interactive ? "all" : "none" } as CSSProperties,
  };
  if (item.kind === "stroke") {
    const points = item.points.map((point) => `${point.x},${point.y}`).join(" ");
    return (
      <g {...common}>
        {selected && <polyline points={points} fill="none" stroke="#ffffff" strokeWidth={item.width + 0.012} strokeDasharray="0.02 0.012" />}
        <polyline
          points={points}
          fill="none"
          stroke={item.color}
          strokeWidth={item.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={item.tool === "highlighter" ? 0.48 : 1}
        />
      </g>
    );
  }
  if (item.kind === "arrow") {
    return (
      <g {...common}>
        {selected && <line x1={item.from.x} y1={item.from.y} x2={item.to.x} y2={item.to.y} stroke="#ffffff" strokeWidth="0.018" />}
        <line
          x1={item.from.x}
          y1={item.from.y}
          x2={item.to.x}
          y2={item.to.y}
          stroke={item.color}
          strokeWidth="0.008"
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
        />
      </g>
    );
  }
  return (
    <g {...common}>
      <title>{item.alternativeText}</title>
      <text
        x={item.at.x}
        y={item.at.y}
        fill={item.color}
        fontSize="0.045"
        fontFamily="system-ui, sans-serif"
        paintOrder={selected ? "stroke" : undefined}
        stroke={selected ? "#ffffff" : undefined}
        strokeWidth={selected ? "0.008" : undefined}
      >
        {item.text}
      </text>
    </g>
  );
}

const overlayRootStyle: CSSProperties = {
  position: "relative",
  isolation: "isolate",
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: "100%",
};

const contentStyle: CSSProperties = { minWidth: 0, minHeight: "100%" };

const stageStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 4,
  width: "100%",
  height: "100%",
  overflow: "visible",
  touchAction: "none",
};

const toolbarStyle: CSSProperties = {
  position: "absolute",
  zIndex: 5,
  left: 6,
  right: 6,
  bottom: 6,
  display: "flex",
  gap: 4,
  overflowX: "auto",
  padding: 4,
  border: "1px solid rgba(37, 58, 82, .18)",
  borderRadius: 6,
  background: "rgba(255, 255, 255, .94)",
  boxShadow: "0 3px 10px rgba(37, 58, 82, .14)",
};

const buttonStyle: CSSProperties = {
  minWidth: 44,
  minHeight: 44,
  width: 44,
  height: 44,
  flex: "0 0 44px",
  border: "1px solid #cbd3dc",
  borderRadius: 6,
  background: "#ffffff",
  color: "#243f61",
  font: "700 16px/1 system-ui, sans-serif",
  cursor: "pointer",
};

function toolButtonStyle(active: boolean): CSSProperties {
  return active
    ? { ...buttonStyle, borderColor: "#315f91", background: "#e8f0f8", color: "#173f73" }
    : buttonStyle;
}

const dialogBackdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 7,
  display: "grid",
  placeItems: "center",
  padding: 12,
  background: "rgba(245, 246, 248, .76)",
};

const dialogStyle: CSSProperties = {
  width: "min(360px, 100%)",
  boxSizing: "border-box",
  display: "grid",
  gap: 12,
  padding: 16,
  border: "1px solid #cbd3dc",
  borderRadius: 6,
  background: "#ffffff",
  color: "#243f61",
  boxShadow: "0 10px 30px rgba(37, 58, 82, .2)",
};

const fieldStyle: CSSProperties = { display: "grid", gap: 5, fontSize: 13, fontWeight: 700 };
const dialogActionsStyle: CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" };
const dialogButtonStyle: CSSProperties = { ...buttonStyle, width: "auto", padding: "0 12px", flex: "0 0 auto" };
