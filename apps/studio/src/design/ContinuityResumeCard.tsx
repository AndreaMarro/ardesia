// ARDESIA Studio — ContinuityResumeCard.
//
// Card production che rende ogni stato tipato del loader e del projector
// ARD-06: loading, scope-invalid, empty, ready, missing-evidence, degraded,
// corrupt o recovery. La card non chiama I/O: riceve `state` gia' derivato
// da `loadScopedContinuitySnapshot` + `projectContinuityV1` a monte, o
// `{ kind: "loading" }` prima che il loader completi.
//
// Invarianti visibili (verificati dagli adversarial component tests):
// - stato-specifico role e testo (status vs alert);
// - esattamente un `data-next-action` fuori dallo stato loading;
// - nessun <a> per evidenze non risolte (target === null o status !== "resolved");
// - cause di persistenza distinte e visibili con etichetta dedicata;
// - nessun sentinel corrupt raw (preserved.sha256/bytes NON compaiono nel DOM).
//
// Questa card NON dichiara che la route Room sia raggiungibile: BETA-002
// resta il record causale immutabile di quel requisito bloccato. La
// navigazione verso l'href della nextAction e' delegata al chiamante.

import type {
  ContinuityEvidenceV1,
  ContinuityNextActionV1,
  ContinuityProjectionV1,
  ContinuityScopeErrorCode,
  ContinuitySourceIssueV1,
} from "../lessonos/continuityProjection"

export type ContinuityResumeCardStateV1 =
  | Readonly<{ kind: "loading" }>
  | Readonly<{ kind: "scope-invalid"; code: ContinuityScopeErrorCode }>
  | Readonly<{ kind: "loaded"; projection: ContinuityProjectionV1 }>

export interface ContinuityResumeCardProps {
  readonly state: ContinuityResumeCardStateV1
}

const SCOPE_ERROR_TEXT: Readonly<Record<ContinuityScopeErrorCode, string>> = {
  "invalid-lesson-id": "Identificatore lezione non valido",
  "invalid-room-id": "Identificatore stanza non valido",
  "room-lesson-mismatch": "Stanza e lezione non coincidono",
  "invalid-session-id": "Identificatore sessione non valido",
}

const SOURCE_TEXT: Readonly<Record<ContinuitySourceIssueV1["source"], string>> = {
  session: "Sessione",
  "event-union": "Unione eventi",
  "lesson-event-log": "Event log lezione",
  journal: "Journal live",
  scene: "Scena",
  "plugin-artifact": "Artefatto plugin",
  build: "Provenienza build",
}

const ISSUE_CODE_TEXT: Readonly<Record<ContinuitySourceIssueV1["code"], string>> = {
  unavailable: "Sorgente non raggiungibile",
  "data-loss": "Perdita dati rilevata",
  missing: "Documento assente",
  "invalid-schema": "Contenuto non conforme allo schema",
  "scope-violation": "Fatto fuori dallo scope richiesto",
  "duplicate-event-id": "Identificatori evento duplicati",
  "legacy-recovery-required": "Recovery legacy richiesto",
  "multiple-simulation-instances": "Piu' istanze Simulation nella scena",
  "unsupported-event-contract": "Contratto evento non supportato",
  "digest-mismatch": "Digest producer/build divergente",
  "local-storage-non-authoritative":
    "Workspace su localStorage: cache, non autoritativa",
  "workspace-uninitialised": "Workspace non inizializzato",
  "workspace-factory-rejected": "Factory workspace rifiutata",
  "fsa-handle-lost": "Handle FSA persa dopo l'apertura",
  "read-rejected": "Lettura dei byte rifiutata",
}

const NEXT_ACTION_TEXT: Readonly<Record<ContinuityNextActionV1["kind"], string>> = {
  "recover-continuity": "Ripristina continuita'",
  "fix-simulation-error": "Correggi l'errore Simulation",
  "resume-open-loop": "Riprendi il ciclo aperto",
  "open-current-material": "Apri il materiale corrente",
  "reopen-lesson": "Riapri la lezione",
}

const PHASE_ROLE: Readonly<Record<ContinuityProjectionV1["phase"], "status" | "alert">> = {
  empty: "status",
  ready: "status",
  "missing-evidence": "alert",
  degraded: "status",
  corrupt: "alert",
}

const PHASE_TITLE: Readonly<Record<ContinuityProjectionV1["phase"], string>> = {
  empty: "Nessun fatto da ricomporre",
  ready: "Continuita' pronta",
  "missing-evidence": "Evidenza mancante",
  degraded: "Continuita' degradata",
  corrupt: "Continuita' corrotta",
}

function evidenceHref(evidence: ContinuityEvidenceV1): string | null {
  // Solo evidenze risolte con target verificato ricevono un href visibile.
  if (evidence.status !== "resolved" || evidence.target === null) return null
  return evidence.target.href
}

function EvidenceRow(props: { evidence: ContinuityEvidenceV1 }) {
  const { evidence } = props
  const href = evidenceHref(evidence)
  return (
    <li
      data-continuity-evidence={evidence.occurrenceId}
      data-continuity-evidence-status={evidence.status}
    >
      <span data-continuity-evidence-ref>{evidence.ref}</span>
      {href !== null ? (
        <a data-continuity-evidence-link href={href}>Apri</a>
      ) : (
        <span data-continuity-evidence-blocked>
          {evidence.status === "missing"
            ? "Evidenza dichiarata mancante"
            : "Evidenza da verificare"}
        </span>
      )}
    </li>
  )
}

function IssuesList(props: { issues: readonly ContinuitySourceIssueV1[] }) {
  if (props.issues.length === 0) return null
  return (
    <ul data-continuity-issue-list>
      {props.issues.map((issue, index) => (
        <li
          key={`${issue.source}:${issue.code}:${index}`}
          data-continuity-issue-source={issue.source}
          data-continuity-issue-code={issue.code}
          data-continuity-issue-severity={issue.severity}
        >
          <span data-continuity-issue-source-label>{SOURCE_TEXT[issue.source]}</span>
          <span data-continuity-issue-cause>{ISSUE_CODE_TEXT[issue.code]}</span>
        </li>
      ))}
    </ul>
  )
}

function NextActionButton(props: { action: ContinuityNextActionV1 }) {
  const { action } = props
  return (
    <a
      data-next-action={action.kind}
      data-next-action-priority={String(action.priority)}
      href={action.href}
    >
      {NEXT_ACTION_TEXT[action.kind]}
    </a>
  )
}

function LoadingState() {
  return (
    <section
      className="continuity-resume continuity-resume-loading"
      data-continuity-phase="loading"
      role="status"
      aria-busy="true"
    >
      <p data-continuity-title>Caricamento continuita'…</p>
    </section>
  )
}

function ScopeInvalidState(props: { code: ContinuityScopeErrorCode }) {
  // Anche scope-invalid deve avere UNA azione fuori loading. Il projector
  // non ha girato (nessuno snapshot), quindi sintetizziamo l'azione:
  // reopen-lesson porta la shell alla root (superficie Lezione).
  return (
    <section
      className="continuity-resume continuity-resume-scope-invalid"
      data-continuity-phase="scope-invalid"
      data-continuity-scope-code={props.code}
      role="alert"
    >
      <p data-continuity-title>Contesto continuita' non valido</p>
      <p data-continuity-detail>{SCOPE_ERROR_TEXT[props.code]}</p>
      <a
        data-next-action="reopen-lesson"
        data-next-action-priority="4"
        data-next-action-cause="scope-invalid"
        href={import.meta.env.BASE_URL}
      >
        {NEXT_ACTION_TEXT["reopen-lesson"]}
      </a>
    </section>
  )
}

function LoadedState(props: { projection: ContinuityProjectionV1 }) {
  const { projection } = props
  const role = PHASE_ROLE[projection.phase]
  const title = PHASE_TITLE[projection.phase]
  const missing = projection.missingEvidence
  const openLoop = projection.lastUncorrectedError
  return (
    <section
      className={`continuity-resume continuity-resume-${projection.phase}`}
      data-continuity-phase={projection.phase}
      data-continuity-source-health={projection.sourceHealth.status}
      role={role}
    >
      <header>
        <p data-continuity-title>{title}</p>
        <p data-continuity-lesson>{projection.identity.lessonId}</p>
      </header>
      {projection.sourceHealth.issues.length > 0 && (
        <IssuesList issues={projection.sourceHealth.issues} />
      )}
      {openLoop !== null && (
        <p data-continuity-open-loop={openLoop.errorId}>
          {openLoop.label.it ?? openLoop.errorId}
        </p>
      )}
      {missing.length > 0 && (
        <ul data-continuity-missing-evidence>
          {missing.map((evidence) => (
            <EvidenceRow key={evidence.occurrenceId} evidence={evidence} />
          ))}
        </ul>
      )}
      <NextActionButton action={projection.nextAction} />
    </section>
  )
}

export default function ContinuityResumeCard(props: ContinuityResumeCardProps) {
  const state = props.state
  switch (state.kind) {
    case "loading":
      return <LoadingState />
    case "scope-invalid":
      return <ScopeInvalidState code={state.code} />
    case "loaded":
      return <LoadedState projection={state.projection} />
  }
}
