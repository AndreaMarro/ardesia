# Verifica successiva al checkpoint · 26 ottobre 2026

Questo registro aggiunge gli esiti finali locali senza sostituire README e
MEMORY-APPENDIX, che descrivono il checkpoint precedente alla composizione.

**READY_FOR_INTEGRATION**, con raccordo root ancora da S00. Non DONE,
INTEGRATO o DISTRIBUITO. Una sola PR315; nessun merge main/deployS05.

## Sorgenti e composizione

- Acquisizione e persistenza: `5b8c920`.
- Merge ordinario del contratto316/head3326ac2 e main992d1a0b: `22fa092`.
  Unico conflittoShell risolto prendendo il re-exportS02 byte-esatto.
  Nessun codice di navigazione S02 riscritto e attribuzione conservata.
- Correzioni di compatibilità dei tipi ufficiali: prodotto `7de633f6b5939583f979b0183b9a8085ad046b04`.
  `text-max-width` come stringa e API pubblica container() invece del metodo
  runtime headless() non presente nei tipi. Il primoFAILtypescript è conservato.
- Test `aabea7be9d031e82777d2b85a1cdf4e3c9a672b6`: modifica solo selettore del
  gruppo fieldset. Il nuovo details della licenza introduce un secondo gruppo
  accessibile; il test ora identifica il gruppo per nome, stessa aspettativa.
- Browser: medesimo prodotto7de633f e testaabea7b, con solo due correzioni
  successive nel runner. Nessuna mutazione del prodotto durante la prova.

Patch `root-enabled-views.patch` pronta, **NON APPLICATA**: una sola prop
`enabledViews={views}` in App. S00 è writerRoot e decide la composizione delle
route montate; richieste effettive6405947479/6406119700. Il consumer è montato
via URL autenticato `/?view=memory` prima del gateedizioni, verificato anche
senza corso. La voce navigazione/ricerca rimane nascosta finché il root owner
non applica quel raccordo. Questo limite impedisce di chiamare DONE la feature.

## Prove realmente concluse

| Prova | Esito e fonte |
| --- | --- |
| Core+HTTP, dominio e regressioni contesto/diario/erasure | **68PASS**, `evidence/core-http-final.log`; stessa sorgente Core del prodotto7de633f. Una deprecazione Starlette/httpx upstream. |
| UI+adapter reale+shellS02 | **33PASS in6file**, `web-composed-green.log`:18S05+15S02, sul tree finale del codice. |
| Web TypeScript | **exit0**, `typecheck-green.log`; primoFAIL in `typecheck-composed.log`. Nessun cast/ts-ignore o modifica dei tipi upstream. |
| Chrome155, SQLite/cookie reali, dati sintetici | **12controlliPASS**, `browser-results.json`/`browser-run-3.log`,1440×1040 e390×844, reduced motion. |
| Vendor byte-esatto | **PASS** confronto ESM/types/LICENSE con tarball ufficiale estratto, `vendor-byte-comparison.json` e PROVENANCE upstream. |
| NUL, secret-scan, doc-claims, whitespace | **PASS locale**; logNUL/segreti conservati, whitespace verificato anche sull'indice completo. Gate comuni non modificati. |

Il nuovo browser copre canvas reale e Dijkstra, trascinamento di un nodo,
salvataggio e coldreopen con identiche coordinate/zoom/pan,409perversione
stale, due lezioni→prima fonte esatta, rettifica/storia, exportdownload/import,
browserpeerisolato, accountsenzaedizione e fonte ritirata nella proiezione.
Zero errori console/runtime inattesi. Il flusso completo del runner ha richiesto
**6782.296459ms**, misura singola di smokeE2E sotto carico locale, non benchmark
di rendering, FPS, p95, scala o efficacia didattica. Costo totaleUNKNOWN.

DueFAIL iniziali del runner conservati: ricerca «A» trovava anche «Da»;
status globale trovava sia salvataggio nota sia salvataggio disposizione.
Corretti i soli selettori per ruolo/nome/scope, senza cambiare aspettative.
Gli originali locali rimangono in work; le copielog pubblicate eliminano solo
whitespace di fine riga/EOF per il gateGit, diagnostici e assert conservati.
Screenshotdesktop/mobile ispezionati nel flusso e disponibili come prove del
nostro prodotto, non di appdonor. Nessun token, DB, cookie, fixtureaccessi,
profilobrowser o tracciadirete inclusi in questa consegna.

Review statica finale dell'altro agente sullo scope dei tre fix: nessun finding
residuo. Ha letto codice/diff, non eseguito test/browser/compiler; non promossa
a revisione umana o scientifica. Il browser non dimostra Safari/VoiceOver o
gesti su devicefisico;390px è un viewport desktop, non un testtattile reale.

## CI e stato del prodotto

Sulla testaabea7b osservati SUCCESS Web, Engine, StudyAPI, MCP, hygiene,
goldenadvisory, marketing epr-contract; Studio era ancora IN_PROGRESS a questa
registrazione. La315 è MERGEABLE (precedente CONFLICTING risolto), draft.
La CI della successiva head di sola documentazione/evidenze va riletta prima
del merge: consultare il record live nel rendez-vous306 e nella consegna,
non trasferire automaticamente queiPASS a un'altra SHA. CodeRabbit ha
saltato la review draft: il suo SUCCESS non è una review.

ServerChrome/API/Vite propri terminati, porte5425/5426 rilasciate al checkpoint
6406119700. Rimossi soltanto fixture temporaneepytest del lavoroS05 dopo aver
conservato i log; file/processi degli altri filoni intatti.

## Appendice finale per S00

Riconciliare questa registrazione con MEMORY-APPENDIX.md e aggiungerla a
RUNLOG/NEXT comuni senza rimuovere i vecchiFAIL o la decisione iniziale sul
rendererHTML. Le quattro priorità lì descritte restano, aggiornando il primo
passo: **applicare la propRoot e verificare laCI esatta**, quindi prova della
composizione e backend remoto autorizzato; scala/archivioportabile;
registry/manutenzione. Per chiudere serve ownerRoot/S00, non un nuovo planner,
database o un'altraPR.
