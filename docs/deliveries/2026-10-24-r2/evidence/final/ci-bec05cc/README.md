# PR301 — CI del freeze bec05cc

Entrambe le esecuzioni richieste sono SUCCESS: `ci`40137915671 (7 job) e `marketing-static`40137915753 (1 job). Head esatta: **bec05cc8172393b153b7d8ea56ae48f1afa95ef0**.

I checkout testano il merge PR301 **638f3465078bcdf39502f4ef5fc4f6f1a79ec644**, con parent base 6a81d870 e head bec05cc. Le API GitHub confermano lo **stesso tree ae21331acbf30c5e73f9db8a870bb44f5283bb9e** per merge e head: contenuto testato identico al freeze, pur con commit di checkout distinto.

| Job | Test effettivi | Runtime/caveat |
|---|---:|---|
| web (typecheck + test + build) |346 PASS,52 file |Node26.5.1; typecheck/build PASS |
| studio (typecheck + test + build) |2273 PASS,5 SKIP;210 file PASS/1 SKIP |Node22.23.3; profilo deterministico1worker; typecheck/build PASS |
| engine (pytest) |2654 PASS,29 SKIP |CPython3.12.3 |
| study-api (HTTP + shared Core) |951 PASS,30 SKIP,1warning |CPython3.12.3; altri12 unittest teaching-artifact PASS separati |
| study-mcp (official SDK stdio + HTTP) |23 PASS |CPython 3.13.17; SDK ufficiale stdio+HTTP verso Core temporaneo |
| marketing |9 unittest PASS |Browser custom:36 viewport check,3 engine completati |
| hygiene (NUL + secrets + boundary + whitespace) |SUCCESS |Metadati e log integrali conservati; non sommato alle suite applicative |

I conteggi API/Core ed Engine si sovrappongono: non sono un totale di test unici. Dettagli, righe dei log, jobID/URL, SHA e skip completi in `test-counts.json`.

Browser effettivi: nel job Web6 Playwright pubblici senza API (360/390/820/1440, rete statica, pausa/reset) e1 teacher-pathway su SQLite temporaneo. Nel job marketing12 larghezze320–1920 per Chromium148.0.7778.96, Firefox150.0.2 e WebKit26.4:36 check di larghezza e3 completamenti motore; non39test indipendenti o un totale di tutte le assert interne.

**Studio golden path: 1 PASS, lane advisory con continue-on-error.** Non è una prova browser bloccante e non è `eval/gate.sh`/`replay-check.sh`. Il job Studio CI ordinario esegue Vitest/typecheck/build; non va sommato1 al suo conteggio per rivendicare un gate replay. Nessun gate locale è stato rieseguito per questo archivio.

Skip: Studio5sono i controlli di screenshot locale assente nel runner pulito. Engine29:2 moduli senza psycopg,18 Supabase non configurato,4 LLM live non configurato,2 repo canonico sibling assente,2 alias filesystem,1 corpus dispense assente. API30:18 Supabase e12 convergenze PostgreSQL non configurate. Il warning API è la deprecazione Starlette/httpx, conservata. Nessuna di queste omissioni dimostra PG/remoto o beta cloud pronta. Lo step Web di upload evidenze `if:failure()` saltato è uno step condizionale, non un test saltato.

Archivio: JSON API originali run/jobs/commit,2 ZIPlog GitHub originali,107 entry originali gzip con byte preservati e107copie UTF-8 ANSI-free normalizzate. `log-entries.json` collega ogni entry al SHA dei byte originali e al derivato; `file-index.json` e `SHA256SUMS` indicizzano tutti i file salvo gli indici stessi. Normalizzazione descritta nell’indice entry; nessun log originale è stato riscritto o filtrato. I riepiloghi non espongono token o valori ambiente.

Review indipendente già letta: **nessun finding Core aperto entro lo scope C**. I6 file revisionati coincidono con i digest finali. Il P2intero JSON enorme è chiuso con probe immutato RED1→GREEN1 e regressione HTTP422/zero scritture; gli altri3 probe indipendenti passano. `review-status.json` conserva fonti, hash e limiti (non audit universale né PG/live). I2 finding UI root già documentati risultano risolti; non costituiscono ulteriori finding Core.

Nessun test, deploy, commit, sorgente o documento del repository modificato durante questo task. Solo lettura GitHub/local e scrittura di questo archivio in work.

**Selezione importata:** inGit sono conservati i due ZIP originali completi, i metadata e i riepiloghi. Le107copie gzip e le107viste normalizzate citate sopra rimangono nel work locale con indice; non sono duplicate nella selezione. I ZIP permettono di rileggere tutti i byte originali.
