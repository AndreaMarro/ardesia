import type { LivingReference, LivingAnnotation } from "./model";
/** Same-origin navigation only. The URL is an index claim; Core resolves every opening. */
export function livingSourceLink(
  ref: LivingReference,
  kind: "living-source" | "living-annotation",
  editionId: string,
  lesson?: LivingAnnotation["lesson"],
): string {
  const query = new URLSearchParams({
    view: "materials",
    edition: editionId,
    living: JSON.stringify({
      resourceId: ref.resourceId,
      revisionId: ref.revisionId,
      kind,
      ...(ref.contextId ? { contextId: ref.contextId } : {}),
      ...(lesson ? { lesson } : {}),
    }),
  });
  return "/?" + query;
}
export function readLivingRoute(search: string): {
  ref: LivingReference;
  kind: "living-source" | "living-annotation";
  lesson?: LivingAnnotation["lesson"];
} | null {
  const raw = new URLSearchParams(search).get("living");
  if (!raw || raw.length > 2048) return null;
  try {
    const value = JSON.parse(raw);
    if (
      !value ||
      typeof value.resourceId !== "string" ||
      typeof value.revisionId !== "string" ||
      !["living-source", "living-annotation"].includes(value.kind) ||
      value.resourceId.length > 128 ||
      value.revisionId.length > 128
    )
      return null;
    const ref: LivingReference = {
      resourceId: value.resourceId,
      revisionId: value.revisionId,
    };
    if (typeof value.contextId === "string") ref.contextId = value.contextId;
    const lesson =
      value.lesson &&
      typeof value.lesson.lessonId === "string" &&
      typeof value.lesson.activityId === "string"
        ? {
            lessonId: value.lesson.lessonId,
            activityId: value.lesson.activityId,
          }
        : undefined;
    return { ref, kind: value.kind, lesson };
  } catch {
    return null;
  }
}

/** Preserve shell/edition/history state; only this feature's exact-reference query changes. */
export function livingSourceLocation(
  currentUrl: string,
  ref: LivingReference,
  kind: "living-source" | "living-annotation",
  lesson?: LivingAnnotation["lesson"],
): string {
  const url = new URL(currentUrl);
  url.searchParams.set(
    "living",
    JSON.stringify({ ...ref, kind, ...(lesson ? { lesson } : {}) }),
  );
  return url.href;
}
