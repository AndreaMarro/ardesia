import type { StudyResource } from "../../api";
import type { Rect, NotebookState, NotebookSnapshot } from "../../../../studio/src/study/scientificNotebookSnapshot";
export type { Rect, Annotation, NotebookState } from "../../../../studio/src/study/scientificNotebookSnapshot";
export type NotebookResource = StudyResource & {
  kind: "scientific-notebook";
  notebook: NotebookSnapshot;
};
export function notebookResource(value: StudyResource): NotebookResource {
  const book = value as NotebookResource;
  if (book.kind !== "scientific-notebook" || book.notebook?.v !== 1
      || book.notebook.source?.coordinates !== "pdf-normalized-unrotated-top-left-v1"
      || !book.notebook.source.assetId || !book.notebook.source.sha256
      || book.notebook.state?.v !== 1 || !Array.isArray(book.notebook.state.annotations))
    throw Error("invalid_notebook_response");
  return book;
}
export function stateError(state: NotebookState): string {
  if (!state.title.trim()) return "Dai un titolo al quaderno.";
  if (state.annotations.length > 200) return "Il quaderno può contenere al massimo 200 annotazioni.";
  if (state.annotations.some(a => a.kind !== "highlight" && !a.content.trim()))
    return "Completa il testo della nota o della formula.";
  if (state.annotations.some(a => a.content.length > 5000)) return "Ogni annotazione può contenere fino a 5.000 caratteri.";
  const text = state.title + state.annotations.map(a => `\n[p. ${a.page}] ${a.content}`).join("");
  if (text.length > 20_000 || new TextEncoder().encode(JSON.stringify(state)).length > 160 * 1024)
    return "Il quaderno ha raggiunto il limite di testo. Conserva questa bozza e apri un altro quaderno.";
  return "";
}

/** Actual PDF.js viewport; includes intrinsic rotation, CropBox and userUnit. */
export type PageGeometry = {
  width: number; height: number; viewBox: number[];
  convertToPdfPoint: (x: number, y: number) => number[];
  convertToViewportPoint: (x: number, y: number) => number[];
};
export function pagePoint(geometry: PageGeometry, x: number, y: number): [number, number] {
  const [left, bottom, right, top] = geometry.viewBox;
  const [px, py] = geometry.convertToPdfPoint(x, y);
  return [Math.max(0, Math.min(1, (px - left) / (right - left))),
    Math.max(0, Math.min(1, (top - py) / (top - bottom)))];
}
export function displayRect(g: PageGeometry, [x, y, w, h]: Rect): Rect {
  const [left, bottom, right, top] = g.viewBox;
  const points = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([nx, ny]) => g.convertToViewportPoint(left + nx * (right - left), top - ny * (top - bottom)));
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}
export function anchorRect(x: number, y: number, width = .38, height = .13): Rect {
  return [Math.max(0, Math.min(1 - width, x - width / 2)),
    Math.max(0, Math.min(1 - height, y - height / 2)), width, height];
}
/** Translate in screen coordinates, then invert the actual rotated PDF viewport. */
export function translateRect(g: PageGeometry, rect: Rect, dx: number, dy: number): Rect {
  const [left, top, width, height] = displayRect(g, rect);
  const before = pagePoint(g, left + width / 2, top + height / 2);
  const after = pagePoint(g, left + width / 2 + dx, top + height / 2 + dy);
  return [Math.max(0, Math.min(1 - rect[2], rect[0] + after[0] - before[0])),
    Math.max(0, Math.min(1 - rect[3], rect[1] + after[1] - before[1])), rect[2], rect[3]];
}
