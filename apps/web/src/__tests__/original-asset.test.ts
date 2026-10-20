import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { studyOriginal } from "../../../studio/src/study/apiClient";
import { beginStudySessionCheck } from "../../../studio/src/study/sessionBoundary";
import { decodeOriginalAsset } from "../../../studio/src/study/originalAsset";

const bytes = new TextEncoder().encode("%PDF-original");
const sha = async (data: Uint8Array) =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data as BufferSource)),
    n => n.toString(16).padStart(2, "0")).join("");
async function descriptor() {
  return { id: "asset-a", editionId: "fluidi", kind: "immutable-upload",
    mime: "application/pdf", bytes: bytes.length, sha256: await sha(bytes),
    extractionStatus: "native_text" };
}
async function response(patch: Record<string, unknown> = {}, body: BodyInit = bytes) {
  return new Response(body, { headers: {
    "Content-Type": "application/pdf",
    // Match the Core's JSON header encoding (ensure_ascii=True).
    "X-Study-Asset-Descriptor": JSON.stringify({ ...await descriptor(), ...patch })
      .replace(/[\u007f-\uffff]/g, character => "\\u" + character.charCodeAt(0).toString(16).padStart(4, "0")),
  } });
}
beforeEach(() => beginStudySessionCheck());
afterEach(() => vi.unstubAllGlobals());

test("retains immutable original bytes after validating the authorized descriptor", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => response()));
  const original = await studyOriginal("asset-a");
  expect(original.descriptor).toEqual(await descriptor());
  expect(new Uint8Array(await original.blob.arrayBuffer())).toEqual(bytes);
  expect(original.blob.type).toBe("application/pdf");
});

test.each(["x", "𝑥"])("preserves Core legacy edition identifiers up to 8192 Unicode characters: %s", async character => {
  const editionId = character.repeat(8192);
  vi.stubGlobal("fetch", vi.fn(async () => response({ editionId })));
  expect((await studyOriginal("asset-a")).descriptor.editionId).toBe(editionId);
});

test("cancels the body when the caller has already aborted", async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const controller = new AbortController();
  controller.abort();
  await expect(decodeOriginalAsset(await response({}, stream), "asset-a", controller.signal))
    .rejects.toThrow();
  expect(cancelled).toBe(true);
});

test.each([
  { id: "another-asset" }, { kind: "derived-text" }, { bytes: 0 },
  { bytes: 20 * 1024 * 1024 + 1 }, { bytes: "13" },
  { mime: "text/html" }, { sha256: "not-a-hash" }, { editionId: null },
  { editionId: "x".repeat(8193) },
])("rejects a descriptor outside the original contract: %j", async (patch) => {
  vi.stubGlobal("fetch", vi.fn(async () => response(patch)));
  await expect(studyOriginal("asset-a")).rejects.toThrow("invalid_asset_descriptor");
});

test("rejects corrupted bytes before a renderer can receive them", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => response({ sha256: "0".repeat(64) })));
  await expect(studyOriginal("asset-a")).rejects.toThrow("asset_integrity_failure");
});

test("bounds the actual stream and cancels it without trusting Content-Length", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(8));
      controller.enqueue(new Uint8Array(8));
    },
    cancel() { cancelled = true; },
  });
  vi.stubGlobal("fetch", vi.fn(async () => response({}, stream)));
  await expect(studyOriginal("asset-a")).rejects.toThrow("asset_size_mismatch");
  expect(cancelled).toBe(true);
});

test("rejects truncated bodies", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => response({}, bytes.slice(0, -1))));
  await expect(studyOriginal("asset-a")).rejects.toThrow("asset_size_mismatch");
});

test("does not return a verified original after the session changes during decoding", async () => {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let started!: () => void;
  const opening = new Promise<void>(resolve => { started = resolve; });
  const stream = new ReadableStream<Uint8Array>({
    start(value) { controller = value; },
    pull() { started(); },
  });
  vi.stubGlobal("fetch", vi.fn(async () => response({}, stream)));
  const pending = studyOriginal("asset-a");
  const rejected = expect(pending).rejects.toThrow();
  await opening;
  beginStudySessionCheck();
  // Cancellation may already close this stream. Late bytes cannot restore access.
  try { controller.enqueue(bytes); controller.close(); } catch {}
  await rejected;
});

test("preserves the shared session-rejection boundary before descriptor decoding", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response('{"error":"unauthenticated"}', {
    status: 401, headers: { "X-Study-Session-Rejected": "missing" },
  })));
  await expect(studyOriginal("asset-a")).rejects.toMatchObject({
    message: "unauthenticated", status: 401, sessionRejected: true,
  });
});
