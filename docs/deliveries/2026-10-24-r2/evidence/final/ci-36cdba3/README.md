# CI prodotto finale — 36cdba3

Tre run PR 301, attempt 1, tutte COMPLETED/SUCCESS: CI 40140273151 (7 job), Studio readiness 40140273173 (1 job), marketing 40140273245 (1 job). Head prodotto esatta **36cdba353401c80b92cc94f256b106238c7610f8**. Questa fotografia non attribuisce la stessa CI a una futura head di soli documenti.

Tutti i checkout usano il merge commit **7ec8e6fa5e7de56085379940c1bce93996df7c81** (base6a81d870 + head36cdba3). API GitHub commit confermano che merge e head hanno identico tree **f3896074fa0323cb4b88fe7ce361913574bcc45d**: contenuto testato identico al freeze prodotto.

| Job | Esito effettivo |
|---|---|
| web (typecheck + test + build) |354 PASS,53 file; Node26.5.1 |
| studio (typecheck + test + build) |2276 PASS,5 SKIP;210 file PASS/1 SKIP; Node22.23.3 |
| no-deploy-check (Studio readiness) |2276 PASS,5 SKIP ripetuti su Node22.12.0 |
| engine (pytest) |2654 PASS,29 SKIP |
| study-api (HTTP + shared Core) |951 PASS,30 SKIP,1 warning;12 teaching-artifact unittest separati PASS |
| study-mcp (official SDK stdio + HTTP) |23 PASS; CPython3.13.17 |
| marketing |9 unittest PASS;36 check viewport/3 engine completati |
| hygiene |SUCCESS; metadati e log completi conservati |

Le invocazioni si sovrappongono: API condivide test Core con Engine, e readiness ripete Studio. Non sommare questi conteggi come copertura unica. Studio5 SKIP sono i controlli di screenshot locali assenti nel runner pulito; API30 riguardano PostgreSQL/Supabase non configurati. Engine29 conserva anche dipendenze/servizi live, sibling repo, corpus e contratti filesystem non disponibili. Righe esatte dei risultati e di ogni skip in `archive-summary.json`.

Browser CI: Web6 Playwright pubblici senza API +1 teacher-pathway su SQLite temporaneo; Studio golden path1 PASS **advisory**, con continue-on-error, non gate replay. Marketing riporta12 larghezze320–1920 per Chromium148.0.7778.96, Firefox150.0.2 e WebKit26.4:36 check viewport più3 completamenti motore, non39 test indipendenti.

**Gate locale distinto:** il log già esistente `studio-postfix-gate.log` riporta2277 PASS/0 FAIL/exit0, cioè2276 unitari+1 replay. Il relativo `studio-postfix-replay.log` riporta1 PASS del replay kill-test. I due hash e le righe sono nel riepilogo. Nessun test locale è stato rilanciato: CI Studio2276, readiness2276 e golden path advisory1 non diventano automaticamente il gate locale2277.

Selezione compatta di15 file:3 JSON run,3 JSON jobs,3 ZIP GitHub originali completi,2 JSON commit, riepilogo, questo README e2 indici. I ZIP conservano tutte118 entry originali, senza selezionare duplicati normalizzati per ogni step. Le sole citazioni nel riepilogo sono derivate in memoria con ANSI/OSC/CSI rimossi e CRLF/CR normalizzati. Ogni entry originale è indicizzata con digest nel riepilogo; ZIP CRC e SHA256 dei file verificati.

`selection-publicable.json` elenca13 payload con digest e include anche se stesso/SHA256SUMS per un totale15. Gli indici non si auto-includono nel proprio hash. Nessun token o valore ambiente viene stampato nei riepiloghi; i log originali GitHub rimangono integri con il masking del provider.

Nessun nuovo test, rerun CI, deploy, commit o modifica a sorgenti/documenti repo durante questo task. Nessun blocco CI aperto nelle tre run archiviate.
