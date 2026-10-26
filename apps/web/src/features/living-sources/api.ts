import {
  studyBlob,
  studyRequest,
} from "../../../../studio/src/study/apiClient";
import type { LivingReference } from "./model";
import {
  decodeAnnotation,
  COORDINATES,
  type LivingSource,
  type AnnotationResource,
  type LivingAnnotation,
} from "./model";
export const sourcePath = (r: LivingReference) =>
  `/living-sources/${encodeURIComponent(r.resourceId)}/revisions/${encodeURIComponent(r.revisionId)}`;
export async function loadSource(
  r: LivingReference,
  signal: AbortSignal,
): Promise<{ source: LivingSource; blob: Blob }> {
  const source = await studyRequest<LivingSource>(sourcePath(r), undefined, {
    signal,
  });
  if (
    source.id !== r.resourceId ||
    source.revisionId !== r.revisionId ||
    (r.contextId !== undefined && source.contextId !== r.contextId) ||
    source.kind !== "living-source" ||
    source.document?.coordinates !== COORDINATES ||
    !/^[a-f0-9]{64}$/.test(source.document.sha256)
  )
    throw Error("source_identity_mismatch");
  const blob = await studyBlob(sourcePath(r) + "/original", { signal });
  if (blob.size < 1 || blob.size > 20 * 1024 * 1024)
    throw Error("source_original_mismatch");
  const hash = Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
  signal.throwIfAborted();
  if (hash !== source.document.sha256 || blob.type !== "application/pdf")
    throw Error("source_original_mismatch");
  return { source, blob };
}
export async function loadAnnotation(
  r: LivingReference,
  signal: AbortSignal,
): Promise<AnnotationResource> {
  const value = await studyRequest<AnnotationResource>(
    `/living-annotations/${encodeURIComponent(r.resourceId)}/revisions/${encodeURIComponent(r.revisionId)}`,
    undefined,
    { signal },
  );
  if (
    value.id !== r.resourceId ||
    value.revisionId !== r.revisionId ||
    (r.contextId !== undefined && value.contextId !== r.contextId) ||
    value.kind !== "living-annotation"
  )
    throw Error("annotation_identity_mismatch");
  decodeAnnotation(value.annotation);
  return value;
}
export const saveAnnotation = (
  editionId: string,
  annotation: LivingAnnotation,
  visibility: "group" | "private",
  key: string,
  existing?: AnnotationResource,
  signal?: AbortSignal,
) =>
  studyRequest<AnnotationResource>(
    existing
      ? `/living-annotations/${encodeURIComponent(existing.id)}/revisions`
      : "/living-annotations",
    {
      editionId,
      annotation,
      visibility,
      ...(existing ? { expectedRevision: existing.revisionId } : {}),
    },
    { headers: { "Idempotency-Key": key }, signal },
  );
