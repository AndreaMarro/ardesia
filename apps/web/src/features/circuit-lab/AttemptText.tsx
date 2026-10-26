/** Read-only presentation of a Core receipt; never grades or recalculates it. */
export function AttemptText({ text, fallback = "" }: { text: string; fallback?: string }) {
  let attempt: { schema?: unknown; prediction?: unknown; notes?: unknown } | null = null;
  try { if (text.length <= 40000) attempt = JSON.parse(text); } catch { /* Ordinary prose keeps its original rendering. */ }
  if (attempt?.schema !== "s19-attempt.v1" || typeof attempt.prediction !== "string" || typeof attempt.notes !== "string")
    return <p className="original-text submission-answer">{text || fallback}</p>;
  return <section aria-label="Tentativo circuito DC">
    <p><strong>Previsione consegnata:</strong> {attempt.prediction || "Non formulata"}</p>
    {attempt.notes && <p className="original-text">{attempt.notes}</p>}
    <p>Il procedimento e il circuito sono nella fonte esatta collegata. Il controllo automatico del modello non certifica l’apprendimento né sostituisce la revisione del docente.</p>
  </section>;
}
