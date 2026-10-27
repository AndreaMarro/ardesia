# Revisione tecnica — 26 ottobre 2026

Skill requesting-code-review applicata con reviewer separato, read-only, senza storia completa della sessione. Nessun agente ha modificato file/index/HEAD. La prima review è stata interrotta prima del verdetto ma aveva consegnato tre finding Important, tutti riprodotti. Non è una firma scientifica o una review indipendente dell'intero CAS.

1. **Nuovo foglio identico riusava createkey:** stessa serializzazione dopo Nuovofoglio rigiocava il receiptCore precedente, aliasando la risorsa. RED nel test conledgercreatereale-stile, primoresponseperso, retry e poi nuovofoglioidentico. Fix: targetclient risorsa/revisione e reset su esplicitoNuovofoglio; il retryimmutato conserva la chiave. Il browser finale verifica duePOST con text byteidentico ma resourceId distinti.
2. **Frazione con numeratoredecimale:** grammar accettava1.5/2 maRationalMathJSON richiedeinteri. RED con donorvendorizzatoreale e1e-2/2. Fix: Rational perinterisicuri, Divide peraltrivalorifinitiammessi;0denominatore eoverflowrestanobloccati.
3. **Etichetta provenienzastorica sutestocorrente:** detailv2 aveva etichettav1/hash1 dalfoglio. RED suversione/hash cambiati conbozzapreservata. Fix: testo/version/hash correnti dadetail; bindingstorico distinto eavviso chetestostorico nonècontenutonelfoglio. Calc/save rimangonobloccati sulfoglioobsoleto.

Aggiunta ancherestrizioneconservativa x≠0 peresponente0. Ilvecchiocodice rifiutavagià0^0 conerrorenonfinito; ilprimotestaspettavala parola«dominio» e il logREDèpreservato. Non sispaccia questo perrisposta1precedente.

La follow-upreview ha verificato codice, test econtrattoCore: create_resource usa actor/operation/key epayloadhash; revise_resource usaexpectedRevisionCAS e**ignora Idempotency-Key**. Il discriminatoreclient nonaggiunge replayserverallarevisione. Tutti16namespacePASS primadellaconsegna; ilreviewer nonha rieseguitosuite/browser/build sulMaccondiviso.

Verdettofollow-up: **nessun Critical/Important/Minor residuo nei fix esaminati; Ready perquestifix**, subordinando readinesscomplessiva aprovaE2E echeckrequired freschi. Declinedtojudge: auditcompletovendor, modificheauth/schemafuoriscope, approvazionescientificaumana, egaranziedireplayserverperrevisioni nonesistenti. L'esecutore conferma questiconfini: vendorimmutato+manifest/testnonèauditformale, auth/schemaimmutati, pubblicazioniscientifiche0, reviseCASesplicito. Nonvengonosilenziosamente scartaticomportamentidellarichiesta.

CodeRabbit: lo statusSUCCESS era «review skipped: draft pull request», non contato comerevieweffettuata. Il verdettoagente vale soloper l'ambitodichiarato.

## Ulteriore composizione dal consumer reale

Il primo E2E sui fix ha confermato duecreateindipendenti ma ha riprodotto un altro caso deldonor: x=1.5/2funzionava da solo, mentre la Divideannidata dentrox/x rimaneva residuo nonnumerico. LogFAIL eprobeNode conservati; testreal-donorRED dedicato prima del fix. Adattamento minimo: evaluate della sola Rational/Divide numerica validata **prima** di subs. Non amplia linguaggio o limiti. Nuova follow-upreview read-only: nessunissue, Ready perquestaaggiunta subordinato atest/E2E; nessunbrowserosuite aggiuntivi lanciati dalreviewer. Suite namespace17PASS. La precedente review non viene retroattivamente descritta come copertura diquestocomposto.
