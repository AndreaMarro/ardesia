import type { StudyResource, PostitReference } from "../../api";
import {
  pagePoint,
  type PageGeometry,
  type Rect,
} from "../../integrations/notebook/model";
export type LivingReference = {
  resourceId: string;
  revisionId: string;
  contextId?: string;
};
export const TEXT_MODEL = "native-pdfjs-items-concat-utf16-v1" as const;
export const COORDINATES = "pdf-normalized-unrotated-top-left-v1" as const;
export type TextSelector = {
  model: typeof TEXT_MODEL;
  start: number;
  end: number;
  exact: string;
  prefix: string;
  suffix: string;
};
export type SourceTarget = PostitReference & {
  documentSha256: string;
  page: number;
  rects: Rect[];
  text: TextSelector | null;
};
export type Block = {
  kind: "explanation" | "formula" | "exercise";
  text: string;
};
export type LivingAnnotation = {
  target: SourceTarget;
  blocks: Block[];
  lesson: { lessonId: string; activityId: string } | null;
  origin?: PostitReference;
  resume?: { scale: number; left: number; top: number };
};
export type LivingSource = StudyResource & {
  document: {
    title: string;
    version: string;
    assetId: string;
    sha256: string;
    pageCount: number;
    coordinates: typeof COORDINATES;
    origin?: PostitReference;
  };
};
export type AnnotationResource = StudyResource & {
  annotation: LivingAnnotation;
};
export const reference = (
  r: Pick<StudyResource, "id" | "revisionId" | "contextId">,
): PostitReference => ({
  resourceId: r.id,
  revisionId: r.revisionId,
  contextId: r.contextId,
});
export function targetFor(
  source: LivingSource,
  page: number,
  rects: Rect[],
  text: TextSelector | null = null,
): SourceTarget {
  return {
    ...reference(source),
    documentSha256: source.document.sha256,
    page,
    rects,
    text,
  };
}
export function normalizedRects(g: PageGeometry, boxes: Rect[]): Rect[] {
  return boxes
    .map(([x, y, w, h]) => {
      const points = [
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
      ].map(([px, py]) => pagePoint(g, px, py));
      const xs = points.map((p) => p[0]),
        ys = points.map((p) => p[1]);
      return [
        Math.min(...xs),
        Math.min(...ys),
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
      ] as Rect;
    })
    .filter((r) => r[2] > 0 && r[3] > 0);
}
export function textSelector(
  text: string,
  start: number,
  end: number,
): TextSelector {
  const boundary = (i: number) =>
    !(
      i > 0 &&
      i < text.length &&
      /[\ud800-\udbff]/.test(text[i - 1]) &&
      /[\udc00-\udfff]/.test(text[i])
    );
  if (
    !boundary(start) ||
    !boundary(end) ||
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end <= start ||
    end > text.length ||
    end - start > 5000
  )
    throw Error("invalid_text_selection");
  let prefixStart = Math.max(0, start - 40),
    suffixEnd = Math.min(text.length, end + 40);
  if (!boundary(prefixStart)) prefixStart++;
  if (!boundary(suffixEnd)) suffixEnd--;
  return {
    model: TEXT_MODEL,
    start,
    end,
    exact: text.slice(start, end),
    prefix: text.slice(prefixStart, start),
    suffix: text.slice(end, suffixEnd),
  };
}
export function verifyTextSelector(text: string, s: TextSelector): boolean {
  return (
    s.model === TEXT_MODEL &&
    text.slice(s.start, s.end) === s.exact &&
    text.slice(Math.max(0, s.start - s.prefix.length), s.start) === s.prefix &&
    text.slice(s.end, s.end + s.suffix.length) === s.suffix
  );
}
export function decodeAnnotation(value: unknown): LivingAnnotation {
  if (!value || typeof value !== "object") throw Error("invalid_annotation");
  const v = value as LivingAnnotation,
    t = v.target;
  if (
    !t ||
    typeof t.resourceId !== "string" ||
    typeof t.revisionId !== "string" ||
    typeof t.contextId !== "string" ||
    !/^[a-f0-9]{64}$/.test(t.documentSha256) ||
    !Number.isSafeInteger(t.page) ||
    t.page < 1 ||
    !Array.isArray(t.rects) ||
    !t.rects.length ||
    t.rects.length > 50 ||
    t.rects.some(
      (r) =>
        !Array.isArray(r) ||
        r.length !== 4 ||
        r.some((n) => !Number.isFinite(n) || n < 0 || n > 1) ||
        r[2] <= 0 ||
        r[3] <= 0 ||
        r[0] + r[2] > 1 + 1e-9 ||
        r[1] + r[3] > 1 + 1e-9,
    ) ||
    !Array.isArray(v.blocks) ||
    !v.blocks.length ||
    v.blocks.length > 30 ||
    v.blocks.some(
      (b) =>
        !["explanation", "formula", "exercise"].includes(b.kind) ||
        typeof b.text !== "string" ||
        b.text.length > 5000,
    )
  )
    throw Error("invalid_annotation");
  if (
    t.text &&
    (t.text.model !== TEXT_MODEL ||
      typeof t.text.exact !== "string" ||
      typeof t.text.prefix !== "string" ||
      typeof t.text.suffix !== "string" ||
      !Number.isSafeInteger(t.text.start) ||
      t.text.start < 0 ||
      t.text.end - t.text.start !== t.text.exact.length ||
      !t.text.exact.length)
  )
    throw Error("invalid_annotation");
  return v;
}
