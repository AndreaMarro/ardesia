import { useEffect, useState } from "react";
import { ErrorNotice, Loading } from "./Feedback";
import { studyBlob } from "../../../studio/src/study/apiClient";
export function AssetPreview({
  id,
  index = 1,
}: {
  id: string;
  index?: number;
}) {
  const [asset, setAsset] = useState<{ id: string; url: string; mime: string } | null>(
      null,
    ),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    let url: string | undefined;
    setError("");
    setAsset(null);
    void studyBlob("/assets/" + encodeURIComponent(id), { signal: controller.signal })
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setAsset({ id, url, mime: blob.type });
      })
      .catch(() => {
        if (active)
          setError(
            "Originale non disponibile o non condiviso con questo account.",
          );
      });
    return () => {
      active = false;
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  if (error) return <ErrorNotice message={error} />;
  if (!asset || asset.id !== id) return <Loading>Sto aprendo l’originale {index}…</Loading>;
  return (
    <figure className="asset-preview">
      {asset.mime.startsWith("image/") ? (
        <img
          src={asset.url}
          alt={`Originale privato ${index} della consegna`}
        />
      ) : asset.mime.startsWith("audio/") ? (
        <audio controls preload="metadata" src={asset.url}>
          Il browser non supporta questo audio.
        </audio>
      ) : asset.mime === "application/pdf" ? (
        <iframe src={asset.url} title={`PDF originale ${index}`} />
      ) : (
        <p>Anteprima non disponibile per questo formato.</p>
      )}
      <figcaption>
        Originale {index} · {asset.mime}
        <a href={asset.url} download={`originale-${id}`}>
          Scarica il file originale
        </a>
      </figcaption>
    </figure>
  );
}
