/** Portable presentation data. Hashes are claims until Core inspects the artifact. */
export type Rect = [number, number, number, number];
export type Annotation = {
  id: string;
  page: number;
  rect: Rect;
  kind: "note" | "formula" | "highlight";
  content: string;
};
export type NotebookState = { v: 1; title: string; annotations: Annotation[] };
export type NotebookSnapshot = {
  v: 1;
  sha256: string;
  source: {
    assetId: string;
    sha256: string;
    pageCount: number;
    coordinates: "pdf-normalized-unrotated-top-left-v1";
  };
  state: NotebookState;
};
const invalid = () => new Error("invalid_notebook_presentation");
const SHA256 = /^[a-f0-9]{64}$/;
// Python str.strip(), as used by the canonical validator (not JavaScript trim()).
const ONLY_WHITESPACE = /^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*$/;
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).length !== keys.length
      || keys.some(key => !Object.prototype.hasOwnProperty.call(value, key))) throw invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, limit: number, nonblank = false): string {
  if (typeof value !== "string" || value.includes("\0")
      || (nonblank && ONLY_WHITESPACE.test(value))) throw invalid();
  let count = 0;
  for (const point of value) {
    const code = point.codePointAt(0)!;
    if (++count > limit || (code >= 0xd800 && code <= 0xdfff)) throw invalid();
  }
  return value;
}
function sha(value: unknown): string {
  if (typeof value !== "string" || value.length !== 64 || !SHA256.test(value)) throw invalid();
  return value;
}

/** Validate and copy the renderable shape; never recompute Python's canonical hash in JS. */
export function readNotebookSnapshot(value: unknown, derivedText: string): NotebookSnapshot {
  const snapshot = object(value, ["v", "sha256", "source", "state"]);
  if (snapshot.v !== 1) throw invalid();
  const source = object(snapshot.source, ["assetId", "sha256", "pageCount", "coordinates"]);
  if (typeof source.assetId !== "string" || source.assetId.length !== 32 || !/^[a-f0-9]{32}$/.test(source.assetId)
      || typeof source.pageCount !== "number" || !Number.isInteger(source.pageCount)
      || source.pageCount < 1 || source.pageCount > 20
      || source.coordinates !== "pdf-normalized-unrotated-top-left-v1") throw invalid();
  const raw = object(snapshot.state, ["v", "title", "annotations"]);
  if (raw.v !== 1 || !Array.isArray(raw.annotations) || raw.annotations.length > 200) throw invalid();
  const seen = new Set<string>();
  const pageCount = source.pageCount;
  const annotations: Annotation[] = raw.annotations.map(value => {
    const annotation = object(value, ["id", "page", "rect", "kind", "content"]);
    if (typeof annotation.id !== "string" || annotation.id.length < 1 || annotation.id.length > 64
        || /[^a-zA-Z0-9_-]/.test(annotation.id)
        || seen.has(annotation.id) || typeof annotation.page !== "number"
        || !Number.isInteger(annotation.page) || annotation.page < 1 || annotation.page > pageCount
        || !["note", "formula", "highlight"].includes(annotation.kind as string)
        || !Array.isArray(annotation.rect) || annotation.rect.length !== 4
        || annotation.rect.some(n => typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1)) throw invalid();
    seen.add(annotation.id);
    const [x, y, width, height] = annotation.rect as number[];
    if (x >= 1 || y >= 1 || width <= 0 || height <= 0 || x + width > 1 || y + height > 1) throw invalid();
    return {
      id: annotation.id, page: annotation.page,
      rect: [x, y, width, height],
      kind: annotation.kind as Annotation["kind"],
      content: text(annotation.content, 5000, annotation.kind !== "highlight"),
    };
  });
  const state: NotebookState = { v: 1, title: text(raw.title, 200, true), annotations };
  const expectedText = state.title + annotations.map(a => `\n[p. ${a.page}] ${a.content}`).join("");
  text(expectedText, 20_000);
  if (expectedText !== derivedText) throw invalid();
  // Core remains the authority for its 160 KiB canonical-state budget. This is
  // the presentation encoding; no hash/authenticity claim is inferred from it.
  if (new TextEncoder().encode(JSON.stringify(state)).byteLength > 160 * 1024) throw invalid();
  return {
    v: 1, sha256: sha(snapshot.sha256),
    source: {
      assetId: source.assetId, sha256: sha(source.sha256), pageCount,
      coordinates: "pdf-normalized-unrotated-top-left-v1",
    },
    state,
  };
}
