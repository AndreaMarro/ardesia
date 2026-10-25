import { useRef, useState } from "react";
import { requestKey, studyRequest } from "./apiClient";
import type { Edition } from "./contracts";
export function GroupEditionView({
  edition,
  teacher,
  enrolled,
  onUpdate,
}: {
  edition: Edition;
  teacher: boolean;
  enrolled: boolean;
  onUpdate: () => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const holdKey = useRef(requestKey());
  const confirmKey = useRef(requestKey());
  async function join() {
    setBusy(true);
    setMessage("");
    try {
      const hold = await studyRequest<{ id: string; state: string }>(
        `/editions/${edition.id}/holds`,
        {},
        { headers: { "Idempotency-Key": holdKey.current } },
      );
      if (hold.state !== "confirmed") {
        const result = await studyRequest<{ state: string }>(
          `/holds/${hold.id}/confirm`,
          {},
          { headers: { "Idempotency-Key": confirmKey.current } },
        );
        if (result.state !== "confirmed") {
          setMessage(
            "Questa riserva richiede una nuova accettazione delle condizioni. Rileggi le quattro date e riprova.",
          );
          holdKey.current = requestKey();
          confirmKey.current = requestKey();
          return;
        }
      }
      setMessage("Iscrizione di test confermata.");
      await onUpdate();
    } catch (error) {
      setMessage(
        error instanceof Error && error.message === "group_full"
          ? "Gruppo completo: sei in lista d’attesa."
          : "Iscrizione non confermata. Riprova.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="study-group">
      <h2>Il gruppo dell’edizione</h2>
      <p>
        Massimo {edition.capacity} ·{" "}
        {(edition.priceMinor / 100).toLocaleString("it-IT", {
          style: "currency",
          currency: "EUR",
        })}{" "}
        indicativi · Nessun addebito
      </p>
      <p>
        Stato:{" "}
        {edition.state === "offered"
          ? "offerta di test confermata"
          : edition.state === "draft" ? "bozza privata" : "in raccolta"}
      </p>
      <ul>
        {edition.sessions.map((session) => (
          <li key={session.start}>
            {new Date(session.start).toLocaleString("it-IT", {
              timeZone: edition.timezone,
            })}{" "}
            ·{" "}
            {Math.round(
              (new Date(session.end).getTime() -
                new Date(session.start).getTime()) /
                60000,
            )}{" "}
            minuti
          </li>
        ))}
      </ul>
      {teacher ? (
        <p>Prepara e conferma l’offerta nell’area Mini-corsi.</p>
      ) : !enrolled ? (
        <button
          className="study-primary"
          onClick={() => void join()}
          disabled={busy || edition.state !== "offered"}
        >
          {edition.state === "offered" ? "Conferma partecipazione di test" : "Offerta in preparazione"}
        </button>
      ) : (
        <p>Iscrizione di test confermata.</p>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
