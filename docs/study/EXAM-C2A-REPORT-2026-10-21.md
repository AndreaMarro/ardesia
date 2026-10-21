# C2-A — Correttezza e privacy della revisione

Stato: implementato e verificato localmente; nessun deploy, nessun merge, nessun dato reale.

## Difetti corretti

1. **Review metadata esposta agli studenti.** Le policy `approval_read` e
   `approval_event_read` usavano `can_enter(edition_id)`, quindi un membro
   studente poteva leggere revisore, motivazioni, revoche e audit. La migrazione
   `20261021150000_study_private_approval_review.sql` rende le tabelle
   teacher-only e introduce due proiezioni `SECURITY DEFINER` minime:
   `study_servable_approvals` e `study_revoked_approvals`. Il runtime usa la
   proiezione su PostgreSQL; SQLite mantiene il percorso locale dei test.
2. **Cursore invalidato dopo una decisione.** `pending_questions()` validava
   `after` dopo il filtro `pending`, quindi approvare l'ultimo elemento della
   pagina produceva `invalid_question_cursor`. La validazione ora avviene sul
   set filtrato per soli filtri; la paginazione resta stabile dopo approvazione,
   rifiuto e revoca.
3. **Unità derivate non equivalenti.** `Pa`, `N`, `J`, `W`, `Hz`, `V`, `C`,
   `F`, `S`, `T`, `Wb` sono ora decomposte in firme SI; `kPa`, `km/h`,
   `g/cm^3`, `L` e `dm^3` sono confrontati dimensionalmente. Un numero nudo
   eredita l'unità richiesta dal prompt: `20` con unità `kPa` vale `20000 Pa`,
   mentre `20 Pa` resta `20`.
4. **Input ostili limitati.** Esponenti e magnitudini fuori limite falliscono
   chiusi; non viene usato `eval`; unità sconosciute e temperature affini
   restano rifiutate.
5. **Revisioni >1 non servite silenziosamente.** `_question()` rifiuta con
   `exam_question_version_unsupported` (409) una revisione diversa da 1. Il
   supporto completo a revisioni successive resta fuori da C2-A e va trattato
   in C2-B con un contratto di migrazione esplicito.

## Prove

- Engine: `2571 passed, 26 skipped`.
- Study API: `250 passed`.
- PostgreSQL convergence: `9 passed` su PG 16.15 locale.
- Test mirati: quantità, cursore, RLS e versione inclusi nelle suite.
- La funzione di proiezione restituisce solo
  `approval_id`, `question_id`, `question_version`, `content_sha256`;
  studente e peer non vedono le tabelle base né gli eventi.
- `anon` non può eseguire le funzioni; `ardesia_app` conserva solo i privilegi
  necessari.

## Limiti residui

- Auth GoTrue/PostgREST/Storage/JWT reali: `NOT_RUN`, nessun ambiente
  autorizzato.
- Revisioni >1: rifiuto esplicito, non supporto completo.
- C2-B (review queue docente, separazione scientifico/editoriale) e C2-C
  (analisi dei 56 quesiti) non sono inclusi in questa PR.
- Nessuna verifica su produzione o Supabase live.
