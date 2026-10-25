import { useState } from "react";
import type { OfferPreview } from "../editionAdmin";
export function EditionOfferPreview({ preview, busy, onConfirm, onClose }: {
  preview: OfferPreview; busy: boolean; onConfirm: () => void; onClose: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const offer = preview.offer;
  const date = new Intl.DateTimeFormat("it-IT", {
    timeZone: offer.timezone, year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "shortOffset",
  });
  return <section className="edition-offer" aria-label="Anteprima dell’offerta">
    <p className="section-meta">Rileggi prima di confermare</p>
    <h3>{offer.title}</h3>
    <p>4 incontri da 90 minuti · massimo {offer.capacity} persone · {(offer.priceMinor / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })} indicativi</p>
    <ol>{offer.sessions.map((session, index) => <li key={index}>
      {date.format(new Date(session.start))} — {date.format(new Date(session.end))}
    </li>)}</ol>
    <p>Orario del corso: {offer.timezone}. Le quattro durate sono verificate dal servizio, anche al cambio d’ora.</p>
    <p className="fine-print">Programma {offer.editorialStatus}. {offer.scope}</p>
    <p className="fine-print">Pack {offer.packId}, versione {offer.packVersion}. Nessun addebito, invito o approvazione scientifica.</p>
    <label className="checkbox-label">
      <input type="checkbox" checked={checked} disabled={busy} onChange={(event) => setChecked(event.target.checked)} />
      Ho riletto le quattro date, i posti e il prezzo indicativo. Confermo questa offerta di test.
    </label>
    <div className="edition-actions">
      <button className="button-primary" disabled={busy || !checked} onClick={onConfirm}>Conferma offerta di test</button>
      <button disabled={busy} onClick={onClose}>Torna alla bozza</button>
    </div>
  </section>;
}
