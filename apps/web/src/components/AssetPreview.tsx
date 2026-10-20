import { useEffect, useState } from "react";
import { ErrorNotice, Loading } from "./Feedback";
import { studyOriginal, type VerifiedOriginalAsset } from "../../../studio/src/study/apiClient";
import { studySessionTicket } from "../../../studio/src/study/sessionBoundary";
import { PdfReader } from "../integrations/notebook/PdfReader";

export function AssetPreview({ id, index = 1 }: { id: string; index?: number }) {
  // A changed identity remounts the complete reader before it can expose old state.
  return <OriginalPreview key={id} id={id} index={index} />;
}
function OriginalPreview({ id, index }: { id: string; index: number }) {
  const [asset, setAsset] = useState<{ original: VerifiedOriginalAsset; url: string } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const ticket = studySessionTicket();
    let url: string | undefined;
    setError(""); setAsset(null); setOpen(false);
    const invalidate = () => {
      active = false; controller.abort();
      if (url) { URL.revokeObjectURL(url); url = undefined; }
      setAsset(null); setOpen(false); setError("La sessione è cambiata. Riapri l’originale dal tuo spazio.");
    };
    ticket.signal.addEventListener("abort", invalidate, { once: true });
    void studyOriginal(id, { signal: controller.signal }).then(original => {
      if (!active || ticket.signal.aborted) return;
      url = URL.createObjectURL(original.blob);
      setAsset({ original, url });
    }).catch(() => {
      if (active) setError("Originale non disponibile, non condiviso con questo account o integrità non verificata.");
    });
    return () => {
      active = false; controller.abort();
      ticket.signal.removeEventListener("abort", invalidate);
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, attempt]);
  if (error) return <ErrorNotice message={error} onRetry={() => setAttempt(n => n + 1)} />;
  if (!asset) return <Loading>Sto aprendo l’originale {index}…</Loading>;
  const { mime, sha256 } = asset.original.descriptor;
  return <figure className="asset-preview">
    {mime.startsWith("image/") ? <img src={asset.url} alt={`Originale privato ${index} della consegna`} />
      : mime.startsWith("audio/") ? <audio controls preload="metadata" src={asset.url}>Il browser non supporta questo audio.</audio>
      : mime === "application/pdf" ? <>
        <button onClick={() => setOpen(value => !value)} aria-expanded={open}>
          {open ? "Chiudi il PDF" : "Leggi il PDF"}
        </button>
        {open && <PdfReader original={asset.original} />}
      </> : <p>Anteprima non disponibile per questo formato.</p>}
    <figcaption>
      <span className="asset-identity" title={`SHA-256 ${sha256}`}>Originale {index} · {mime} · integrità verificata</span>
      <a href={asset.url} download={`originale-${id}`}>Scarica il file originale</a>
    </figcaption>
  </figure>;
}
