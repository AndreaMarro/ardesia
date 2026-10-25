# S04 — candidato implementato, integrazione aperta

**Stato: IMPLEMENTATO / TESTATO PARZIALMENTE; DRAFT_FOR_INTEGRATION, non DONE.**
Base `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`; branch `codex/s04-assessment-quality-20261026`. Nessuna PR precedente aperta per questo filone.

## Risultato raggiungibile

Aula di un'edizione Fisica → Revisione scientifica dei quesiti → Qualità della banca e casi da verificare. Audit integrale, conteggi dei quattro corsi, 23 casi in quarantena senza sottrazione dal totale, filtro dei numerici non verificati, paginazione e apertura dello stesso ReviewEditor. Note e decisioni restano nel ledger canonico; il report è una proiezione ricalcolata.

Quattro dossier originali per MRU, continuità, Ohm e onda: soluzione, unità/dominio, distrattori e problema diverso. 128 valutazioni di seed, 112 combinazioni distinte (20/32/32/28), zero nuovi record della banca e zero attività consegnabili aggiunte. Sono proposte autore DRAFT/humanApproval=false. Digest della proposta distinto dal digest del quesito di riferimento.

Audit 4000/250 famiglie: 495 ricalcoli numerici supportati, 2151 non verificati, 1354 di altro tipo, zero discrepanze nei casi supportati. La scelta della legge fisica e l'allineamento dei parametri al testo richiedono review. La baseline editoriale resta 52/57/33/58, totale 200, delta zero e nessuna nuova accettazione completa.

## Fonti e riuso

PDF MUR 2026/27 scaricato direttamente con TLS, HTTP200, 306024 byte, SHA256 `2650dee32028c3414d67952c4be63db511fa184b10395b921caa9b76adb4c60f`: byte-match con mirror Unicz verificato. Il precedente 403 resta storico. [Ricevuta](source-recheck.json). Lavoro C/DeepSeek e banca originali immutati. [Donor e licenze](DONORS.md): nessuna adozione nuova, asset copiato o inferenza LLM nel runtime.

## Integrazione e autorità

S00 ha delegato esclusivamente import/mount in QuestionBankReview, checkpoint 6405061639. S10 possiede app.py: il delta è solo [patch di composizione](api-composition.patch), non un edit condiviso nel diff. [Contratto](CONTRACT.md) e test usano il vero Core/autenticazione; S10/S00 devono applicare il raccordo perché il consumer di prodotto funzioni. Nessuna migrazione o dipendenza.

Persistenza dove pertinente: le note di revisione usano QuestionBankReview/ApprovalGate. Harness privato su SQLite loopback e Chrome locale; nessuna prova Vercel o backend remoto. Nessun merge/deploy eseguito da S04. RUNLOG/NEXT restano S00; questa consegna è il delta per la memoria comune.

## Prove e residui

[Validazione](VALIDATION.md), [audit e 23 digest](audit-summary.json), test Engine/API/Web e harness browser. Baseline 37 PASS; dominio/API 30 PASS; nuova UI 2 PASS; typecheck/build iniziali PASS. I timeout del revisore e del journey browser restano registrati e richiedono ripetizione nella coda host. CI della head finale da leggere sulla PR; nessun verde trasferito da una SHA diversa.

## Tre batch successivi

1. **P0 integrazione e prova seriale.** S10 applica il raccordo API; S00 integra dopo CI esatta. Ripetere Web6 e browser con riapertura/revoca, poi preview privata pertinente. Accettazione: percorso reale, 401/403, note esatte dopo riavvio, nessuna pubblicazione implicita. Prova: run CI, log browser e SHA/ambiente.
2. **P0 revisione delle 23 quarantene.** Aprire ogni digest, completare spiegazioni e rivedere soluzione/unità/limiti. Dipendenza: versionamento dei record e gate correnti, owner contenuti e revisore umano. Accettazione: nuove versioni con provenienza, denominatore preservato e decisioni umane vere.
3. **P1 controprove e attività.** Affrontare le 2151 risposte non verificate per classe di controllo; parametri strutturati e oracoli distinti con dominio/seed. Collegare le 38 famiglie editoriali e i 200 sotto-obiettivi a consegne Core aperte, grafiche, ordinamento e transfer. Dipendenze: S10/S03/S06, contratto evidenza e approvazione scientifica. Accettazione: negativi, protezione risposte, provenienza e consumer; template/seed non equivalgono ad accettazioni.
