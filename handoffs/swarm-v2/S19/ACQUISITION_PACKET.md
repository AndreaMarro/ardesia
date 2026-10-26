# S19 — acquisizione sostanziale Kirchhoff

## Identità e diritti

- Donor: AndreaMarro/kirchhoff, commit verificato `b35a8b5da0616f00a7764397bda0e6b95aca3c95`, package `kirchhoff==0.1.0`.
- Acquisizione reale: checkout sparse immutabile con `src/`, `pyproject.toml`, `hatch_build.py`; package installato editable. Nessun solver copiato, riscritto o modificato. Il controllo runtime verifica versione, metadati editable, HEAD e pulizia; SourceSnapshot upstream controlla i byte caricati.
- `scripts/install_engine.py` e `engine.lock.json` rendono la scelta ripetibile. Editable è necessario qui perché il build hook della wheel upstream impone il bundle MCP web, che non serve ad Ardesia. Non si bypassano le verifiche scientifiche e non si fabbricano metadati di wheel.
- Tutta la storia Git dei file Python attribuisce gli autori AndreaMarro/elab allo stesso account. Nessuna licenza generale trovata. Il mandato del proprietario autorizza questa acquisizione del codice proprio; non inferiamo una licenza aperta o il diritto di sublicenziare terzi. Nessuna autorizzazione di pubblicazione/distribuzione pubblica è dedotta dalla visibilità GitHub.
- Nessun dataset, immagine, fotografia, font, companion-board/Excalidraw, asset aziendale o dipendenza ELAB acquisito. Nessuna lettura dell'holdout.
- Python core: dipendenze runtime upstream vuote. MCP è extra opzionale, non attivato. Il runtime S19 usa la stessa autenticazione, store e ricevute Ardesia.

## Unica catena delle risposte

`CircuitDocument → netlist → create_lesson(method=nodal) → radice Kirchhoff run_proof_session_con_run → risposta/equazioni/SVG`.
Il frontend non calcola grandezze. Fraction nell'adapter valida esclusivamente gli ingressi. `diagnose_payload` è l'unico controllo dei passaggi e viene chiamato soltanto dopo una lezione solved sulla stessa netlist; nessuna nuova implementazione MNA o grader.

Lo SHA è provenienza dichiarata e verificata nel checkout installato; non è una firma del ragionamento. Claim elettrico VERIFIED, backend CLOSED, lezione exact-answer-crosscheck e Product Verified=false sono statuti distinti. La lezione e il pack rimangono DRAFT senza revisione umana.

## Confronto con le duplicazioni

| Sorgente | Comportamento osservato | Scelta |
|---|---|---|
| `plugins/elab-tutor/src/components/simulator/engine/CircuitSolver.js` | Solver JS e simulatore nel prodotto ELAB | Nessun import, copia o dipendenza: proprietà/licenze ELAB non acquisite |
| `packages/engine/lessonos/study/electrical.py` | Modello analitico limitato a V e due R serie/parallelo, float | Binding `dc-resistance-v1` intatto; nessun tentativo generale attribuito a quel modello |
| `apps/web/src/components/ScientificElectricalModel.tsx` | Consumer del modello finito Core | Non diventa un secondo solver; il nuovo laboratorio ha attività di procedimento distinta |
| Frontend Kirchhoff | Shell React/Vite, board, storia portabile, SVG e feedback | Riutilizzo delle API e dei medesimi SVG; shell/login/memoria non duplicati |
| MCP Kirchhoff | solve_circuit, diagnose_steps, capabilities, SPICE/CircuitikZ | In-process usa gli stessi ingressi; nessun nuovo server MCP o autorità |

## Matrice delle capacità, verificata sul codice corrente

| Percorso | Ambito | Qualificazione |
|---|---|---|
| S19 DC | R, V/I indipendenti; corrente/tensione di ramo; nodi, KCL e passi supportati | Primo percorso; claim elettrico VERIFIED solo quando la pipeline chiude; procedimento non certificato globalmente |
| DC upstream | Anche resistenza di porta e metodi applicabili alla topologia; supernodi entro il planner | Non equivale a tutte le topologie risolvibili dal kernel |
| AC upstream | RLC, V/I indipendenti, omega positiva, fasi multiple di30°, tensione/corrente/impedenza | Cross-check esatto; nessun Claim VERIFIED; fuori S19 |
| Potenza AC upstream | P/Q/S e bilancio, RMS o picco dichiarati | PHASOR_POWER_CROSSCHECKED; fuori S19 |
| Laplace upstream | V(s)/I(s), RLC, step/impulse, stati iniziali espliciti | Identità razionali esatte; nessun Claim VERIFIED; fuori S19 |
| Controllate/op-amp | Supporto kernel ove dichiarato, non lezione equivalente | Non esposte da S19 |

La matrice ufficiale upstream dichiara 15 famiglie PARTIAL,6 NOT_SUPPORTED,0 COMPLETE. Le note correnti di settembre sono storiche rispetto a README/consegna16ottobre/codice fissato. Non trasferiamo conteggi di test storici a questa tranche.

## Editor acquisito

`@xyflow/react==12.10.1`, MIT, con lock dedicato e testo licenze completo. Offre nodi controllati, drag, riconnessioni, maniglie e tastiera; il renderer SVG Kirchhoff non è un editor. React Flow rappresenta la rete modificabile, mentre lo schema della derivazione resta quello prodotto da Kirchhoff. Non è un altro canvas generale o una copia di Studio.

Alternative valutate: Cytoscape.js MIT è forte nell'analisi/visualizzazione e richiederebbe raccordi extra per l'editing React; Rete richiede composizione di più plugin e alcune estensioni sono NC. Nessun esempio React Flow Pro usato. Font solo di sistema, nessun asset remoto.

Fonti primarie: [React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility), [reconnect](https://reactflow.dev/examples/edges/reconnect-edge), [Cytoscape](https://js.cytoscape.org/), [Rete licensing](https://retejs.org/docs/licensing/). Le licenze effettivamente installate e gli integrity del lock stanno in `dependency-provenance.json` e `web/public/THIRD_PARTY_NOTICES.txt`. DOMPurify usa l'alternativa Apache-2.0. Primo audit npm: Vite8.0.12 vulnerabile; aggiornato solo il package S19 a8.3.5, audit corrente0vulnerabilità.

## Contratti letti

Ardesia: AGENTS corrente, stato generato, CANON-INDEX e addenda di PRODUCT/ARCHITECTURE, ADR-0004, loop a due cardini, mappa vault, NEXT/RUNLOG/protocollo memoria, handoff e ownership S00; codice reale catalog, risorse/revisioni/submissions/receipts/feedback/context, client API e sessionBoundary.
Kirchhoff: AGENTS/README, costituzione K0–K5, regole error ledger, spine AD1–35 completo con emendamenti, D11/confini owner-locked, contratti student session/provenance/step/history/evidence, integrazione sito, consegne15/16ottobre, licenze/fonti/acceleratori, pipeline e MCP. I/O dell'archivio a tratti bloccato: lettura equivalente degli stessi blob via git show sulla SHA fissata, senza mutazioni.

## Limiti e prossimi confini

Quaderno JSON S19 conserva solo input; non concede autenticità o permessi. `s19-attempt.v1` nella consegna è testo derivato: una ricevuta Core attesta la consegna, non la correttezza di un blob arbitrario. Ogni consumer che vuole controlli deve ricalcolare dalla fonte esatta; S19 non legge answer key importate.

Nessuna installazione ToolHost firmata, pubblicazione remota, browser/device fisico, conformità WCAG completa, antitrasformata o pilot con studenti reali attestati. Studio può consumare gli stessi resourceId/revisionId; il mount finale e la registrazione del reader restano di S00. G0 Poiseuille e S13 sono indipendenti.
