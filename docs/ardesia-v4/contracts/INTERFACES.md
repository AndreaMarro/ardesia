# Contratti applicativi — subset e responsabilità

Il JSON Schema allegato fissa le risorse, eventi e output degli adapter. Le interfacce del piano sono **progettuali**: non endpoint esistenti. T02 genera tipi coerenti TS/Python; errori e proprietà mancanti falliscono prima di effetti esterni.

**AuthorizedContext:** user_id verificato dal token, organization_id appartenente alle membership correnti, ruoli/azioni autorizzati, policy_revision; non costruibile da input libero del browser. **ResourceRef:** resource_id, revision_id, organization_id, sha256; il resolver verifica ACL ed esistenza anche se il JSON è valido.

**Command envelope:** command_id/idempotency_key, expected_revision, payload tipizzato; l’actor è aggiunto dal server. **PersistedReceipt:** command_id, result_id, committed_revision, committed_at, status; proviene da transazione conclusa. **Error:** code, message utile, retryable, correlation_id, details sanitizzati; mai stack, secret o informazioni su risorse altrui.

Errori previsti: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, SOURCE_STALE, CAPACITY_FULL, HOLD_EXPIRED, CONFLICT, PAYMENTS_NOT_CONFIGURED, PROVIDER_BUDGET_EXCEEDED, UNSUPPORTED_CAPABILITY, TRANSCRIPTION_NEEDS_REVIEW, STORAGE_UNAVAILABLE. I messaggi possono essere localizzati senza cambiare codice/semantica.

**CourseEdition:** id, org, template_version, tutor assignments, status, capacity (1–10 nel pilot), price/currency, sessions esplicite, offer_version. **SubmissionRevision:** id, assignment_id, author, refs, previous_revision, committed_at. **FeedbackRevision:** id, submission_revision, author_type/author, rubric_version, state, evidence, published_at. **ActivityManifest:** id/version/coursepack, prerequisites, content, model_id/version, input_schema, hint_policy, verification_capabilities, editorial_state. G1 non vende DRAFT come reviewed.

**AdapterResult:** target capability, source ref, preserved, losses, status e receipt; non contiene una dichiarazione autoreferenziale «authorized=true» che sostituisca la policy. L’adapter non serializza token dell’utente dentro l’artefatto.

**MCP manifest:** protocol/sdk version, tool/resource schemas, scopes, effect class (read/preview/commit), idempotence semantics, timeout/async, supported host features. **CalendarIntent:** organization/session refs, target calendar authorized, time instants + IANA zone, external etag, intent hash/expiry. Quattro sessioni generano quattro mapping stabili.

Contratti versionati per evoluzione additive; rimozioni o cambi di semantica richiedono nuova major e adapter di lettura. Non recuperare compatibilità eliminando validazioni esistenti. Migrazioni delle vecchie lezioni sono reversibili o conservano il file originale.

## Contratti del Diario V4 (proposti)
`ErrorObservation` porta `source ResourceVersionRef`, `attemptRevisionId`, `studentId` server-derived, `category`, `verification` e posizione verificata. `DiaryProjection(events, authorizedContext) -> DiaryThread[]` è pura e replay-safe. `attachTransferAttempt` propone un nuovo esercizio distinto, `verifyTransfer` richiede evidenza e policy, `dismissObservation` deve registrare la contestazione senza distruggere l'originale. Un nuovo docente non riceve automaticamente cronologie dell'altra organizzazione. Vedi `specs/13` e `contracts/spec.schema.json` per shape sinteticamente validabili.
