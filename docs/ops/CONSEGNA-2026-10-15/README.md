# Consegna operativa Ardesia — 15 ottobre 2026

> Esito successivo verificato: [20PR chiuse senza merge,8issue not_planned,0/0aperte](CLOSEOUT.md). Il testo iniziale sotto precede pubblicazione e chiusure; il registro JSON ora contiene i readback conclusivi.


Fotografia alla chiusura richiesta dal proprietario. Il progetto resta in sviluppo:
questa consegna chiude l'esecuzione, non certifica V1 o l'integrazione di tutto il backlog.
Stato corrente del checkout: rigenerare `python3 bin/state/project_state.py`.
L'[inventario strutturato](inventory.json) fotografa PR/issue prima delle chiusure;
la cronologia GitHub rimane la fonte degli esiti effettivi successivi.

## Dove si trova il lavoro

- Main remoto osservato: `b124eee04acc8062c27284f23c5d9108e3767c27`.
- Checkpoint recuperato: `4237f197aabba61a7dc7a774281f16acc1f586b9`,
  tree `ede0944045a84e7d9678ff196566d72bdba93463`.
- Pubblicazione prevista: tag archivio **`archive/codex-finalization-20261015`**,
  con un commit figlio che aggiunge questi documenti e impedisce gli auto-deploy
  Git nelle configurazioni dell'archivio. **Non è una release, un branch operativo,
  un merge in main o una versione servita in produzione.** L'esito del push va letto
  dal tag remoto; alla scrittura è ancora pendente.
- Il vecchio checkout e tutti i branch originali sono conservati. Il suo HEAD
  mutabile non è stato attestato: la verifica riguarda precisamente gli otto
  commit storici recuperati e il nuovo checkout pulito, non una ricostruzione
  per supposizione dello stato di quel checkout.

Gli otto commit mantengono gli SHA originali e i tre merge locali a due parent.
La chiusura di tree e blob è stata verificata con gli hash Git e
`git fsck --connectivity-only --no-dangling` (exit0). Un tree intermedio non
residente è stato ricostruito solo accettando la combinazione che riproduceva
esattamente il suo SHA noto; un blob è stato recuperato dal file residente solo
quando lo SHA Git coincideva. I tentativi di recupero falliti sono conservati
separatamente: non sono test del prodotto.

Bundle incrementale verificato: `ardesia-recovered-eight-commits-complete.bundle`,
67.099 byte, SHA-256
`a40200878219f9af72022f22f8f655b917fcc08308c9468ce6be8043475e0c39`.
Richiede i quattro tip remoti già presenti: #259 `50aed925`, #243 `7c50d079`,
#244 `f44dccce`, #221 `ee597a19`. Non è dichiarato backup autonomo completo.
La pubblicazione Git del tag conserva gli otto commit direttamente su GitHub;
il bundle rimane una copia di recupero locale.

| Commit originale | Sviluppo preservato |
|---|---|
| `9800fe66e477060ca033b81785b632f4dfbebd41` | Errore apertura archivio continuità visibile; niente falsa assenza di sessioni |
| `5aa0740c4533dc5922db8226369edd24c92471bc` | Continuità degradata, senza farla apparire come salvataggio durevole |
| `a47cd69d3075c4d2274d5eaea1e8bdf6bdda8851` | Merge locale del recupero LED #243 |
| `e1216fd87dbb7dad05cfcf64a7b2ff35346402b0` | Merge locale advisory post-it reload #244 |
| `e6d6d5259bfbc6dce5f916a2bfabaa8edc27c526` | Merge locale copertura workflow PR impilate #221 |
| `fea12230c393e83b6b12807f9f4270f6b1f22c7c` | Append audit rifiutate contate senza far fallire un write-back già eseguito |
| `22e5a8bc64408639c0de4959162258ac4720b077` | Rifiuto conferma della memoria ELAB volatile |
| `4237f197aabba61a7dc7a774281f16acc1f586b9` | Persistenza identità dei collegamenti post-it |

Le prove/review locali precedenti restano nei receipt sotto `docs/ops/`
e nel registro Studio. Il recupero Git non le riesegue e non genera una nuova
prova runtime o di interoperabilità Kirchhoff/Ardesia. Le correzioni non sono
presentate come già in main. I contratti restano local-first, additive/migrate-safe,
con errori di persistenza visibili; niente PII/corpus o credenziali sono aggiunti.

## Protezioni ed effetti Git

Main richiede i tre check `studio`, `engine`, `hygiene`, una review GitHub
approvante e l'approvazione dopo l'ultimo push. Questi requisiti restano invariati;
la review avversaria separata non si spaccia per una review GitHub approvante.
Nessun bypass, force push, cancellazione di branch o merge viene usato.

Le due workflow versionate su main e nel checkpoint attivano push sul solo branch
main, più PR; non hanno un trigger tag/release né un job di deploy. Gli hook
repository osservabili sono assenti. Gli altri ruleset preservano branch/tag
storici e non vengono modificati. L'archivio aggiunge `git.deploymentEnabled:false`
a root, Studio e plugin ELAB: non modifica le configurazioni del main o un progetto
Vercel. La configurazione live del provider rimane inaccessibile (403); nessuna
pretesa di averla verificata o di aver ripristinato credenziali.

Secondo le [istruzioni Vercel sui tag](https://vercel.com/kb/guide/can-you-deploy-based-on-tags-releases-on-vercel),
un deploy da tag usa una workflow esplicita con CLI; qui non viene aggiunta.
La [configurazione Git Vercel](https://vercel.com/docs/project-configuration/git-configuration)
documenta la disattivazione degli auto-deploy. Queste sono le ragioni tecniche
per preferire la pubblicazione archivistica al push su un branch operativo;
non sono un'attestazione di integrazioni terze non osservabili.
Nessun deploy, alias, release, spesa o nuova credenziale è autorizzato da questa consegna.

## PR da archiviare senza merge

Inventario: **20 PR aperte**. Non si pretende equivalenza globale con il checkpoint.
Solo gli head221/243/244/259 sono suoi antenati; neppure questo prova che main
contenga le loro modifiche. Gli altri head restano sui rispettivi branch;
in particolare256/257/258 non vengono dichiarati assorbiti per somiglianza.
La richiesta del proprietario di terminare il lavoro dispone l'archiviazione
amministrativa senza merge, conservando descrizioni, AC, discussioni e branch.
Ogni futura implementazione deve riaprire il relativo ticket e ripetere i gate.

| PR | Oggetto | Head osservato | Relazione al recupero | Disposizione richiesta |
|---|---|---|---|---|
| [#212](https://github.com/AndreaMarro/ardesia/pull/212) | docs(session-2): evidence half of the session-2 branch, split from runtime | `cd7e12f310a9960961e3111047fc5b1beb76f0ef` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#213](https://github.com/AndreaMarro/ardesia/pull/213) | feat(simulation): runtime half of the session-2 hardening branch | `5fd5f1238c583c9ab4a29314173646a3dec21d01` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#216](https://github.com/AndreaMarro/ardesia/pull/216) | feat(dev-os): ARDESIA MCP total-control foundation | `c51a3f451220bb9a52ece914023e7a96fb437dec` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#221](https://github.com/AndreaMarro/ardesia/pull/221) | docs(ci): record why paths: is kept — STACKED PR, evidence for #220 | `ee597a19d469248dabe6f95af67851942c30fce9` | Head antenato del checkpoint4237; solo integrazione locale | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#240](https://github.com/AndreaMarro/ardesia/pull/240) | Ciclo 1 (draft, non fondere): F5-10 Nano R4 nel catalogo headless + PACK-01 la porta di chi riceve uno student pack | `3e76779f9a13bb6fd407c5396874c69c1a33d14a` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#241](https://github.com/AndreaMarro/ardesia/pull/241) | docs(product): riallinea ARDESIA al native spatial core | `fd36665f5dd65baa913904abb19aac01eae60ca9` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#243](https://github.com/AndreaMarro/ardesia/pull/243) | Il LED non dichiara OFF quando la risposta non c'è | `7c50d0793afa7c382f3a9cb562451481ee861df0` | Head antenato del checkpoint4237; solo integrazione locale | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#244](https://github.com/AndreaMarro/ardesia/pull/244) | ci(e2e): lane advisory separata per la spec che prova KERN-001 | `f44dccce0074d222862282c5c75ef7bf9951f311` | Head antenato del checkpoint4237; solo integrazione locale | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#247](https://github.com/AndreaMarro/ardesia/pull/247) | ci(lessico): «ARDESIA è per tutti» diventa un cancello, e l'oracolo misura | `cf7111f40ce85fecdcb4bc484a889e165a4b9cb6` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#248](https://github.com/AndreaMarro/ardesia/pull/248) | D2-J1: real Studio .lesson reaches the engine (+ hardening) | `5a040b6b5edfb26372c3fc65f8e4483d14418166` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#250](https://github.com/AndreaMarro/ardesia/pull/250) | D2-J3A: LessonOS snapshot to engine pedagogical facts | `f2c9563addc9c16cdc713fc98122d64c61267a6f` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#251](https://github.com/AndreaMarro/ardesia/pull/251) | D2-J3A.1: StudyDigest concept projection parity | `415bc11618bbae71b2fe9dca4870a808abd3a244` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#252](https://github.com/AndreaMarro/ardesia/pull/252) | D2-J3A.2: snapshot contract hardening (identity, labels, fail-closed) | `bfc09878e7016371b2bd34b4595390791039744d` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#253](https://github.com/AndreaMarro/ardesia/pull/253) | D2-J3A.3: re-ingest integrity + material convergence readiness | `36649003457554b6e0d83d82153032cd8d1cd11f` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#254](https://github.com/AndreaMarro/ardesia/pull/254) | D2-J3B: hybrid lesson material (solutions + digest errors, deterministic) | `dfb801cf22648d93b80be7835add8994e380ebf1` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#255](https://github.com/AndreaMarro/ardesia/pull/255) | D2-J3C: provisional offline browser-PDF export for SummaryPack | `7af8f51ca958f395544af79f0a39cbc3d03c82c7` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#256](https://github.com/AndreaMarro/ardesia/pull/256) | D2 lesson material: candidato verificato; continuazione R-01–R-04 in #257 | `705284acc4322db4d241032de071437ab0473cc1` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#257](https://github.com/AndreaMarro/ardesia/pull/257) | fix(recap): isolate lesson memory and publish reviewed restart evidence | `1c3f546a709d1004e291d5938073d6a5b7ecf8db` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#258](https://github.com/AndreaMarro/ardesia/pull/258) | Postlesson export integrity (A/B/C) | `f155d37fbd587cdfb3ce8b8e33f5352f77d37c10` | Head non antenato del checkpoint4237; nessun assorbimento globale dimostrato | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |
| [#259](https://github.com/AndreaMarro/ardesia/pull/259) | Ardesia: shared lessons, portable PDFs and CircuitCheck DC/AC/Laplace | `50aed925d44542f923687c186fde7034b1dba1fd` | Head antenato del checkpoint4237; solo integrazione locale | Chiusura senza merge richiesta; lavoro preservato/non integrato in main |

## Issue e debiti non risolti in main

L'endpoint issues includeva anche20PR: le issue effettive sono **8**, non28.
La chiusura richiesta è `not_planned`/archiviazione di questa esecuzione,
non `completed`: correzioni locali, requisiti non implementati e verifiche mancanti
restano distinguibili. Il testo originale di ciascuna issue conserva gli AC.

| Issue | Oggetto | Stato tecnico | Disposizione richiesta |
|---|---|---|---|
| [#92](https://github.com/AndreaMarro/ardesia/issues/92) | corpus: v2-cap9-esp2 — pinAssignments referenzia r3/r4/r5 MAI dichiarati (4° bug corpus, non nel canon §1.4) | Pin del corpus non rivalutati; nessun accesso a dati personali/holdout | Archiviazione `not_planned` richiesta; non è un fix |
| [#190](https://github.com/AndreaMarro/ardesia/issues/190) | ARDESIA V1 — Control plane e integrazione 2026-07-13 | Control plane V1 non completato | Archiviazione `not_planned` richiesta; non è un fix |
| [#215](https://github.com/AndreaMarro/ardesia/issues/215) | [DevOS] Total-control MCP + Codex App Server + scheduled anti-drift control plane | Piano DevOS non completato | Archiviazione `not_planned` richiesta; non è un fix |
| [#245](https://github.com/AndreaMarro/ardesia/issues/245) | KERN-001 / L-04: sim-duplicate-instance è un falso verde — copy e paste incatenati senza attendere l'effetto | KERN-001 completo non dimostrato | Archiviazione `not_planned` richiesta; non è un fix |
| [#246](https://github.com/AndreaMarro/ardesia/issues/246) | Perdita di dati: un errore marcato in ElabLab si perde se si cambia vista subito (4 corse su 5) | Correzione locale della memoria volatile; intera issue non provata risolta in main | Archiviazione `not_planned` richiesta; non è un fix |
| [#249](https://github.com/AndreaMarro/ardesia/issues/249) | [D2 debt] Downstream + CLI + perf follow-ups of the .lesson junction | Follow-up CLI/performance downstream non globalmente completati | Archiviazione `not_planned` richiesta; non è un fix |
| [#260](https://github.com/AndreaMarro/ardesia/issues/260) | Recuperare la gestione del rigetto di apertura storage nella Continuità (#259) | Correzione candidata nei commit9800/5aa; main non aggiornato | Archiviazione `not_planned` richiesta; non è un fix |
| [#261](https://github.com/AndreaMarro/ardesia/issues/261) | Continuità: archivio corrupt/data-loss non deve apparire privo di sessioni | Correzione candidata nei commit9800/5aa; main non aggiornato | Archiviazione `not_planned` richiesta; non è un fix |

## Lettura e ripresa

Il [vecchio indice di ripartenza](../../START-HERE.md) e i receipt precedenti sono
storici. La [fotografia generata sul checkpoint](generated-checkpoint.md) è offline:
PR/check del generatore sono UNAVAILABLE, mentre l'inventario di questa cartella
proviene da una lettura GitHub distinta e datata. Il generatore conta **0/88
esperimenti certificati**:4/88candidate non significa4certificati. Le117spec
presenti non sono117spec appena eseguite. La produzione servita ora non è misurata.

Per riprendere: checkout del tag, rigenerare lo stato, riaprire il ticket pertinente,
verificare protezioni/effetti di pubblicazione e rifare requirement→controesempio→
modifica minima→test→review separata→CI exactSHA→merge consentito→main verificato.
Nessun criterio viene considerato soddisfatto dalla sola chiusura amministrativa.

## Limiti specifici da preservare dopo la chiusura

Questo triage conserva le riserve della review separata; non aggiunge test o
un assorbimento semantico globale. Gli AC dettagliati rimangono nei ticket
originali e nelle review/receipt collegati.

| Fonte | Limiti e prossima accettazione tecnica |
|---|---|
| [PR#212](https://github.com/AndreaMarro/ardesia/pull/212) | Session-2: preservazione byte storica non certifica i contenuti e i claim. |
| [PR#213](https://github.com/AndreaMarro/ardesia/pull/213) | Runtime simulation: solo slice audit/board e link identity in fea12230/4237; intero head non assorbito, altri file/oracoli non completati. |
| [PR#216](https://github.com/AndreaMarro/ardesia/pull/216) | DevOS/control plane: READY_FOR_HUMAN_REVIEW è storico; nessuna attivazione o automazione nuova. |
| [PR#221](https://github.com/AndreaMarro/ardesia/pull/221) | Commenti workflow: recupero locale, nessuna nuova protezione required. |
| [PR#240](https://github.com/AndreaMarro/ardesia/pull/240) | NanoR4 headless/StudentPack: body non-fondere; pin/runtime/firmware/roundtrip e decisioni di navigazione/re-ingest ancora distinti. |
| [PR#241](https://github.com/AndreaMarro/ardesia/pull/241) | Proposta native-first: chiusura non ratifica visione o policy AI. |
| [PR#243](https://github.com/AndreaMarro/ardesia/pull/243) | LED/corrente sconosciuti senza risultato: adattamento locale, goldens distinti; caller legacy/famiglie/hardware non certificati. |
| [PR#244](https://github.com/AndreaMarro/ardesia/pull/244) | Advisory post-it reload: adattamento locale discriminante; non certifica KERN-001 completo o CI del tag. |
| [PR#247](https://github.com/AndreaMarro/ardesia/pull/247) | Gate lessicale WAITING_AUTHORITY/NEEDS_FIX: regola globale non ricostruita in fonte canonica; deroga in stringhe quotate bypassabile. Non attivare il gate. |
| [PR#248](https://github.com/AndreaMarro/ardesia/pull/248) | Bundle Studio: sicurezza archive/member/schema e follow-up249 ancora validi. |
| [PR#250](https://github.com/AndreaMarro/ardesia/pull/250) | LessonOS→fatti pedagogici: proiezione deterministica preservata, non dichiarata assorbita. |
| [PR#251](https://github.com/AndreaMarro/ardesia/pull/251) | StudyDigest: parità di proiezione concetti non nuovamente provata. |
| [PR#252](https://github.com/AndreaMarro/ardesia/pull/252) | Snapshot fail-closed: mantenere AC delle fixture negative, etichette vuote e tipi bool/seq. |
| [PR#253](https://github.com/AndreaMarro/ardesia/pull/253) | Compensazione re-ingest/transazioni Store: atomicità generale e concorrenza non certificate. |
| [PR#254](https://github.com/AndreaMarro/ardesia/pull/254) | Appendice grounding deterministica e narrativa LLM preesistente: collisione con ZERO-LLM da risolvere prima di promozione; mock non prova conformità. |
| [PR#255](https://github.com/AndreaMarro/ardesia/pull/255) | Export PDF e composition root: retention/seam ingest da preservare; nessun confronto semantico completo. |
| [PR#256](https://github.com/AndreaMarro/ardesia/pull/256) | D2 .lesson→Engine→materiale→PDF: review circoscritta, user-action/flush e intero prodotto non provati da questa chiusura. |
| [PR#257](https://github.com/AndreaMarro/ardesia/pull/257) | Isolamento memoria e R-01–R-04: workflow parziale, pilot non eseguito. |
| [PR#258](https://github.com/AndreaMarro/ardesia/pull/258) | Acquisizione export/reservation/append: head non antenato; nessun assorbimento globale dimostrato. |
| [PR#259](https://github.com/AndreaMarro/ardesia/pull/259) | Lezioni condivise/PDF/CircuitCheck: fondazione candidata locale, non workflow completo certificato o prova di main. |
| [Issue#92](https://github.com/AndreaMarro/ardesia/issues/92) | PinAssignments e ambito corpus non rivalutati; nessuna lettura/modifica del corpus o dei dati personali. |
| [Issue#190](https://github.com/AndreaMarro/ardesia/issues/190) | REPLAN_REQUIRED storico, fallimenti Alt-drag/binding e V1_GREEN=false; nessun quarto tentativo o decisione umana inventata. |
| [Issue#215](https://github.com/AndreaMarro/ardesia/issues/215) | Requisiti/schema/mailbox storici conservati; chiusura amministrativa non prova shutdown di controller/processi/scheduler sul Mac mini. |
| [Issue#245](https://github.com/AndreaMarro/ardesia/issues/245) | Oracolo copy→effetto osservabile→paste, uscita da skip e cinque suite complete non ottenuti; nessun fix tecnico dichiarato. |
| [Issue#246](https://github.com/AndreaMarro/ardesia/issues/246) | 22e5a8bc corregge la slice ACK/fallback; il burn-in completo e tutti i caller/durabilità non sono certificati, una serie5+5 non discriminante non conta. |
| [Issue#249](https://github.com/AndreaMarro/ardesia/issues/249) | CLI/performance/downstream e provider live non globalmente completati; collisione ZERO-LLM resta. |
| [Issue#260](https://github.com/AndreaMarro/ardesia/issues/260) | 9800fe6: opener rejection/scope/cleanup/loading→failure; recupero date/ordine separato non implementato. |
| [Issue#261](https://github.com/AndreaMarro/ardesia/issues/261) | 5aa0740: corrupt/data-loss e loader degradato; non main e non canonico; mantenere cause e AC non distruttivi. |
