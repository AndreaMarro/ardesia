# S04 — implementazione e registro
Base: 37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Branch: codex/s04-assessment-quality-20261026.

Obiettivo: audit deterministico dell'intera banca, consumer docente nel revisore esistente, quattro dossier di famiglia con problema diverso e verifiche riproducibili. Nessun nuovo ledger, pubblicazione o approvazione automatica. Denominatore editoriale storico 52/57/33/58 invariato.

Ownership: nuovi moduli in packages/engine/lessonos/study/assessment_quality e apps/web/src/features/assessment-quality; test omologhi e handoffs/swarm-v2/S04. Due collegamenti minimi necessari: installer API in study_api/app.py e pannello in components/QuestionBankReview.tsx. Nessuna PR concorrente al controllo iniziale, nessuna modifica al core dei tentativi o al gate.

- [x] Audit: input record, digest canonico, errori di schema/provenienza/soluzione, duplicati e controprove Fraction limitate senza eval. Unsupported non equivale a PASS; quarantena consultabile senza sottrarre record.
- [x] API docente: autorizzazione e binding edizione/banca esistenti prima del caricamento; report read-only e conteggi di pubblicazione derivati da ApprovalGate.
- [x] UI: apertura esplicita, conteggi per quattro corsi, filtro problemi, salto alla revisione corrente, loading/retry/revoca; nessun salvataggio locale di soluzioni.
- [x] Quattro dossier originali: MRU, continuità, Ohm, lunghezza d'onda; step, distrattori, transfer e prove su seed dichiarati. DRAFT e firma umana assente.
- [x] Test di dominio/API/UI, audit 4000, visuale 390/1440 e percorso HTTP reale con riapertura e revoca.
- [ ] Consegna PR con prove e limiti per S00; integrazione/deploy riservati a S00. READY_FOR_INTEGRATION finché non integrato.

Decisione: i candidati Numbas/STACK/PrairieLearn/Doenet richiedono valutazione separata; il primo consumer è servito dai componenti esistenti. Nessuna nuova dipendenza runtime. La controprova aritmetica distinta dal generatore SymPy non certifica la scelta del modello fisico né l'efficacia didattica.
