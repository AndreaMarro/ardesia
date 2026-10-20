/** Presentation boundary for an untrusted, read-only artifact. No ACL or live source lookup. */
export type NotebookSource = {
  id: string;
  revisionId: string;
  contextId: string;
  ownerId: string;
  kind: string;
  visibility: string;
  text: string;
  sha256: string;
};
export type NotebookReference = {
  resourceId: string;
  revisionId: string;
  contextId?: string;
};
type LocalFeedback = { id: string; stale: boolean; review?: { text: string } };
export type NotebookPreview = {
  sources: { source: NotebookSource; current: boolean }[];
  submissions: {
    id: string;
    student_id: string;
    text: string;
    revision: number;
    parent_id: string | null;
    receipt_id: string;
    source_refs: NotebookReference[];
    feedback: LocalFeedback[];
  }[];
  assets: { id: string; mime: string; base64: string; sha256: string }[];
  unavailableResourceRefs: NotebookReference[];
  omissions: string[];
  layoutViews: number;
};
export type NotebookInspection = {
  valid: boolean;
  resources: number;
  resourceRevisions?: number;
  submissions: number;
  canonicalAuthenticity?: string;
  referenceIntegrity?: string;
  referencesComplete?: boolean | null;
  integrityScope?: string;
  referenceIntegrityScope?: string;
};
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
function text(value: unknown, max = 20_000): string {
  if (typeof value !== "string") throw Error("invalid_notebook_presentation");
  // Core budgets count Unicode codepoints. UTF-16 length is a safe O(1) fast
  // path; otherwise count without copying the string, stopping at max + 1.
  if (value.length > max) {
    let remaining = max;
    for (const _codePoint of value) {
      if (--remaining < 0) throw Error("invalid_notebook_presentation");
    }
  }
  return value;
}
function id(value: unknown) {
  const valueText = text(value, 128);
  if (!valueText) throw Error("invalid_notebook_presentation");
  return valueText;
}
function rows(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max)
    throw Error("invalid_notebook_presentation");
  return value;
}
function object(value: unknown): Record<string, unknown> {
  if (!record(value)) throw Error("invalid_notebook_presentation");
  return value;
}
function reference(value: unknown): NotebookReference {
  const r = object(value);
  return {
    resourceId: id(r.resourceId),
    revisionId: id(r.revisionId),
    ...(r.contextId === undefined ? {} : { contextId: id(r.contextId) }),
  };
}
export const notebookSourceKey = (resourceId: string, revisionId: string) =>
  JSON.stringify([resourceId, revisionId]);
export function readNotebookPreview(value: unknown): NotebookPreview {
  const b = object(value);
  if (b.format !== "ardesia-study-notebook-v1" || b.schemaVersion !== 1)
    throw Error("unsupported_notebook");
  const index = new Map<string, { source: NotebookSource; current: boolean }>();
  for (const [input, current] of [
    [rows(b.resources, 100), true],
    [rows(b.resourceRevisions ?? [], 500), false],
  ] as const) {
    for (const raw of input) {
      const r = object(raw);
      const source = {
        id: id(r.id),
        revisionId: id(r.revisionId),
        contextId: id(r.contextId),
        ownerId: id(r.ownerId),
        kind: text(r.kind, 128),
        visibility: text(r.visibility, 128),
        text: text(r.text),
        sha256: text(r.sha256, 64),
      };
      const key = notebookSourceKey(source.id, source.revisionId);
      const previous = index.get(key);
      if (
        previous &&
        JSON.stringify(previous.source) !== JSON.stringify(source)
      )
        throw Error("invalid_notebook_presentation");
      if (!previous) index.set(key, { source, current });
    }
  }
  const submissions = rows(b.submissions, 100).map((raw) => {
    const s = object(raw);
    if (
      typeof s.revision !== "number" ||
      !Number.isInteger(s.revision) ||
      s.revision < 1
    )
      throw Error("invalid_notebook_presentation");
    return {
      id: id(s.id),
      student_id: id(s.student_id),
      text: text(s.text),
      revision: s.revision,
      parent_id: s.parent_id === null ? null : id(s.parent_id),
      receipt_id: id(s.receipt_id),
      source_refs: rows(s.source_refs, 5).map(reference),
      feedback: rows(s.feedback, 100).map((rawFeedback) => {
        const f = object(rawFeedback);
        return {
          id: id(f.id),
          stale: f.stale === true,
          ...(f.review === undefined
            ? {}
            : { review: { text: text(object(f.review).text) } }),
        };
      }),
    };
  });
  for (const submission of submissions)
    for (const ref of submission.source_refs) {
      const source = index.get(
        notebookSourceKey(ref.resourceId, ref.revisionId),
      )?.source;
      if (
        source &&
        ref.contextId !== undefined &&
        ref.contextId !== source.contextId
      )
        throw Error("invalid_notebook_presentation");
    }
  const assets = rows(b.assets, 100).map((raw) => {
    const a = object(raw);
    return {
      id: id(a.id),
      mime: text(a.mime, 128),
      sha256: text(a.sha256, 64),
      base64: text(a.base64, 70 * 1024 * 1024),
    };
  });
  const unavailableResourceRefs = rows(
    b.unavailableResourceRefs ?? [],
    600,
  ).map(reference);
  const omissions = rows(b.omissions ?? [], 1000).map((v) => text(v, 1000));
  return {
    sources: [...index.values()],
    submissions,
    assets,
    unavailableResourceRefs,
    omissions,
    layoutViews: rows(b.layout ?? [], 50).length,
  };
}
