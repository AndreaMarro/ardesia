# ARDESIA — CANON INDEX — HISTORICAL / SUPERSEDED (2026-06-23)

**Questo indice non è più autorità.** Gli invarianti correnti stanno in
`docs/PRODUCT-CONTRACT.md`, e il testo che decide è il PRD definitivo
`10-Requirements/2026-08-02-PRD-ARDESIA-DEFINITIVO.md`, che non sta in questo
repository ma nel repository separato del vault `ARDESIA-KNOWLEDGE`.

I cinque canon del 23 giugno restano leggibili e utili: sono stati ricavati dai
repository reali e verificati riga per riga, e la loro lettura tecnica dell'esistente
conserva valore. Ciò che non fanno più è definire **scope**, **sequenza** e
**modello economico**: su quelli sono superati. Dove un canon e il contratto
divergono, vale il contratto; dove contratto e PRD divergono, vale il PRD.

## I cinque documenti

Sono cinque, non quattro: la versione precedente di questo indice ne elencava
cinque e ne dichiarava quattro nella stessa pagina.

1. **[ARCHITECTURE-CANON](ARCHITECTURE-CANON.md)** — mappa delle sorgenti, regola
   di classificazione, quattro layer as-is contro as-designed, confine Core,
   persisted contro ephemeral, roadmap.
2. **[PRODUCT-CANON](PRODUCT-CANON.md)** — ARDESIA distinta da ELAB e dal
   simulatore, reality-test sullo stato di allora, modalità di lezione, funzioni
   Core cross-materia, moat, responsive.
3. **[PLUGIN-MARKETPLACE-CANON](PLUGIN-MARKETPLACE-CANON.md)** — manifest del
   plugin as-built, kernel di sicurezza, item aperti di allora, tipi vendibili.
4. **[ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md)** — stato di ELAB dentro
   `plugins/`, split fra Simulation-Plugin ed ELABTutor-Pack, confine di
   decoupling e lint-gate proposto.
5. **[ELAB-SCENE-FORGE-CANON](ELAB-SCENE-FORGE-CANON.md)** — manuale verso scena
   fisica fedele, geometria contro wire-path, scelta di scrivere a mano le prime
   scene, trappole di licenza per il marketplace.

## Regola di classificazione — euristica storica

Il canon la chiamava «legge»: universale → Core, strumento riusabile → Plugin,
materia o metodo → Pack, sequenza vendibile → Workflow.

Va letta come **euristica di orientamento**, non come tassonomia normativa. Il PRD
descrive una composizione OOP+LEGO in cui NotebookDocument, WhiteboardDocument,
Foglietti, LinkedView, Collegamenti, Pack, Workflow e gli altri oggetti sono
fratelli nel Workspace, e Core → Plugin → Pack → Workflow non è una catena lineare
esclusiva: vedi `PC-OBJ-001` nel contratto. La categoria in cui un oggetto ricade
non determina da sola il suo tipo normativo.

---

## Snapshot storico 2026-06-23

Tutto ciò che segue descrive **l'istante in cui è stato scritto**. Non è lo stato
corrente e non va letto al presente. Lo stato corrente non è scritto in nessun
documento: si genera.

```bash
python3 bin/state/project_state.py --print
```

### I tre fatti che allora cambiavano il piano

1. Il plugin host risultava già costruito (firma ed25519, kill-switch duale
   fail-closed, CSP, SES, rehash al mount) ma **non montato**. La conseguenza
   tratta allora: la prossima mossa era cablarlo, non costruire i primitivi.
2. `plugins/elab-tutor/` conteneva l'applicazione ELAB pressoché intera, con
   autenticazione, memoria, AI, report e lavagna duplicati.
3. Manuali come oggetti vivi, marketplace, UNLIM tipato e memoria per studente
   persistita risultavano greenfield, con soli primitivi parziali.

### Correzioni oneste ai claim del vision, come misurate allora

- La metrica di retrieval citata nel vision non era riproducibile in
  `packages/engine/`: il numero comparabile veniva dallo script moat_gate.py del
  repository separato e storico `~/lessonos`.
- Il campo `kind` del manifest non esisteva: tutto era «tool».
- `plugins/elab-tutor/` non era disaccoppiato.
- La provenance della scena e l'enum della modalità di lezione erano solo spec.
- Local-first, plugin immutabili, solver di circuito e firma con kill-switch
  risultavano invece confermati.

### Il P0 accoppiato di allora

Montare il ToolHost in una route di produzione, far montare ELAB attraverso l'host,
e aggiungere un gate che fallisse se dentro `plugins/elab-tutor/` fossero
ricomparsi i file di entry point applicativi, l'autenticazione o le function
serverless. A seguire: `kind` nel manifest, estrazione del Pack, data-model del
lettore di manuali, UNLIM tipato, export dello student-pack, marketplace locale.

Questa sequenza è **superata come piano**: la sequenza corrente è R1 e R2 del PRD,
sintetizzata in `PC-R1-001` e `PC-R2-001`.

### Regola anti-divergenza di allora

Il canon indicava repository di lavoro separati come sorgenti del comportamento, e
prescriveva di non studiare i subtree del monorepo per il comportamento corrente.
Quella regola descriveva l'assetto del giugno 2026 e non governa l'assetto attuale:
per la struttura vale `ARDESIA-MAP.md`, per i requisiti il contratto e il PRD.
