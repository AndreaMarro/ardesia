# CONTRACT S04 — consumer e confini

Base 37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Nuovo endpoint di sola lettura: `GET /study/editions/{editionId}/question-banks/{bankId}/review/quality?scope=quarantined|unverified|all&limit=1..100&after=id`.

Consumer reale: Aula → Revisione scientifica dei quesiti → Qualità della banca → Rivedi → editor Core esistente. L'endpoint usa authenticate, _edition_access(teacher_only=True), bank_access_for_edition e ApprovalGate correnti; il controllo di autorizzazione precede il caricamento. Output: digest banca/audit, conteggi integrali, 4 corsi, baseline200 distinta, issueCounts, pagina di metadati con digest record e 4 dossier privati. Le soluzioni delle proposte sono riservate al docente. Non è un endpoint studente.

401 assenza/revoca sessione;403 studente/altro docente;404 identità banca/edizione non disponibile;409 banca non caricabile;422 cursore non più presente o filtro/limite non valido. Nessuna cache nel browser, DB o ruolo nuovo. I permessi e i numeri di pubblicazione vengono riletti a ogni richiesta. Le note si salvano esclusivamente nel registro di revisione esistente.

Due raccordi necessari: `study_api/app.py` importa l'installer e lo esegue dopo install_question_bank_routes; `components/QuestionBankReview.tsx` inserisce AssessmentQuality nella coda con onSelect=setSelected. Nessun'altra modifica a file condivisi. S10/S00 possono ricollocare l'installer, preservando la prova di autorità-prima-del-caricamento. S02 può revisionare il CSS locale; non vengono cambiati token o shell.

Prove discriminanti: mutare risposta4→5 senza cambiare il residual dichiarato deve produrre answer_mismatch; duplicati rimangono entrambi nel conteggio; unsupported non diventaPASS; studente e altro docente non caricano la banca; revoca dopo accesso valido ritorna401; salto da audit apre lo stesso editor/digest; note PENDING persistono alla riapertura senza pubblicare. Le varianti sono proposte DRAFT separate dal riferimento bancario e conservano digest/versione propri.

Richiesta di review mirata per S10/S00: eseguire test_assessment_quality_http.py e il percorso loopback prima dell'integrazione. Non si richiede né si presume una firma scientifica umana.

S00 checkpoint6405061639: mount QuestionBankReview delegato; installer app.py riservato S10. Il delta condiviso API è quindi ritirato dal diff implementativo e consegnato come api-composition.patch. Harness/test compongono il vero adapter con le vere dipendenze del factory; il prodotto richiede ancora l’applicazione del raccordo da S10/S00.
