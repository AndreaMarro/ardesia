import { decodePortablePdf } from "../../integrations/notebook/portablePdf";
import { uploadOriginal } from "../../../../studio/src/study/uploadOriginal";
/** Keep large bytes off the JSON command route; preserve its existing body admission limit. */
export async function preparePortableImport(
  value: unknown,
  editionId: string,
  signal: AbortSignal,
): Promise<unknown> {
  if (!value || typeof value !== "object")
    throw Error("invalid_portable_source");
  const bundle = value as {
    format?: string;
    original?: Parameters<typeof decodePortablePdf>[0];
    source?: { document?: { sha256?: string } };
  };
  if (
    bundle.format !== "ardesia-living-source-v1" ||
    !bundle.original ||
    typeof bundle.source?.document?.sha256 !== "string"
  )
    throw Error("invalid_portable_source");
  const { blob } = await decodePortablePdf(
    bundle.original,
    bundle.source.document.sha256,
    signal,
  );
  const asset = await uploadOriginal(
    new File([blob], "originale.pdf", { type: "application/pdf" }),
    editionId,
  );
  signal.throwIfAborted();
  const { base64: _bytes, ...descriptor } = bundle.original;
  return { ...bundle, original: { ...descriptor, assetId: asset.id } };
}
