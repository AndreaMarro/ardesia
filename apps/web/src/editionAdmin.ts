import { requestKey } from "./api";
import type { Edition } from "./api";
export type SessionStart = { localStart: string; occurrence?: "earlier" | "later" };
export type AdminEdition = Edition & {
  managementRevision: number;
  starts: SessionStart[];
  paymentMode: "test";
  scientificApproval: "NOT_ATTESTED";
  legacyUnversionedOffer: boolean;
};
export type PackOption = {
  packId: string;
  packVersion: number;
  packSha256: string;
  title: string;
  editorialStatus: string;
  scope: string;
};
export type OfferPreview = {
  previewId: string;
  previewHash: string;
  expectedRevision: number;
  expiresAt: number;
  offer: AdminEdition & { editorialStatus: string; scope: string };
};
export function commandKey(cache: { body: string; key: string }, body: unknown) {
  const encoded = JSON.stringify(body);
  if (encoded !== cache.body) {
    cache.body = encoded;
    cache.key = requestKey();
  }
  return cache.key;
}
export function managementError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const messages: Record<string, string> = {
    ambiguous_calendar_time: "Questo orario si ripete al cambio d’ora. Scegli la prima o la seconda occorrenza per l’incontro interessato.",
    invalid_calendar: "Una data non è valida oppure l’orario non esiste al cambio d’ora. Controlla i quattro incontri.",
    four_sessions_required: "Completa tutti e quattro gli incontri.",
    calendar_conflict: "Un incontro si sovrappone a un’altra data del tuo calendario. Le date non sono state cambiate.",
    reconfirmation_required: "Ci sono partecipanti o riserve attive. Le condizioni restano ferme: serve un percorso di riconferma, ancora non disponibile qui.",
    stale_edition: "L’edizione è cambiata in un’altra scheda. Rileggi le condizioni prima di salvare o confermare; i tuoi campi restano qui.",
    offer_preview_expired: "L’anteprima è scaduta. Richiedine una nuova prima di confermare.",
    unauthenticated: "La sessione è scaduta. Accedi di nuovo.",
    forbidden: "Questa edizione non è gestibile dal tuo account.",
    database_schema_not_ready: "Il servizio richiede un aggiornamento. La bozza resta in preparazione.",
    newer_schema: "Il servizio richiede un aggiornamento. Nessuna modifica è stata applicata.",
    idempotency_conflict: "La richiesta è associata ad altri dati. Rileggi l’edizione prima di riprovare.",
  };
  return { code, message: messages[code] ?? "Operazione non completata. I dati del modulo restano qui: puoi riprovare." };
}
