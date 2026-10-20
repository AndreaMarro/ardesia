# Gate Studio aperto — checkpoint non committato

Due esecuzioni del gate congelato non sono verdi:

- prima: 2155 passati, 2 falliti (PluginWindow ed ElabV1Cap6Esp1Fixture);
  i successivi 11 test isolati sono passati;
- seconda: 2156 passati, 1 fallito in no-emoji.test.ts, durata 23124,837 ms,
  messaggio STACK_TRACE_ERROR senza elenco di caratteri responsabili.
  Esito isolato successivo: {'numPassedTests': 2, 'numFailedTests': 0, 'success': True}.

Il replay non è stato eseguito in nessuno dei due gate: Vitest era già fallito.
Nessun dato di un replay precedente viene contato. La causa resta non accertata;
non si attribuisce automaticamente il fallimento al carico della macchina.
Il codice del test e il gate sono invariati. I log completi e le fixture delle
prove Web sono conservati nel checkpoint.

Regola applicabile, `apps/studio/AGENTS.md`, §5:

> 2 tentativi falliti sulla stessa task → scrivi una voce in `~/lessonos/COORDINATION.md` § NEEDS-CLAUDE e fermati. NON grindare.

Questo documento conserva localmente la segnalazione di review; nessun messaggio
è stato inviato ad altre chat o processi. Non viene lanciato un terzo gate.
Il checkpoint resta non committato; l'applicazione Web e il bundle REA verificati
non sostituiscono il gate richiesto dal repository.

Prossimo passo: diagnosticare il fallimento del runner/scansione senza cambiare
soglie, test o gate per ottenere un verde; mantenere separati gli esiti isolati
dalla suite completa. SYS-01 e il programma Ardesia restano aperti.

## Aggiornamento di pubblicazione

Dopo questo arresto, l'utente ha chiesto direttamente di mettere tutto su
GitHub in modo ordinato. Il candidato viene quindi committato e pubblicato
come checkpoint di revisione con gate Studio fallito. Le diciture
«non committato» sopra e negli archivi descrivono l'istante della precedente
consegna e rimangono come traccia storica. Non sono stati ripetuti i gate né
modificate le soglie. La pubblicazione non conclude la diagnosi o SYS-01.
