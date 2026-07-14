---
id: ardesia-telemetry-privacy-contract
status: proposed
freshness: 2026-07-14T23:28:39+02:00
baseline_sha: a7167657ba027e957731775895911d2428036071
authority: design-contract
---

# Ardesia — contratto privacy per Sentry e PostHog

Sentry e PostHog sono assenti dal prodotto al baseline. Questo contratto deve
essere approvato e trasformato in test prima di installare SDK o creare account.
I provider non entrano in `domain`, `kernel` o UI: implementano porte in
`adapters` e possono essere rimossi senza cambiare la semantica del prodotto.

## Porte

```ts
type ReleaseContext = {
  releaseSha: string;
  environment: "development" | "preview" | "beta" | "production";
  surface: "studio" | "api" | "worker";
  schemaVersion: 1;
};

interface ErrorReporterPort {
  capture(error: unknown, context: ReleaseContext & SafeErrorContext): void;
}

interface TelemetryPort {
  capture(event: AllowedEvent): void;
}
```

`SafeErrorContext` e `AllowedEvent` sono unioni chiuse, non dizionari aperti.
L'adapter genera il timestamp tecnico; il chiamante non passa testo libero,
URL, query, oggetti dominio o payload vendor-specifici.

PostHog richiede un `distinct_id` sul wire. È un dettaglio esclusivo
dell'adapter, non un campo di `AllowedEvent`: viene generato con CSPRNG a ogni
sessione dell'app, conservato soltanto in memoria, non deriva da cookie, account,
device o identificatori di dominio e ruota a reload, reset o revoca. Non viene
scritto in receipt o knowledge. L'SDK usa il valore supportato
`person_profiles: "identified_only"`, mentre l'adapter aggiunge
`$process_person_profile: false` a ogni evento e ne verifica la presenza prima
della rete. `identify`, `alias` e group analytics sono vietati. Un identificatore
pseudonimo persistente per uno studio richiede protocollo e consenso separati.

## Dati sempre vietati

- audio, chunk, trascrizioni, prompt, response o embeddings;
- contenuto della lavagna, note, esercizi, answer key o evidenze;
- nome, email, telefono, IP, cookie identificativo o ID esterno;
- URL completo, query string, selector DOM o testo digitato;
- workspace, studente, gruppo, lezione, artefatto o evidence ID grezzo;
- secret, token, header, request/response body o allegati;
- stack local path non redatto in produzione.

Una proprietà sconosciuta fa scartare l'intero evento. Non viene “ripulita” in
modo permissivo.

## Sentry tramite `ErrorReporterPort`

Default obbligatori:

- `sendDefaultPii=false`;
- session replay e screenshot disattivati;
- attachment disattivati;
- `beforeSend` deny-by-default con ricostruzione del payload allowlisted;
- route template, mai URL reale;
- release ed environment uguali al release manifest Git/Vercel;
- source map upload token soltanto in CI secret;
- provider failure non blocca capture, lezione o salvataggio;
- sample rate documentato e modificabile senza cambiare il dominio.

Campi ammessi oltre a `ReleaseContext`: codice errore chiuso, nome del boundary,
operazione chiusa, durability state, connectivity state e durata numerica. Lo
stack è ammesso soltanto dopo redazione e test.

Gate Sentry:

1. adapter spy prova che i dati vietati non escono;
2. corpus avversariale con secret, PII, URL e contenuto didattico;
3. synthetic error su preview verificato per release SHA;
4. ispezione manuale del payload ricevuto;
5. export/delete/retention e DPA approvati prima del beta.

## PostHog tramite `TelemetryPort`

Progetto Ardesia dedicato in regione UE. Default obbligatori:

- opt-out fino a consenso valido;
- autocapture, pageview automatiche e session replay disattivati;
- IP capture disattivata nel progetto e verificata sul payload ricevuto;
- persistenza SDK solo in memoria e `person_profiles: "identified_only"`;
- niente `identify`; ogni evento imposta `$process_person_profile: false`;
- `before_send` valida evento e proprietà contro union chiuse;
- provider failure non cambia stato o command receipt;
- niente feature flag che modifichi autorità, consenso o persistenza.

Eventi ammessi V1:

| Evento | Proprietà aggiuntive ammesse |
|---|---|
| `lesson_started` | `capture_mode` enum |
| `lesson_ended` | `duration_bucket`, `end_reason` enum |
| `durability_degraded` | `durability_state`, `reason_code` enum |
| `proposal_created` | `proposal_type`, `latency_bucket`, `token_bucket`, `cost_bucket` |
| `evidence_opened` | `evidence_kind`, `review_surface` enum |
| `teacher_decision_recorded` | `decision_kind`, `proposal_type` enum |
| `artifact_published` | `artifact_kind`, `reviewed` boolean |
| `next_lesson_resumed` | `continuity_age_bucket`, `open_loop_bucket` |

Ogni evento include soltanto `ReleaseContext`, schema version e proprietà della
riga. Bucket e enum sono definiti nel contratto versionato; non contengono ID,
titoli o testo. Un eventuale study participant ID deve essere pseudonimo,
ruotabile e gestito da un protocollo separato, non da questa V1.

Gate PostHog:

1. test exhaustivo union evento/proprietà;
2. payload avversariali scartati prima della rete;
3. opt-out e revoca provati;
4. ispezione live di un evento sintetico per tipo;
5. prova che il provider non conserva l'IP di trasporto; se il progetto non
   offre un controllo verificabile, l'adapter resta disattivato;
6. retention, export/delete, DPA e accessi al progetto approvati.

## Autorità e operazioni

Sentry osserva errori tecnici; PostHog aggrega uso. Nessuno dei due certifica
che una lezione è avvenuta, che un contenuto è corretto o che uno studente ha
appreso. Metriche di prodotto si riconciliano con receipt deterministiche e
possono divergere senza corrompere il kernel.

Dashboard, alert, sampling, retention, account, secret e destinazioni sono
configurazione operativa con owner e review. Nessun dato reale viene inviato
finché test, threat model, consenso e gate umano non sono verdi.
