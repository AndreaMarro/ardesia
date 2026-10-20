/** Binary identity comes from the authorized Core response, never a PDF fingerprint. */
export type OriginalAssetDescriptor = {
  id: string;
  editionId: string;
  kind: "immutable-upload";
  mime: string;
  bytes: number;
  sha256: string;
  extractionStatus: string;
};
export type VerifiedOriginalAsset = {
  descriptor: OriginalAssetDescriptor;
  blob: Blob;
};
const MAX_BYTES = 20 * 1024 * 1024;
const MIME_TYPES = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp",
  "audio/mpeg", "audio/mp4", "audio/webm",
]);
const EXTRACTION_STATES = new Set([
  "native_text", "needs_clarification", "manual_review", "asr_not_run",
]);

function descriptorFrom(response: Response, expectedId: string): OriginalAssetDescriptor {
  let value: unknown;
  try {
    value = JSON.parse(response.headers.get("X-Study-Asset-Descriptor") ?? "");
  } catch {
    throw new Error("invalid_asset_descriptor");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_asset_descriptor");
  const d = value as Record<string, unknown>;
  if (
    d.id !== expectedId || d.kind !== "immutable-upload" ||
    typeof d.editionId !== "string" || !d.editionId || Array.from(d.editionId).length > 8192 ||
    typeof d.mime !== "string" || !MIME_TYPES.has(d.mime) ||
    response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== d.mime ||
    typeof d.bytes !== "number" || !Number.isSafeInteger(d.bytes) ||
    d.bytes < 1 || d.bytes > MAX_BYTES ||
    typeof d.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(d.sha256) ||
    typeof d.extractionStatus !== "string" || !EXTRACTION_STATES.has(d.extractionStatus)
  ) throw new Error("invalid_asset_descriptor");
  return {
    id: expectedId, editionId: d.editionId, kind: "immutable-upload",
    mime: d.mime, bytes: d.bytes, sha256: d.sha256, extractionStatus: d.extractionStatus,
  };
}

export async function decodeOriginalAsset(
  response: Response, expectedId: string, signal: AbortSignal,
): Promise<VerifiedOriginalAsset> {
  let descriptor: OriginalAssetDescriptor;
  try {
    descriptor = descriptorFrom(response, expectedId);
  } catch (error) {
    await response.body?.cancel().catch(() => {});
    throw error;
  }
  if (!response.body) throw new Error("asset_body_unavailable");
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0, completed = false;
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    while (true) {
      signal.throwIfAborted();
      const part = await reader.read();
      signal.throwIfAborted();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_BYTES || size > descriptor.bytes) throw new Error("asset_size_mismatch");
      chunks.push(new Uint8Array(part.value));
    }
    if (size !== descriptor.bytes) throw new Error("asset_size_mismatch");
    const blob = new Blob(chunks, { type: descriptor.mime });
    const bytes = await blob.arrayBuffer();
    signal.throwIfAborted();
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    signal.throwIfAborted();
    const actual = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
    if (actual !== descriptor.sha256) throw new Error("asset_integrity_failure");
    completed = true;
    return { descriptor, blob };
  } finally {
    signal.removeEventListener("abort", abort);
    if (!completed) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
