// La porta di chi RICEVE uno student pack (?vista=pack).
//
// Il pack era gia' un file scaricabile, ma l'unico posto dove si riapriva era
// il cruscotto di chi lo produce: chi lo riceveva — chi impara, da solo o in
// classe — aveva un file e nessuna superficie. Qui il file basta.
//
// Superficie deliberatamente minima e senza deps: nessun event-log, nessuna
// projection, nessun ruolo da assumere. Chi apre questa pagina ha un JSON e
// vuole vedere cosa dice.

import { useState } from "react"
import StudentPackResult from "./StudentPackResult"
import {
  parseStudentPackArtifact,
  type StudentPackParseResult,
} from "../lessonos/studentPackArtifact"

export default function StudentPackView() {
  const [result, setResult] = useState<StudentPackParseResult | null>(null)

  const onOpenFile = async (file: File) => {
    setResult(parseStudentPackArtifact(await file.text()))
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header
        className="st-bar"
        style={{
          height: "auto",
          minHeight: 52,
          flex: "0 0 auto",
          flexWrap: "wrap",
          rowGap: 6,
          paddingTop: 6,
          paddingBottom: 6,
          overflow: "visible",
        }}
      >
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name" style={{ flex: "1 1 160px", minWidth: 0, maxWidth: 360 }}>
          <span className="st-name-text">Il pack che hai ricevuto</span>
        </span>
      </header>

      <main style={{ flex: "1 1 auto", overflowY: "auto", padding: "18px 20px" }}>
        <section style={{ maxWidth: 720, display: "grid", gap: 12 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>Apri il pack che hai ricevuto</h1>
          <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>
            Scegli il file <code>studentpack-….json</code> che ti e' stato consegnato. Si
            apre qui, sul tuo dispositivo: non serve una lezione aperta ne' il cruscotto
            di chi lo ha prodotto.
          </p>

          <label style={{ fontSize: 13, display: "grid", gap: 6 }}>
            <span>File del pack (JSON):</span>
            <input
              type="file"
              accept="application/json"
              data-pack-open
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file !== undefined) void onOpenFile(file)
              }}
            />
          </label>

          <StudentPackResult result={result} />
        </section>
      </main>
    </div>
  )
}
