import { useRef, useState, type PointerEvent } from "react";
import type { PdfFrame } from "./renderPdfPage";
import { anchorRect, displayRect, pagePoint, translateRect, type Annotation, type Rect } from "./model";
import { FormulaPreview } from "./FormulaPreview";

export function AnnotationLayer({ frame, annotations, selected, placing, placingSize, onSelect, onPlace, onMove }: {
  frame: PdfFrame; annotations: Annotation[]; selected?: string; placing?: boolean; placingSize?: [number, number];
  onSelect?: (id: string) => void; onPlace?: (rect: Rect) => void; onMove?: (id: string, rect: Rect) => void;
}) {
  const visible = annotations.filter(a => a.page === frame.number);
  const [pdfLeft, pdfBottom, pdfRight] = frame.geometry.viewBox;
  const start = frame.geometry.convertToViewportPoint(pdfLeft, pdfBottom);
  const end = frame.geometry.convertToViewportPoint(pdfRight, pdfBottom);
  const textScale = Math.hypot(end[0] - start[0], end[1] - start[1]) / (pdfRight - pdfLeft);
  const drag = useRef<{ id: string; pointer: number; x: number; y: number; rect: Rect; scaleX: number; scaleY: number } | null>(null);
  const [preview, setPreview] = useState<{ id: string; rect: Rect } | null>(null);
  function point(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return pagePoint(frame.geometry,
      (event.clientX - box.left) * frame.geometry.width / box.width,
      (event.clientY - box.top) * frame.geometry.height / box.height);
  }
  return <div className={`notebook-layer ${placing ? "is-placing" : ""}`}
    style={{ width: frame.geometry.width, height: frame.geometry.height }}
    onPointerDown={event => {
      if (!placing || event.target !== event.currentTarget) return;
      const [x, y] = point(event); onPlace?.(anchorRect(x, y, placingSize?.[0], placingSize?.[1]));
    }}>
    {visible.map((a, index) => {
      const [left, top, width, height] = displayRect(frame.geometry, preview?.id === a.id ? preview.rect : a.rect);
      return <button type="button" key={a.id}
        className={`notebook-anchor notebook-anchor-${a.kind} ${selected === a.id ? "is-selected" : ""}`}
        style={{ left, top, width, height, fontSize: 13 * textScale }}
        aria-label={`${a.kind === "formula" ? "Formula" : a.kind === "highlight" ? "Evidenziazione" : "Nota"} ${index + 1}, pagina ${a.page}: ${a.content || "senza testo"}`}
        onClick={() => onSelect?.(a.id)}
        onPointerDown={event => {
          if (!onMove || event.button !== 0) return;
          const box = event.currentTarget.parentElement!.getBoundingClientRect();
          drag.current = { id: a.id, pointer: event.pointerId, x: event.clientX, y: event.clientY,
            rect: a.rect, scaleX: frame.geometry.width / box.width, scaleY: frame.geometry.height / box.height };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          const start = drag.current;
          if (!start || start.id !== a.id || start.pointer !== event.pointerId) return;
          setPreview({ id: a.id, rect: translateRect(frame.geometry, start.rect,
            (event.clientX - start.x) * start.scaleX, (event.clientY - start.y) * start.scaleY) });
        }}
        onPointerUp={event => {
          const start = drag.current;
          if (!start || start.id !== a.id || start.pointer !== event.pointerId) return;
          drag.current = null; setPreview(null);
          if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 3)
            onMove?.(a.id, translateRect(frame.geometry, start.rect,
              (event.clientX - start.x) * start.scaleX, (event.clientY - start.y) * start.scaleY));
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drag.current = null; setPreview(null); }}
        onLostPointerCapture={() => { drag.current = null; setPreview(null); }}
        onKeyDown={event => {
          if (!onMove || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          const step = event.shiftKey ? .05 : .01;
          onMove(a.id, translateRect(frame.geometry, a.rect,
            frame.geometry.width * (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0),
            frame.geometry.height * (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0)));
        }}>
        <span aria-hidden="true">{index + 1}</span>
        <span className="notebook-anchor-caption" aria-hidden="true">{a.kind === "formula" ? <FormulaPreview value={a.content} /> : a.content}</span>
      </button>;
    })}
  </div>;
}
