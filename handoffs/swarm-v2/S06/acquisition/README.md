# S06 — acquisizione scheduler, addendum del 26 ottobre 2026

Questo è il secondo incremento della stessa PR309. Non sostituisce il primo handoff, i suoi FAIL/PASS o la decisione REUSE precedente. Base di lavoro `ff38400012594ab2fad16d4721305e50532ae31a`; stato della nuova integrazione: candidato nel namespace S06, non DONE o distribuito. S00 mantiene composizione, merge e release; gli hook Web/API sono già concreti in INTEGRATION.md e api-composition.patch.

## Capacità acquisita e confronto

Riletto `registry/TARGETS.json`, schema ardesia.research-targets/3, 139 target. TARGET-047 Numbas e TARGET-109 Doenet rimangono riferimenti assessment; nessuno scheduler FSRS/SM2 era presente alla lettura. Nessun identificatore esistente modificato. Proposta di delta separata in registry-proposal.json, da riconciliare con S12/S15 prima dell'assegnazione di nuovi ID.

| Candidato verificato | Pin immutabile | Diritti e dipendenze | Decisione |
| --- | --- | --- | --- |
| [py-fsrs v6.3.2](https://github.com/open-spaced-repetition/py-fsrs/tree/9446cb06605c597a063aeee49f7d188d42e34dc2) | 9446cb06605c597a063aeee49f7d188d42e34dc2 | MIT; Python>=3.10, typing-extensions; optimizer opzionale con torch/numpy/pandas/tqdm | ADAPT del sottosistema completo scheduler/card/state/rating/review-log e serializzazione/replay. Python nativo coerente col Core. |
| [ts-fsrs v5.4.2](https://github.com/open-spaced-repetition/ts-fsrs/tree/bb71e35a2f5af5a5ac6cce9ef7c41ad24855721d) | bb71e35a2f5af5a5ac6cce9ef7c41ad24855721d; tag annotato b7565428f035b824affc3b400980055399890c75 | MIT; engines Node>=20 al tag, compatibile con i Node22/26 della pipeline | DEFER: introdurrebbe un runtime JS nel servizio Python o autorità di scheduling nel client. Nessun motivo per duplicare il motore adottato. |
| [SuperMemo2 v3.0.1](https://github.com/alankan886/SuperMemo2/tree/0aaf428cf362b976f49a2dece5e01211785caec2) | 0aaf428cf362b976f49a2dece5e01211785caec2 | MIT, runtime attrs; repository archiviato il 26 giugno 2026 | DEFER: Python pertinente, ma progetto archiviato e dipendenza aggiuntiva evitabile rispetto al donor mantenuto. |

Correzione datata al REUSE.md originario: quel documento osservava il README corrente v6 di ts-fsrs, non un pin adottato. La stabile v5.4.2 verificata qui richiede Node>=20. Non si deduce incompatibilità di ts-fsrs con la pipeline. Numbas/Doenet non vengono acquisiti da S06 né sostituiscono il submit canonico; restano confronto storico e competenza assessment S04.

Consultazione S12/S15 effettiva via rendezvous GitHub306: [checkpoint](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405629157), [contratto e slot](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405823739). Non è un'approvazione ricevuta o un adempimento dell'integrazione S00.

## REA evidence e limiti

REA `capture_process_scenario` eseguito sul Python locale con il codice acquisito: Evidence `ev_729d2036324c4a76d331950ebeead6d8f089bf6af4c39a345b4e7bc823623bd5`, provider rea-process/version3, exit0. Evidenza completa in rea/process-capture.json, probe riproducibile e risultato separati. Osservati quattro rating, card JSON roundtrip, input preview immutato, replay esatto di tre review, rifiuto datetime senza timezone. Nessun network o optimizer nello scenario. Primo card: Again60s, Hard330s, Good600s, Easy8giorni con policy deterministica adottata.

Questa è osservazione di un processo nostro sul donor sorgente, non decompilazione di un servizio, test con studenti o prova del consumer distribuito. Limiti del provider preservati: identità artefatto non disponibile per questa osservazione; digest eseguibile prelaunch non legato atomicamente all'OS; sampling può perdere discendenti brevi; filesystem before/after non è traccia syscall; ambiente ereditato non registrato. Il comportamento del consumer si verifica separatamente via Core/HTTP/browser.

## Codice riutilizzato e manutenzione

Cinque moduli upstream, circa38.6KB sorgenti, con LICENSE MIT verbatim, NOTICE e PROVENANCE.json sotto `packages/engine/lessonos/study/independent_study/vendor/pyfsrs`. Algoritmi e pesi numerici originali immutati. Sole trasformazioni ai moduli: import relativi e `typing.Self` stdlib al posto di `typing_extensions.Self`, compatibile col requisito Ardesia Python>=3.12. Entry point limitato al sottosistema acquisito. Nessuna nuova dipendenza runtime/manifest/lock. Optimizer/training, dipendenze pesanti opzionali, CSV di review reali e asset/logo non acquisiti.

Riutilizzati41 contratti completi di tests/test_basic.py con soli import adattati. Il 42esimo test relativo al lazy loader Optimizer è escluso esplicitamente: capacità non acquisita, non un test indebolito o dichiarato PASS. Hash originali/adattati in PROVENANCE.json. Non vengono rieseguiti setup.py o comandi manutentivi del donor.

Owner manutenzione S06: aggiornare pin e policy solo con contratti upstream, regressioni Core/HTTP/UI e scenari di riapertura/revoca. Versione/hash policy persistiti per ogni card. Rollback mediante rimozione dei soli hook; nessuna risorsa o ricevuta cancellata. Versioni sconosciute falliscono esplicitamente: nessun reset silenzioso della cronologia.

## Funzioni originali e consumer

Adattatore first-party review_scheduler.py: preview dei quattro rating; scelta esplicita e annullamento; checkpoint limitato del card precedente, senza crescita ricorsiva; ID pseudonimo derivato dalla risorsa; tempi UTC del server; rifiuto di clock regredito. Policy `enable_fuzzing=False`, `maximum_interval=365`; learning steps1m/10m e pesi generali upstream invariati. Retention0.9 è un parametro del modello, non una garanzia didattica o calibrazione personale.

I comandi `rate`/`undo-rating` usano gli stessi lock/CAS, revisioni, eventi e ricevute idempotenti delle altre azioni S06. Nessuna tabella, migrazione, auth, ledger o provider aggiuntivo. Nessun card/peso accettato dal client. Solo l'autovalutazione esplicita aggiorna il card: correttezza numerica e assenza di indizi non diventano rating FSRS. Le durate non vengono misurate. Tentativi, fonti e assistenza restano invariati; eventuali aiuti esterni UNKNOWN e mastery NOT_INFERRED.

Nel consumer IndependentStudy, schermata Riprendi nel tempo, quattro pulsanti accessibili mostrano la data/ora proposta in Europe/Rome. Dopo la scelta appare l'annullamento. L'override personale1/3/7/14giorni rimane distinto da un nuovo ripasso e non altera il card FSRS. Dopo ogni azione il client rilegge la revisione Core corrente per evitare di presentare una risposta idempotente storica come stato attuale. Errore422 rimane errore di input. Il fallback precedente1/3giorni rimane proposta provvisoria finché lo studente non sceglie una valutazione; nessun rating automatico alla conclusione.

## Prove e stato di integrazione

Vedere il registro datato EVIDENCE.md per comandi, FAIL conservati, PASS e commit esatti. Non trasferire il verde del primo batch o del donor a questo incremento. TestClient esercita HTTP/Auth/SQLite veri nella composizione isolata; browser esercita UI/API vere in loopback con identità sintetiche. Gli hook shared non sono stati modificati da S06. Una demo locale e una CI di ramo non equivalgono a consumer integrato in main o disponibile in produzione.

Risultato concreto nel consumer composto: lo studente può dichiarare come ha ricordato, vedere e modificare il prossimo ripasso, annullare una scelta e ritrovare piano/fonti/ricevute dopo riapertura, mantenendo gli aiuti osservati. Materiali ancora DRAFT e limitati ai sei esempi registrati; nessuna approvazione scientifica, corso completo o efficacia con studenti attestata.

Debito residuo: composizione RootApp/API da S00/S10, integrazione GitHub e verifica sul commit risultante, distribuzione appropriata; ActivityEvidence lessonRef/fase tipizzato resta S10 con ponte sourceRefs già esplicito. PostgreSQL/RLS, device fisici/Safari e calibrazione su popolazioni reali NON_RUN. Prossimo candidato di alto valore: TARGET-047 Numbas per item parametrizzati con owner S04, dopo contratto che preservi consegne/receipts canoniche; S06 riusa quel consumer invece di introdurre un secondo motore quiz.
