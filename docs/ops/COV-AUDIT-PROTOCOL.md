---
id: ardesia-cov-audit-protocol
status: active
freshness: 2026-07-15T01:12:57+02:00
baseline_sha: 33c2d0cfaad480f6ed8e2a8f989802ace3d29de1
authority: verification-contract
---

# Ardesia — protocollo CoV e audit per ogni sessione

## Linguaggio probatorio

Ogni claim usa uno stato solo:

| Stato | Significato |
|---|---|
| `VERIFIED` | riprodotto sul candidato indicato con comando/artefatto e limite |
| `REPORTED` | presente in un audit, chat, CI o altro worktree ma non riprodotto qui |
| `INFERRED` | conclusione ragionata, dichiarata come tale |
| `UNKNOWN` | evidenza assente o non risolvibile |
| `RED` | criterio falsificato da una prova riproducibile |
| `DEFERRED` | fuori scope o dietro gate esplicito |

Un HTTP 200, una build, un unit test, un mock o un output LLM non dimostrano da
soli un flusso end-to-end.

## Opening CoV

Prima di scegliere il lavoro registrare:

1. repository root, branch, HEAD, tree e status hash;
2. `origin/main`, ahead/behind, upstream, remote branch e PR associata;
3. worktree, writer/processi concorrenti, lock e diff non attribuibili;
4. istruzioni applicabili e digest dell'ADR north-star;
5. ultimo receipt e freshness dell'indice Obsidian;
6. stato di dismissione AgentMemory e benchmark del sostituto, senza usare il
   servizio legacy;
7. PR/check/deployment live pertinenti, solo read-only;
8. test baseline necessari alla slice;
9. debito, known-red e gate umani ereditati;
10. budget rimanente e stop conditions.

L'identità di un candidato non committato è:

```text
HEAD
+ git status --porcelain=v1
+ SHA-256 del diff binario
+ manifest path/dimensione/SHA-256 degli untracked
```

## CoV della slice

Il piano dichiara prima dell'edit:

- claim da dimostrare e claim esclusi;
- test RED o falsificazione prevista;
- caso nominale, negativo e regressione;
- reload/persistenza/recovery quando pertinenti;
- boundary reale, non solo helper o harness;
- comandi targeted e full;
- baseline numerica che non può diminuire;
- rollback e stato terminale.

I comandi vengono eseguiti senza pipe che possano mascherare l'exit code.
Pass, fail e skip vengono riportati separatamente. Per una UI si aggiungono
accessibilità, input touch/tastiera, viewport iPad/LIM e reduced motion. Per
storage si aggiungono concorrenza, crash, quota, scope e replay. Per AI si
aggiungono schema, citazioni, leak cross-scope, revoca e provider failure.

## Audit sempre obbligatorio

Anche se non viene scritto codice, la sessione produce un audit breve:

| Asse | Domanda falsificabile |
|---|---|
| Coerenza | il claim coincide con canone, runtime, test, documento e SHA? |
| Manutenibilità | aumenta file grandi, duplicazioni, provider import o seconde fonti? |
| Integrazione | chiude un confine reale o aggiunge un percorso parallelo? |
| Sicurezza/privacy | espone secret, PII, minori, contenuto didattico o autorità impropria? |
| Affidabilità | fallimento, offline, retry, recovery e rollback sono visibili? |
| UX | Andrea può capire stato, evidenza, errore e azione successiva? |
| Scienza | distingue utilità, correttezza e apprendimento senza overclaim? |
| Operazioni | candidato, CI, artefatto e runtime sono collegati all'esatto SHA? |

L'audit registra inoltre: agenti/ruoli realmente usati e separazione writer;
fonti riusate o scartate con motivazione; health/exact-SHA del Mac Mini; stato
GitHub/WIP; metrica prima/dopo dell'eventuale proposta di auto-miglioramento;
uso iniziale e delta finale di Obsidian. L'indisponibilità non viene nascosta.

Ogni finding ha severità, evidenza, confidenza, owner, criterio di chiusura e
azione `fix | replan | defer | human_gate`.

## Closing CoV

Il release verifier indipendente controlla dopo l'ultimo edit:

- file toccati entro scope e massimo cinque;
- diff e untracked attribuibili;
- test RED→GREEN e full verify sull'esatto candidato;
- nessun test rimosso, skip aggiunto o gate indebolito;
- review indipendente successiva all'ultimo edit;
- documentazione canonica aggiornata nella stessa slice del comportamento;
- branch, HEAD, tree, status/diff hash e receipt;
- `state.json.context_manifest[]` completo: hash ricalcolati, authority,
  freshness, classificazione, producer, scope, privacy, observed time e
  decisione di riuso/scarto coerenti;
- tutti i nove artefatti presenti; il manifest esclude se stesso e valida gli
  altri otto; la root è regolare, non symlink, contenuta in `roots/` e coincide
  per `run_id`, path e SHA-256 del manifest;
- per ciascun vendor applicabile: `authority_current`, costo zero, progetto e
  regione, prerequisito tecnico, synthetic-only/no-PII, deny-by-default,
  riferimento al secret, rollback e assenza di termini o spesa;
- non-claim, rischi, debito e gate umano;
- assenza di push, merge, deploy o trasmissioni non autorizzate.

Un commit locale viene creato solo dopo il closing CoV verde. Qualunque edit
successivo invalida il verdetto e richiede una nuova verifica.

Il closing CoV ha due gate: verifica/review pre-commit del candidate tree e,
dopo l'eventuale commit locale, identity gate del release verifier. Quest'ultimo
registra commit SHA e tree, prova che `HEAD^{tree}` coincide byte-per-byte con il
tree già verificato e ricontrolla status e untracked. `APPROVED_LOCAL` non è
disponibile prima del secondo gate. Qualunque hook, edit o tree mismatch
invalida il verdetto e richiede un nuovo closing CoV e un nuovo full verify.
Ogni campo vendor applicabile non verificato fa fallire il gate in modo chiuso;
il valore del secret non viene mai acquisito. Un errore nei nove artefatti,
manifest o root vieta sempre `APPROVED_LOCAL`, non soltanto durante il canary.

## CoV pre-avvio del 15 luglio 2026

Snapshot locale verificato alle `2026-07-15T00:30:15+02:00`:

- worktree canonico senza diff di prodotto:
  `/Users/andreamarro/VOLUME 3/ardesia-wt-ai-native-governance`; durante la
  slice Obsidian ha modificato due propri settings, preservati fuori dallo stage;
- branch `codex/ardesia-ai-native-governance-20260714`;
- HEAD `33c2d0cfaad480f6ed8e2a8f989802ace3d29de1`;
- `origin/main` `91ec22eda16cf4ed12e14c565358dedc3656979f`;
- candidato 11 commit avanti e 0 indietro, senza remote branch o PR associata;
- 40 worktree registrati, 40 branch locali non integrati rispetto a
  `origin/main`, 18 PR aperte: 3 su `main` e 15 impilate;
- una sola automazione Codex osservata, ma ancora `PAUSED` e con contratto
  obsoleto da cinque sessioni di 40 minuti;
- Studio verificato nella sessione precedente: 1607 pass / 5 skip, typecheck e
  build verdi; engine: 2044 pass / 7 skip nel profilo CI esatto;
- AgentMemory `DEGRADED / RETIREMENT_DECIDED / NO-READ / NO-WRITE`: heap
  96–96,2%, 931/949 summarize falliti, versioni service/worker divergenti,
  REST senza auth e MCP avviato da package non pinning;
- Mac Mini `REACHABLE / SHA_MISMATCH / DEFERRED`: repo pulito sul branch
  `session/long-2026-06-25` a `b6de567324db7b05e1a659bd88760e0b39aa0dc4`,
  diverso dal candidato; due processi build/test osservati, quindi nessun job
  o writer è stato avviato sul Mini;
- Sentry, Storybook e Chromatic non integrati; CodeRabbit CLI `0.6.5`
  installata ma `AUTH_REQUIRED / BLOCKED_EXTERNAL`; PostHog
  espone solo il progetto ELAB preesistente, non un progetto Ardesia dedicato;
  Vercel privo di prova remota sul candidato; Render `DEFERRED`;
- `sendDefaultPii=false` resta canonico ma da solo è insufficiente. L'evidenza
  SDK corrente su opt-out `dataCollection`, `beforeSend` allowlist, niente
  Replay/allegati/tracing e transport spy è `REPORTED` e blocca l'integrazione
  finché una slice dedicata non riconcilia il contratto privacy;
- un token credential-shaped è stato rilevato in un allegato storico: non è
  stato copiato o allegato; la fonte è esclusa e la rotazione resta un gate di
  sicurezza umano.

Il report `PRODUCT-READINESS-AUDIT-2026-07-15.md` riguarda un altro worktree e
un'altra baseline (`755179c8`): i suoi finding restano `REPORTED` per questa
linea finché non vengono riprodotti.

### Otto domande di convergenza

| Domanda | Stato pre-avvio | Evidenza mancante |
|---|---|---|
| Canon rispettato end-to-end? | `RED` | contratti 1→7 e founder path non completati |
| Una sola fonte di verità? | `PARTIAL` | knowledge unificata; wire contract e runtime ancora separati |
| Andrea completa e riprende una lezione reale? | `UNKNOWN` | beta iPad con evidenza e recovery |
| Evidenze, materiali e software coincidono? | `UNKNOWN` | manifest, citazioni e audit reali di lezione |
| Bundle/runtime affidabile? | `PARTIAL` | CI remota, WebKit/iPad, exact deployment e restore |
| Incidenti osservabili e reversibili? | `UNKNOWN` | Sentry, release mapping e rollback drill |
| Minori e dati trattati coerentemente? | `PARTIAL` | policy definite; enforcement e test live assenti |
| Efficacia pedagogica migliorata? | `UNKNOWN` | A0/B0/B1 e successivo studio H3 |

Esito: `0 YES / 3 PARTIAL / 5 RED-UNKNOWN`. L'automazione può essere attivata
come processo di convergenza fail-closed; non è autorizzata a dichiarare
`ENGINEERING_READY` o ad aprire nuovo WIP di prodotto nelle condizioni correnti.
