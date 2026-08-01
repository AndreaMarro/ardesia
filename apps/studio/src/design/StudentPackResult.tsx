// Esito della riapertura di uno student pack — UNA sola resa, usata sia da
// chi produce il pack (cruscotto) sia da chi lo riceve (?vista=pack).
//
// Componente puro: riceve gia' il risultato del parse e non sa da dove
// arrivi il file. Non legge event-log, non conosce projection, non ha deps.
// E' questo che permette a chi riceve di avere una porta senza montare la
// macchina di chi produce.

import type { StudentPackParseResult } from "../lessonos/studentPackArtifact"

export type StudentPackResultProps = Readonly<{
  result: StudentPackParseResult | null
}>

export default function StudentPackResult({ result }: StudentPackResultProps) {
  if (result === null) return null

  if (!result.ok) {
    // Fail-closed dichiarato. `data-z7-import-error` e' il gancio storico del
    // cruscotto: resta sullo STESSO elemento del nome neutro, cosi' gli
    // oracoli gia' scritti continuano a misurare questo elemento e non
    // nasce una seconda resa dell'errore.
    return (
      <div
        role="alert"
        data-pack-open-error
        data-z7-import-error
        style={{ fontSize: 13 }}
      >
        Import fallito: {result.error}
      </div>
    )
  }

  return (
    <div
      data-imported-pack
      style={{
        border: "1px solid var(--st-line, #d8d2c6)",
        borderRadius: 8,
        padding: "10px 14px",
        display: "grid",
        gap: 4,
      }}
    >
      <strong>Pack riaperto — {result.artifact.packs.length} elemento/i</strong>
      {result.artifact.packs.map((pack) => (
        <div key={pack.candidateId} data-imported-pack-id={pack.candidateId}>
          <div>{pack.label.it}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            errore: {pack.errorId}
            {pack.fromRoom !== "" ? ` — lezione: ${pack.fromRoom}` : ""}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            evidenze: {pack.evidence.join(", ")}
          </div>
        </div>
      ))}
    </div>
  )
}
