import { useEffect, useState } from "react";
import { studyRequest, type StudyMe } from "../../api";
import { studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { LivingSourceReader } from "./LivingSourceReader";
import type { LivingReference } from "./model";
/** Consumer adapter resolves the authenticated actor; resource ownership is never a session identity. */
export function LivingSourceReference({
  reference,
  kind,
}: {
  reference: LivingReference;
  kind: "living-source" | "living-annotation";
}) {
  const [me, setMe] = useState<StudyMe | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const ac = new AbortController(),
      ticket = studySessionTicket();
    const revoke = () => {
      ac.abort();
      setMe(null);
      setError("La sessione è cambiata.");
    };
    ticket.signal.addEventListener("abort", revoke, { once: true });
    void studyRequest<StudyMe>("/me", undefined, { signal: ac.signal })
      .then((v) => {
        if (!ac.signal.aborted) setMe(v);
      })
      .catch(() => {
        if (!ac.signal.aborted) setError("La sessione non è disponibile.");
      });
    return () => {
      ac.abort();
      ticket.signal.removeEventListener("abort", revoke);
    };
  }, []);
  return me ? (
    <LivingSourceReader reference={reference} kind={kind} me={me} />
  ) : (
    <p role="status">{error || "Verifica della sessione…"}</p>
  );
}
