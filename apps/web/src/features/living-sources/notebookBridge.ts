import type { NotebookState } from "../../integrations/notebook/model";
import type {
  LivingSource,
  SourceTarget,
  Block,
  LivingReference,
} from "./model";
/** Bounded excerpt plus a complete exact citation. Never truncate provenance to fit prose. */
export function notebookCopyState(
  source: LivingSource,
  target: SourceTarget,
  blocks: Block[],
  annotation?: LivingReference,
): NotebookState {
  const citation = JSON.stringify({
    format: "ardesia-living-citation-v1",
    version: source.document.version,
    target,
    ...(annotation ? { annotation } : {}),
  });
  const safeEnd = (text: string, end: number) =>
    end > 0 &&
    end < text.length &&
    /[\ud800-\udbff]/.test(text[end - 1]) &&
    /[\udc00-\udfff]/.test(text[end])
      ? end - 1
      : end;
  const chunks: string[] = [];
  for (let start = 0; start < citation.length; ) {
    const end = safeEnd(citation, Math.min(citation.length, start + 4500));
    chunks.push(citation.slice(start, end));
    start = end;
  }
  const prose =
    "Estratto del ragionamento:\n" + blocks.map((b) => b.text).join("\n");
  const excerpt = prose.slice(0, safeEnd(prose, Math.min(prose.length, 5000)));
  const title = "Appunti · " + source.document.title;
  return {
    v: 1,
    title: title.slice(0, safeEnd(title, Math.min(title.length, 200))),
    annotations: [
      ...target.rects.map((rect, i) => ({
        id: "region-" + i,
        page: target.page,
        rect,
        kind: "highlight" as const,
        content: "",
      })),
      ...chunks.map((content, i) => ({
        id: "citation-" + i,
        page: target.page,
        rect: target.rects[0],
        kind: "note" as const,
        content,
      })),
      {
        id: "reasoning",
        page: target.page,
        rect: target.rects[0],
        kind: "note",
        content: excerpt,
      },
    ],
  };
}
