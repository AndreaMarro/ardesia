import type { ActivityEvidence } from "./experienceTypes";
import { LessonPassageRecovery } from "./LessonPassage";

export function PredictionEvidence({value}: {value?: ActivityEvidence}) {
  if (!value) return null;
  return <section className="prediction-evidence" aria-label="Evidenza della previsione">
    <h3>Previsione prima del risultato</h3>
    <p>Rapporto previsto: <strong>{value.prediction.ratio.toLocaleString("it-IT")}</strong>. Vincolo indicato: {value.prediction.fixedQuantity === "flow" ? "portata Q" : "differenza di pressione Δp"}.</p>
    <p>{value.assistance === "SUPPORT_REQUESTED" ? "Aiuto richiesto prima della risposta" : "Nessun aiuto richiesto prima della risposta"}
      {value.supportUsed.length ? `: ${value.supportUsed.map(id => ({"constraint-hint": "richiamo del vincolo", "lesson-passage": "passaggio della lezione", "model-result": "risultato già visto"})[id] ?? id).join(", ")}.` : "."}</p>
    <p>Controllo numerico: {value.check.ratioMatches ? "rapporto coerente" : "rapporto da rivedere"}; {value.check.constraintMatches ? "vincolo coerente" : "vincolo da rivedere"}.</p>
    <p className="fine-print">Il servizio controlla il modello; il docente verifica il ragionamento. Gli aiuti esterni non sono osservati. {value.stepId === "transfer" ? "Problema diverso dell’episodio; la verifica nel diario richiede l’assegnazione e il gesto del tutor." : ""}</p>
    {value.lessonPassageRef && <details><summary>Riapri il passaggio collegato alla previsione</summary>
      <LessonPassageRecovery reference={value.lessonPassageRef} />
    </details>}
  </section>;
}
