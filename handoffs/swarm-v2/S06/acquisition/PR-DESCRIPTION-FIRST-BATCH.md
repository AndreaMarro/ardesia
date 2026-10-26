Lo studente può seguire i cinque esempi Fisica già consentiti e il modulo Taylor già registrato senza tutor online o provider AI: obiettivo, diagnostica, spiegazione, modello Core parametrico, tentativo con ricevuta, feedback/indizi, recupero della fonte, problema diverso e ripasso modificabile.

Navigazione e fonti usano risorse/revisioni Core; la consegna è canonica. Prepare/submit/confirm recupera l'invio con payload byte-esatto e stessa ricevuta. Il feedback precedente conta come assistenza per le prove successive; aiuti esterni restano UNKNOWN. Nessun voto o mastery inferiti. La copia locale è opt-in, distinta dalla consegna, cancellabile anche per vecchie revisioni e rimossa alla revoca.

**Verifiche effettive**
- 20 test dominio +1 HTTP PASS su SQLite/Auth reali; 7 Web PASS; typecheck locale exit0.
- Workflow HTTP aggiuntivo su6lezioni/4packFisica+Taylor:12tentativi, retry stessa ricevuta e nuove sessioni cookie con fonte esatta, tutti PASS.
- Browser Chromium14checkPASS del flusso completo, errore/hint/transfer/ripasso, reload con confronto nascosto, offline/reconnect, secondo browser e revoca. Altri3checkPASS: Tab al procedimento, tap dell'indizio e390px senzaoverflow. Screenshot1440/390 ispezionati; zero errori inattesi, distacco rete e401 deliberati separati.
- Review tecnica separata: due difetti riprodotti e corretti. S02 ha segnalato il main annidato: RED2landmark→GREEN1, ora section etichettata. Ispezione grafica: punto molla mancante, RED→GREEN della proiezione del punto Core entro gli assi. FAIL e correzioni conservati.
- Prima head dc7100db: CI40246675742, contract40246675487 e marketing40246675539 tutti SUCCESS, comprese suite complete e build. CI della head finale da leggere; nessun trasferimento automatico del verde.

**READY_FOR_INTEGRATION, non DONE.** Merge ordinario della main8e0737b1/S02 nel branch, senza conflitti o force-push. Nessun edit non delegato a App/Shell/factory/auth/schema. S00 ha accettato il consumer `IndependentStudy({me,editionId,sessionVersion})`, ID `independent-study`; S02 prepara l'opt-in enabledViews. S00/S10 devono ancora montare UI e installer reale e filtrare le risorse macchina nei Materiali. Patch API2righe verificata con gitapply--check e istruzioni in `handoffs/swarm-v2/S06/INTEGRATION.md`; il demo usa gli stessi authenticate/store_dependency reali in composizione isolata. Script portabili ed evidenze nel handoff, nessun token/DB committato.

Limiti: materiali tutti DRAFT/humanApproval=false;38qualitative e200target non diventano approvati/consegnabili. Prerequisiti indicativi, richieste tutor/contestazioni private RECORDED_NOT_SENT. Offline del passaggio disponibile nel client, senza certificare cold boot dell'app senza rete. PostgreSQL/RLS/provider remoto, Safari/device fisico ed efficacia con studenti non verificati. Nessuna nuova dipendenza, adozione donor/ts-fsrs, spesa, migrazione o pubblicazione. Nessun merge/deploy S06.

<!-- ardesia-pr
{
  "version": 1,
  "owner": "AndreaMarro",
  "acceptance": "Meccanismo autonomo S06 sui contenuti consentiti con ricevute Core, fonte e assistenza esatte, ripresa e piano spiegabile; READY_FOR_INTEGRATION con hook condivisi e limiti espliciti.",
  "verification": [
    {"command": "PYTHONPATH=packages/engine:services/study-api python -m pytest packages/engine/tests/study/test_independent_study.py services/study-api/tests/test_independent_study_http.py -q", "evidence": "21 PASS; handoffs/swarm-v2/S06/evidence/core-http.log"},
    {"command": "npm run test --workspace @ardesia/web -- src/features/independent-study --maxWorkers=1", "evidence": "7 PASS; handoffs/swarm-v2/S06/evidence/web.log"},
    {"command": "node handoffs/swarm-v2/S06/demo/browser.mjs", "evidence": "14 PASS reali; browser-result.json e screenshot nel handoff; keyboard-touch-result.json altri3PASS"},
    {"command": "PYTHONPATH=packages/engine python handoffs/swarm-v2/S06/demo/workflow.py", "evidence": "http-workflow-result.json:6lezioni/12tentativi/retry/cold PASS"}
  ],
  "depends_on": [],
  "risk": "Draft pronta al raccordo: mount/App e installerAPI non ancora integrati da S00/S10. ContenutiDRAFT, richieste docente non inviate, nessuna certificazione remota o apprendimento. Prove browser composizione isolata, CI finale della SHA da verificare."
}
-->