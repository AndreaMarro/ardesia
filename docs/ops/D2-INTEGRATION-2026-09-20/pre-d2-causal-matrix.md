# Pre-D2 causal matrix — 64 commits (751bcb30..fba5d035)

Rule: NET diff (56 paths, 0 engine) is not semantics. History-touched paths: 56.
Merge commits in range: 0 (no manual merge classification needed).
Categories: PRODUCER_CONTRACT / LESSON_IDENTITY / PERSISTENCE_ACK /
POST_LESSON_PRESENTATION / LESSON_OUTCOME / CONTINUITY / SIMULATION /
CI_GATE / TEST_INFRA / PROCESS_DOCS / UNRELATED / UNKNOWN.

| # | sha | date | category | subject | key paths |
|---|---|---|---|---|---|
| 0 | 3ee18131 | 2026-08-22 | PERSISTENCE_ACK | fix(#246): la UI conferma sull'acknowledgement dell'event-log, non sull'emit | ci.yml, .memlog.md, RETROSPECTIVE.md, SPEC.md (+4) |
| 1 | ad854936 | 2026-08-22 | CI_GATE | ci: la prima spec si guadagna il cancello, e la giustificazione della corsia adv | ci.yml, .memlog.md, SPEC.md |
| 2 | 4f54cc3e | 2026-08-22 | CI_GATE | ci: la seconda spec entra nel cancello, e una verde viene respinta con la sua ra | ci.yml, .memlog.md, SPEC.md, journey-ammessi.md |
| 3 | 0c394c48 | 2026-08-22 | CI_GATE | ci: il quarto journey entra, e il costo di ammetterlo e' scritto accanto | ci.yml, .memlog.md, SPEC.md, journey-ammessi.md |
| 4 | 7b91c81f | 2026-08-22 | CI_GATE | ci: il quinto journey difende una verita fisica, non un comportamento | ci.yml, .memlog.md, SPEC.md, journey-ammessi.md |
| 5 | e513ceec | 2026-08-22 | PROCESS_DOCS | bmad: la spec dell'attesa limitata atterra in _bmad-output | .memlog.md, SPEC.md |
| 6 | 04f137af | 2026-08-22 | PROCESS_DOCS | bmad: due constraint misurati nella spec del cancello e2e | .memlog.md, SPEC.md |
| 7 | 22489d7d | 2026-08-22 | CI_GATE | ci: il sesto journey entra, e il costo e' che accoppia il cancello | ci.yml, .memlog.md, journey-ammessi.md |
| 8 | f54cf2b9 | 2026-08-22 | CI_GATE | ci: il settimo journey segue il file fuori dall'app e lo riporta dentro | ci.yml, .memlog.md, journey-ammessi.md |
| 9 | d1852453 | 2026-08-22 | CI_GATE | ci: l'ottava spec e' respinta perche' un cancello required la copre gia' | journey-ammessi.md |
| 10 | e33d51a3 | 2026-08-22 | TEST_INFRA | test: il rosso dei cinque file era Node 26, non il prodotto | vitest.config.ts |
| 11 | b273c96b | 2026-08-22 | CI_GATE | ci: correggo il registro — il required era rosso per Node 26, non su CI | journey-ammessi.md |
| 12 | 0a8b5c25 | 2026-08-22 | PROCESS_DOCS | bmad: la retrospettiva del cancello e2e atterra, e nomina cinque cose aperte | RETROSPECTIVE.md |
| 13 | 01f3dfd3 | 2026-08-22 | PROCESS_DOCS | bmad: i segnaposto del template restano fuori dall'oggetto consegnato | RETROSPECTIVE.md |
| 14 | 0d55564e | 2026-08-22 | CI_GATE | ci: la nona entra, e porta un difetto che nessun altro cancello vedeva | ci.yml, plugin-postit-room-reload.spec.ts |
| 15 | 07686aa9 | 2026-08-22 | CI_GATE | ci: il registro dice che la stessa spec e' stata respinta e poi ammessa | journey-ammessi.md |
| 16 | 1022e35a | 2026-08-22 | CI_GATE | ci: il repository dichiara quale Node vuole, e un gate lo fa rispettare | ci.yml, studio-preview-readiness.yml, .nvmrc, node_version_gate.py |
| 17 | 9cebc47b | 2026-08-22 | PROCESS_DOCS | bmad: la retrospettiva registra che tre dei cinque elementi sono fatti | RETROSPECTIVE.md |
| 18 | 70941d2e | 2026-08-22 | CI_GATE | ci: «22.12.0» non era arbitrario, e il perche' resta scritto | studio-preview-readiness.yml, node_version_gate.py |
| 19 | 4672d189 | 2026-08-22 | CI_GATE | ci: un invariante che il codice dichiara e nessun comando difende | journey-ammessi.md, ToolCanvasEmbeddable.tsx |
| 20 | ada6c5c6 | 2026-08-22 | UNRELATED | fix: tolgo l'emoji che avevo messo io in un sorgente UI, e rompeva un required | ToolCanvasEmbeddable.tsx |
| 21 | a9621b41 | 2026-08-22 | CI_GATE | ci: la decima entra, e difende una classe che jsdom non puo' vedere | ci.yml, journey-ammessi.md |
| 22 | b70ef54a | 2026-08-23 | CI_GATE | ci: l'undicesima entra, e i fili non rubano piu' il tocco in silenzio | ci.yml, journey-ammessi.md, montaggio-canvas.spec.ts, ToolCanvasEmbeddable.tsx |
| 23 | 6b801a2e | 2026-08-23 | CI_GATE | ci: la dodicesima entra, e difende il disegno dal diventare nero | ci.yml, journey-ammessi.md |
| 24 | f50abdf9 | 2026-08-23 | TEST_INFRA | test: la lista delle scene si importa, non si copia | journey-ammessi.md, elab-lab-canvas-colors.spec.ts |
| 25 | 90d8a1b4 | 2026-08-23 | CI_GATE | ci: la tredicesima e' respinta e ammessa nello stesso giro, e la differenza e' u | ci.yml, journey-ammessi.md, sim-esp6-rgb.spec.ts |
| 26 | 61b7a86b | 2026-08-23 | TEST_INFRA | test: contare non e' vedere — la spec del disegno non guardava il disegno | journey-ammessi.md, elab-lab-canvas-colors.spec.ts, sim-esp6-rgb.spec.ts |
| 27 | 2035a931 | 2026-08-23 | TEST_INFRA | test: il verdetto deve essere visto, non solo presente | journey-ammessi.md, elab-lab-marcatura-durabile.spec.ts, first-led-ipad-touch.spec.ts, montaggio-can |
| 28 | 57973e5d | 2026-08-23 | TEST_INFRA | test: quattro scene su otto non mostrano nessun verdetto, e nessuno lo sapeva | journey-ammessi.md, elab-lab-canvas-colors.spec.ts |
| 29 | e936eea3 | 2026-08-23 | TEST_INFRA | test: la ragione per cui quattro scene non risolvono ha un nome, e ora e' fissat | journey-ammessi.md, elab-lab-canvas-colors.spec.ts |
| 30 | a1506b12 | 2026-08-23 | TEST_INFRA | test: il catalogo elettrico contro le scene visibili, e la risposta completa | journey-ammessi.md, CatalogoSceneVisibili.test.ts |
| 31 | 49e6009d | 2026-08-23 | PROCESS_DOCS | ops: quanto costa il catalogo elettrico — la tabella che serve per decidere | journey-ammessi.md, catalogo-copertura.mjs |
| 32 | 7796ec5d | 2026-08-23 | PROCESS_DOCS | ops: i data-* che nessun oracolo nomina sono 31, non 88 | journey-ammessi.md, attributi-senza-oracolo.py |
| 33 | 13634a71 | 2026-08-23 | PROCESS_DOCS | ops: due limiti invece di un numero — e il parametro che stavo accordando | journey-ammessi.md, attributi-senza-oracolo.py |
| 34 | 5207301a | 2026-08-23 | PROCESS_DOCS | registro: la tredicesima non entra, e per due ragioni che si contraddicono | journey-ammessi.md |
| 35 | 7af522cc | 2026-08-23 | CI_GATE | cancello e2e: tredicesimo journey, e la domanda del giro 19 chiusa | ci.yml, journey-ammessi.md |
| 36 | d012c912 | 2026-08-23 | CI_GATE | cancello e2e: quattordicesimo journey, e la seconda coppia di coperture che non  | ci.yml, journey-ammessi.md |
| 37 | d074725e | 2026-08-23 | CI_GATE | cancello e2e: quindicesimo journey, e il filone delle candidate si chiude | ci.yml, journey-ammessi.md |
| 38 | 33541cc5 | 2026-08-23 | UNRELATED | passo-passo: la gamba mobile smette di essere decorativa, e diventa la sedicesim | ci.yml, journey-ammessi.md, sim-passo-passo.spec.ts |
| 39 | 4813ffb8 | 2026-08-23 | UNRELATED | restore: il gate smette di leggere il testo dei warning React | ci.yml, journey-ammessi.md, sim-multi-experiment-restore.spec.ts |
| 40 | 54952397 | 2026-08-23 | UNRELATED | product-flow-shell: la scheda del founder plugin poteva sparire e nessuno lo dic | journey-ammessi.md, product-flow-shell.spec.ts |
| 41 | dd20c8a4 | 2026-08-23 | UNRELATED | restore: il journey contava tre embed senza mai guardarli | journey-ammessi.md, sim-multi-experiment-restore.spec.ts |
| 42 | 5b870107 | 2026-08-23 | UNRELATED | wizard e elab-lab: le ultime due gambe cieche, riparate | journey-ammessi.md, elab-lab.spec.ts, plugin-wizard.spec.ts |
| 43 | 707be2ce | 2026-08-23 | TEST_INFRA | e2e: un journey che cade lascia prove (trace, screenshot, video) | journey-ammessi.md, playwright.config.ts |
| 44 | b1af889c | 2026-08-23 | UNRELATED | il flake ha un nome, e il DOM esponeva un calcolo parallelo | ci.yml, journey-ammessi.md, first-led-ipad-touch.spec.ts, playwright.config.ts (+1) |
| 45 | f49df6fb | 2026-08-23 | CI_GATE | ci: il passo 9 dichiara che uno dei suoi due test e' spento | ci.yml, journey-ammessi.md |
| 46 | 66e812f0 | 2026-08-23 | UNRELATED | iPad: il test spento non era pigrizia, e lo studente non puo' piazzare nulla | ci.yml, journey-ammessi.md, first-led-ipad-touch.spec.ts |
| 47 | 5fd4c5fa | 2026-08-23 | UNRELATED | catalogo: il banner «4 montati di 88» ora e' legato al corpus | journey-ammessi.md, SimulationStepByStep.test.tsx |
| 48 | 841e80cc | 2026-08-23 | UNRELATED | sceneCatalog: un file che dice sempre no, e adesso lo dichiara | journey-ammessi.md, sceneCatalog.ts, ElabSceneCatalog.test.ts |
| 49 | daade1df | 2026-08-23 | UNRELATED | ripasso-live: il badge contava, il pannello poteva restare vuoto | journey-ammessi.md, ripasso-live.spec.ts |
| 50 | ad08dfea | 2026-08-23 | UNRELATED | asserire il valore positivo di un booleano e' decorativo: due gambe trovate | journey-ammessi.md, montaggio-canvas.spec.ts, plugin-wizard.spec.ts |
| 51 | bfa44901 | 2026-08-23 | UNRELATED | aria-current e aria-pressed: «corrente» e «premuto» hanno senso se sono UNO | journey-ammessi.md, montaggio-canvas.spec.ts, product-flow-shell.spec.ts |
| 52 | 52ea9b58 | 2026-08-24 | CI_GATE | ci: il passo 13 smette di promettere l'handshake che non certifica | ci.yml, journey-ammessi.md |
| 53 | c2708466 | 2026-08-24 | UNRELATED | studentpack: il pack scaricato deve essere del candidato scelto | journey-ammessi.md, studentpack-artifact.spec.ts |
| 54 | f9bb2e8f | 2026-08-24 | PROCESS_DOCS | registro: la sesta coppia non e' un difetto, e il perche' vale piu' di un difett | journey-ammessi.md |
| 55 | ac878a5b | 2026-08-24 | UNRELATED | restore: i tre embed devono essere I TRE SALVATI, non tre qualunque | journey-ammessi.md, sim-multi-experiment-restore.spec.ts |
| 56 | 99a25c31 | 2026-09-16 | CONTINUITY | fix(continuity): order sessions by recency | ContinuitySurface.test.ts, ContinuityView.test.tsx, ContinuityViewNav.test.tsx, ContinuityView.tsx ( |
| 57 | 4be24d40 | 2026-09-16 | CONTINUITY | fix(continuity): explicit load-failed state instead of infinite loading | ContinuityView.test.tsx, ContinuityResumeCard.tsx, ContinuityView.tsx |
| 58 | b970f365 | 2026-09-16 | CONTINUITY | fix(continuity): contain listing open rejection as storage-unavailable | ContinuitySurface.test.ts, ContinuityView.test.tsx, continuitySurface.ts |
| 59 | c0a8ec41 | 2026-09-16 | LESSON_IDENTITY | fix(recap): scope study digest by canonical lesson identity | RecapView.tsx, RecapView.test.tsx, studyDigest.test.ts, studyDigest.ts |
| 60 | 8822b51c | 2026-09-16 | TEST_INFRA | test(recap): prove lesson identity isolation in browser | recap-identity-isolation.spec.ts |
| 61 | 399d1bce | 2026-09-16 | POST_LESSON_PRESENTATION | fix(recap): read per-room journal instead of unwritten global | recap-identity-isolation.spec.ts, lessonRecap.test.ts, lessonRecap.ts |
| 62 | c70c33f5 | 2026-09-16 | LESSON_OUTCOME | refactor(recap): introduce lesson outcome renderer boundary | RecapView.tsx, lessonOutcome.test.ts, recapHtml.test.ts, lessonOutcome.ts (+1) |
| 63 | fba5d035 | 2026-09-16 | LESSON_OUTCOME | test(recap): prove lesson outcome identity scoping | RecapView.tsx, lessonOutcome.test.ts, studyDigest.test.ts |
