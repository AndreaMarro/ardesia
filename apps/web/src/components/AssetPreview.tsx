import { useEffect, useState } from "react";
import { ErrorNotice, Loading } from "./Feedback";
export function AssetPreview({
  id,
  index = 1,
}: {
  id: string;
  index?: number;
}) {
  const [asset, setAsset] = useState<{ url: string; mime: string } | null>(
      null,
    ),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let url: string | undefined;
    void fetch("/study/assets/" + encodeURIComponent(id), {
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        if (active) setAsset({ url, mime: blob.type });
      })
      .catch(() => {
        if (active)
          setError(
            "Originale non disponibile o non condiviso con questo account.",
          );
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  if (error) return <ErrorNotice message={error} />;
  if (!asset) return <Loading>Sto aprendo l’originale {index}…</Loading>;
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
