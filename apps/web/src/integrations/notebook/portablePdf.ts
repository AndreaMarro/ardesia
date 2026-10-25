import type { NotebookPreview } from "../../../../studio/src/study/notebookPreview";
import type { PdfInput } from "./PdfReader";

/** Verifies only local bytes against the included digest, never their canonical authorship. */
export async function decodePortablePdf(
  asset: NotebookPreview["assets"][number], expectedSha: string, signal: AbortSignal,
): Promise<PdfInput> {
  signal.throwIfAborted();
  if (asset.mime !== "application/pdf" || !/^[a-f0-9]{64}$/.test(expectedSha)
      || asset.sha256 !== expectedSha || !Number.isSafeInteger(asset.bytes)
      || asset.bytes! < 1 || asset.bytes! > 20 * 1024 * 1024
      || asset.base64.length !== 4 * Math.ceil(asset.bytes! / 3)
      || /[^A-Za-z0-9+/=]/.test(asset.base64))
    throw Error("invalid_portable_pdf");
  const decoded = atob(asset.base64);
  if (decoded.length !== asset.bytes) throw Error("invalid_portable_pdf");
  const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  signal.throwIfAborted();
  const actual = Array.from(digest, b => b.toString(16).padStart(2, "0")).join("");
  if (actual !== expectedSha) throw Error("portable_pdf_digest_mismatch");
  return { blob: new Blob([bytes], { type: "application/pdf" }) };
}
