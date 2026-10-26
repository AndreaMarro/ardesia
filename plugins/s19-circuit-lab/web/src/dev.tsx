// Same-origin specialist entry; transport and session lifecycle are Ardesia's.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  studyRequest,
  studyBlob,
} from "../../../../apps/studio/src/study/apiClient";
import {
  beginStudySessionCheck,
  activateStudySession,
  subscribeStudySessionEnd,
  endStudySession,
  studySessionEpoch,
} from "../../../../apps/studio/src/study/sessionBoundary";
import { CircuitLab } from "./CircuitLab";
import type { Resource, Transport } from "./model";
const request: Transport = async <T,>(
  path: string,
  body?: unknown,
  key?: string,
): Promise<T> => {
  const options = { headers: key ? { "Idempotency-Key": key } : undefined };
  if (path.includes("/export/"))
    return (await (
      await studyBlob(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...options.headers },
        body: JSON.stringify(body),
      })
    ).text()) as T;
  return studyRequest<T>(path, body, options);
};
function Entry() {
  const [ready, setReady] = useState(false),
    [edition, setEdition] = useState(
      new URLSearchParams(location.search).get("edition") ?? "",
    ),
    [error, setError] = useState(""),
    [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [initialResource] = useState(
    new URLSearchParams(location.search).get("resource") ?? undefined,
  );
  useEffect(() => {
    let active = true;
    let actor = "";
    const epoch = beginStudySessionCheck();
    const ended = () => {
      setReady(false);
      setError("La sessione è scaduta. Accedi dal tuo spazio Ardesia.");
    };
    const unsubscribe = subscribeStudySessionEnd(ended);
    void studyRequest<{ id: string }>("/me")
      .then((me) => {
        if (!active || !activateStudySession(epoch)) return null;
        actor = me.id;
        return studyRequest<{
          items: { id: string; title: string; packId: string }[];
        }>("/editions");
      })
      .then((v) => {
        if (!active || !v) return;
        setItems(v.items.filter((x) => x.packId === "s19-circuit-dc-v1"));
        setReady(true);
      })
      .catch((e) => {
        if (active)
          setError(
            (e as Error).message === "unauthenticated"
              ? "Accedi dal tuo spazio Ardesia per aprire questa attività."
              : "Il servizio Ardesia non è disponibile. Puoi riprovare ricaricando.",
          );
      });
    const recheck = () => {
      if (!actor || document.visibilityState === "hidden") return;
      void studyRequest<{ id: string }>("/me")
        .then((me) => {
          if (active && me.id !== actor)
            endStudySession("logout", studySessionEpoch());
        })
        .catch(() => {});
    };
    addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      active = false;
      unsubscribe();
      removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, []);
  if (!ready || !edition)
    return (
      <main className="s19">
        <a className="wordmark" href="/?view=courses">
          ardesia.
        </a>
        <h1>Laboratorio circuiti DC</h1>
        {error ? (
          <p role="alert">{error}</p>
        ) : ready ? (
          <>
            <p>Scegli una delle tue edizioni di elettrotecnica.</p>
            {items.length ? (
              items.map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    const url = new URL(location.href);
                    url.searchParams.set("edition", x.id);
                    history.replaceState(null, "", url);
                    setEdition(x.id);
                  }}
                >
                  {x.title}
                </button>
              ))
            ) : (
              <p>Nessuna edizione assegnata a questo laboratorio.</p>
            )}
          </>
        ) : (
          <p>Verifica dello spazio Ardesia…</p>
        )}
      </main>
    );
  const onResource = (r: Resource) => {
    const url = new URL(location.href);
    url.searchParams.set("resource", r.id);
    history.replaceState(null, "", url);
  };
  return (
    <CircuitLab
      key={edition}
      editionId={edition}
      request={request}
      resourceId={initialResource}
      onResource={onResource}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Entry />);
