# 14. REA come gate verificabile: dal sito studiato al codice funzionante

## Decisione V4 (non più semplice suggerimento)
**G0 non è PASS finché R0, R1, R2, R3, R6 e R8 non hanno ricevute di esecuzione verificabili e collegamento a codice e test reali.** G1 richiede anche R4 (memoria/ripresa); R5 ha la propria prova d'interoperabilità ufficiale e, dove REA aggiunge valore, evidenza REA. R7 riguarda Kirchhoff dopo i due primi verticali.

Non basta: citare il sito, scaricare screenshot, osservare il README, dichiarare accesso negato oppure produrre una «specifica plausibile». Il risultato atteso è **un sottosistema implementato e collaudato** che risponde a una domanda osservata.

Questo rafforza il punto debole di V3: l'ex `AC-002` ammetteva un blocco REA esplicito come alternativa documentale. In V4 un blocco è un risultato di stato **BLOCKED**, mai un PASS del gate. Se un target commerciale non è accessibile, sostituirlo con un sito o progetto della stessa famiglia accessibile senza aggirare login, paywall, DRM o condizioni d'uso. L'obbligo è sulla *famiglia funzionale*, non su uno specifico account proprietario.

## Sei missioni richieste per G0
| Missione | Famiglia e scelta minima | Che cosa bisogna provare |
|---|---|---|
| **R0** | Ardesia baseline propria | Riprodurre un flusso lezione/oggetto, salvare e riaprire con REA e test, SHA fissato |
| **R1** | Obsidian Canvas / AFFiNE / progetto autorizzato simile | Identità e viste di carte/post-it, undo, versione, preservazione della fonte |
| **R2** | Brilliant / Snorkl se accessibili; Doenet o Numbas come donor eseguibile | Tentativo → aiuto → manipolazione → nuova prova; proposta AI distinta dalla verifica |
| **R3** | Teachworks/TutorCruncher se accessibili; LMS open source equivalente + Class Notebook per riferimento | Edizioni, date, capienza, area individuale, revisione; corsi completi, non singola ora |
| **R8** | Quaderno errori Passify se accessibile; RemNote/Math Academy; feedback/retries PrairieLearn/Gradescope autorizzati | Un errore per passaggio e fonte, richiamo, contestazione, trasferimento, ripetizione non casuale |
| **R6** | Nuovo prodotto Ardesia vs baseline | Differenza semantica e UX con prove sullo SHA nuovo, senza dichiarare uguaglianza per screenshot |

R4 e R5 per G1; R7 per Kirchhoff successivamente. **Non aspettare di analizzare tutte le 139 voci** prima di realizzare G0; lavorare a coppie *missione REA → task di prodotto*. La raccolta di interesse pubblica può essere mostrata prima di G0 solo come anticipazione esplicita e previa autorizzazione; non affermare che il corso integrato sia pronto.

## Metodo REA obbligatorio, non rituale
Per ogni missione:
1. **Study:** leggere le specifiche REA ufficiali al commit fissato; eseguire doctor, tools/list, `--version` e il relativo comando help sulla versione installata. Conservare capability e limiti del sistema. Se il binario è incompatibile, configurare ambiente isolato compatibile; non modificare globalmente il Mac.
2. **Scenario:** domanda, superficie autorizzata, stato iniziale, dati sintetici, interazioni e stato atteso. Catturare con `capture_browser_scenario` o `inspect_web_page` e artifact opportuni. La sola cattura URL non prova lo stato.
3. **Structure:** dove utile e consentito, `export_web_scripts`, `analyze_web_bundle`, `analyze_javascript_application`, `trace_application_feature`, `trace_javascript_semantics`; per il nostro software confrontare sorgente e bundle e recuperare la catena UI → persistenza. Se una capacità non è disponibile, riportare quale e perché. Nessuna esecuzione di codice del terzo ricostruito durante analisi statica.
4. **Runtime:** riconciliare osservazione/struttura e classificarne l'autorità; chiamata ipotizzata non è osservazione reale. Non inventare endpoint backend non visibili. Registrare incongruenze/unknown.
5. **Extraction:** disegnare stato, invarianti, permessi, versioni, effetti del retry, error path e limiti. Confrontare esplicitamente soluzione analizzata e Ardesia: **REUSE / ADAPT / REPLACE / DEFER**.
6. **Build:** implementare una versione originale oppure estrarre un componente con licenza e obblighi verificati. Mai clonare loghi, contenuti editoriale protetti o codice proprietario indisponibile. Non usare credenziali di terzi.
7. **Verification:** test unitario/contratto, browser E2E, hash file, riferimento alla PR e confronto con la baseline sullo stesso requisito. Evidenza e test legati allo SHA del prodotto. Misurare beneficio: comportamento acquisito e bug/tempo di lavoro evitati, usando `UNKNOWN` dove non misurato.
8. **Receipt:** scrivere in `state/rea-receipts/Rn.json` metadati sanificati, con SHA256 per artifact del nostro prodotto, spec estratta e report di test. Materiali grezzi dei concorrenti non vanno in repo pubblico. Receipt `PASS` richiede artifact reali e link verificabili, non un LLM che lo dichiara.

## Receipt, strumenti e gate automatico
- **Schema:** `factory/rea/REA_RECEIPT_SCHEMA.json` (proposta verificabile con JSON Schema).
- **Policy:** `factory/rea/REA_GATES.json` mappa G0/G1 a missioni, target alternativi e prove.
- **Controllo:** `python factory/rea/check_rea_gates.py --gate G0`; deve fallire quando mancano le ricevute. Con `--report` stampa uno stato senza promuovere il prodotto.
- **Test del controllo:** `python factory/rea/check_rea_gates.py --selftest`; dimostra soltanto che una ricevuta mancante o sintetica **non** passa la gate.
- **Acceptance G0:** R0/R1/R2/R3/R8/R6 e una mappa `missione → fonte osservata → decisione → file modificato → test passati`. Una lettura documentale da sola non vale come REA eseguito.
- **Autenticità:** il validator verifica struttura/esistenza/hash e, per gli artifact REA, `evidence_id`, `operation` e `normalized_result` contenuti nella Evidence originale. Un target alternativo richiede motivazione e deve essere nel registro. Tuttavia **non** può attestare da solo la liceità dell'accesso o l'effettiva azione del browser. Il reviewer controlla a campione i log, il contenuto degli artifact e riesegue lo scenario proprio.

## Misurazione: REA deve accelerare il prodotto
Ad ogni missione quantificare, se effettivamente misurabile: durata della ricerca, ore implementazione/test, difetti evitati/rilevati prima del deploy, componenti riusati con licenza, risultato osservabile nel prodotto. Il **numero di tool call non è un KPI**. Il benchmark precedente su import AST più veloce di REA è rilevante: non usare REA per ciò che un grep dimostra meglio; usarlo aggressivamente quando serve evidenza di interazione, semantica e comportamento complesso.

## Sicurezza e diritti
Profilo browser dedicato, autorizzazioni esplicite, token redatti, nessuna raccolta massiva da account altrui; niente bypass di limiti di servizio, paywall, DRM o contratti di licenza. Bundle di terzi e acquisizioni sensibili rimangono negli artifact locali temporanei e fuori da GitHub pubblico. Se una funzione è protetta, si recupera un modello funzionale dalle superfici consentite e lo si reimplementa in modo originale. La licenza MIT di REA **non trasferisce diritti** sui software analizzati.

## Comportamento in caso di blocco
Non trasformare `BLOCKED` in `PASS`; isolare il punto preciso, tentare un'alternativa realmente accessibile della stessa categoria, completare le altre task e preparare una evidenza minima del blocco. Nessun ciclo infinito. Un gate G0 non superato non impedisce una landing dichiarata anteprima, ma impedisce di dichiarare la microdemo completata secondo il mandato V4.


## Addendum V4.1 — scelta autonoma di sostituti equivalenti
Se un prodotto non ammette accesso con il proprio account, non trasformare il target in blocco permanente: scegliere **due candidati alternativi**, confrontare funzione, accessibilità REA, prove, licenze e rischio/costo, poi studiare con REA il migliore ad accesso consentito. È ammesso attivare prove veramente gratuite, con registro preventivo, soltanto senza carta, rinnovo o possibili addebiti. Il nuovo target deve essere aggiunto al registro e il receipt deve riportare sostituzione, equivalenza per lo specifico workflow e artifact di analisi reali. Non abbassare la gate: uno scenario REA esterno con Evidence autentica e test d'integrazione resta necessario. Dettagli in `specs/15_AUTONOMIA_TRIAL_E_LANCIO.md`.
