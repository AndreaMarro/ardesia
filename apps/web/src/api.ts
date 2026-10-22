export { studyRequest, requestKey } from "../../studio/src/study/apiClient";
export type {
  StudyMe,
  StudyResource,
  Submission,
} from "../../studio/src/study/contracts";
import type {
  Edition as LegacyEdition,
  Workspace as LegacyWorkspace,
} from "../../studio/src/study/contracts";
export type Edition = LegacyEdition & {
  courseId?: string;
  packId?: string;
  packVersion?: number;
  packSha256?: string;
  title?: string;
  subject?: string;
  duration?: string;
  questionBankIds?: string[];
  entryActivityId?: string | null;
};
export type Workspace = Omit<LegacyWorkspace, "edition"> & {
  edition: Edition;
  layoutSaved: boolean;
  layoutVersion: string;
};

export function dateLabel(instant: string, timezone = "Europe/Rome") {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(instant));
}

export const editionState: Record<string, string> = {
  draft: "Bozza privata",
  collecting: "Raccolta di interesse",
  offered: "Edizione proposta",
  confirmed: "Confermata",
  running: "In corso",
  completed: "Conclusa",
  cancelled: "Annullata",
};
export { StudyApiError } from "../../studio/src/study/apiClient";
export type {
  PostitReference,
  Feedback,
} from "../../studio/src/study/contracts";

export function describeError(
  error: unknown,
  fallback = "L’operazione non è riuscita. Puoi riprovare.",
) {
  const code = error instanceof Error ? error.message : "";
  const messages: Record<string, string> = {
    forbidden: "Questa fonte non è condivisa con il tuo account.",
    unauthenticated: "La sessione è scaduta. Accedi di nuovo.",
    stale_source:
      "La fonte è cambiata. Riapri la revisione prima di continuare.",
    stale_revision:
      "Esiste una revisione più recente. Il tuo testo è ancora qui.",
    idempotency_conflict:
      "Questa richiesta è già associata a dati diversi. Riapri il passaggio prima di inviare.",
    group_full: "Il gruppo è completo. La richiesta è in lista d’attesa.",
    procedure_evidence_required:
      "Seleziona un passaggio effettivo del nuovo procedimento e spiega la verifica.",
    source_check_required:
      "Controlla la fonte della domanda ambigua prima di confermare.",
    distinct_exercise_required:
      "Il nuovo problema deve avere un’identità e parametri diversi.",
    exam_not_ready:
      "La prova non è ancora disponibile: servono tutti i 31 quesiti approvati.",
    exam_unavailable: "Questa edizione non prevede una prova.",
    exam_revision_conflict:
      "Le risposte sono state salvate in un’altra scheda. Ho ricaricato i dati aggiornati.",
  };
  return messages[code] ?? fallback;
}

import type { ContextPacket as LegacyContextPacket } from "../../studio/src/study/contracts";
export type ContextPacket = LegacyContextPacket & {
  sourceState?: "CURRENT" | "HISTORICAL";
};
