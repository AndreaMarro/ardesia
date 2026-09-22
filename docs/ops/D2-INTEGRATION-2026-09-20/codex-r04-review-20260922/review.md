# R-04 — review indipendente Codex, 22 settembre 2026

**REQUEST_CHANGES**, un finding P2 documentale. Le quattro correzioni di
contenuto sono supportate dalle fonti; la patch aggiunge però errori nel gate
che la scheda richiedeva verde. Il candidato non viene modificato dalla review.

## Identità

- Builder: Muse/OpenCode, modello/effort dichiarati inherited/unknown.
- Reviewer: Codex, autore diverso dal builder; runtime inherited/unknown.
  Nessun subagent o self-approval. La precedente preparazione del mandato
  da parte di Codex è contesto condiviso, non indipendenza totale.
- Base: af46e658e94bc32eaf80295984dc4938ea76972c.
- Patch: b2eddaf3f02c3e20c45c74507b99a18de40f16a0.
- Evidence head: 0149c7ff2e6def35f8d4c983ebfc04a99437a785.
- Worktree: /Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921,
  branch codex/restart-review-postlesson-20260921, inizialmente pulito.

## F-R04-01 — nuovi errori nel gate documentale, P2

Evidenza al candidate: README D2 righe 55 e 60; handoff riga 30;
scheda R-04 righe 26, 32, 42–45. Il checkpoint successivo, riga 44,
raggruppa i fallimenti come stessa classe di quelli della baseline, ma
questa classificazione non dimostra assenza di regressione.

La review esegue lo stesso gate immutato, nello stesso ambiente e dalla stessa
root, su copie byte-identiche lette da Git ai due SHA. Separa i documenti
preesistenti dalle nuove schede, senza confrontare insiemi di file diversi:

| Insieme controllato | Exit | Rilievi paths |
|---|---|---|
| README D2 + handoff + exclusions alla base | 1 | 16 |
| Gli stessi tre file al candidate | 1 | 20 |
| Tre file candidate + nuova scheda R-04 | 1 | 26 |
| Nuovo checkpoint, separatamente | 1 | 11 |

I quattro rilievi aggiunti ai file esistenti sono tre in README (due riferimenti
al repair, uno al diff semantico) e uno nel handoff (repair). Si aggiungono
sei rilievi nella scheda e undici nel checkpoint. Non sono tutti preesistenti.
Il problema è la forma dei riferimenti abbreviati rispetto alla root attesa
dal gate; i file citati esistono nel pacchetto. Non è una perdita di dati o un
difetto del prodotto.

Il gate senza argomenti passa, ma i suoi glob includono soltanto i documenti
del loop e lo stato generato; non controlla questi cinque Markdown D2.
Quel verde non sostituisce la verifica mirata richiesta dal mandato e dalla
scheda pre-patch. Il finding è introdotto nei nuovi riferimenti; i sedici
precedenti sono debito ereditato, distinto dal peggioramento.

**Correzione richiesta:** rendere i riferimenti verificabili dalla root,
usando percorsi di repository corretti o collegamenti Markdown risolvibili.
Rieseguire il gate esplicitamente sui cinque Markdown della consegna, risolvendo
anche i riferimenti ereditati nei documenti già toccati; non cambiare gate,
allowlist o criteri. Preservare gli esiti storici exit 1, aggiungendo il nuovo
risultato con comando, exit e SHA, senza dichiarare retroattivamente verdi
le esecuzioni del builder. Poi nuova review circoscritta del commit correttivo.

## Controlli indipendenti riusciti

- A: API required_status_checks di main riletta il 22 settembre; richiesti
  Studio, Engine e hygiene. L'API delle regole applicabili restituisce lista
  vuota. D2 e golden path non risultano richiesti. Nessuna protection modificata.
- B: README/handoff ora mantengono PARTIAL globale, coerente con repair e
  ledger; non c'è una nuova promessa di flush o durabilità globale.
- C: il diff reale del summarizer tra source 7af8f51c e prodotto D2 b7f75e9d
  conferma il separatore prima dell'appendice F-03. Il confronto semantico
  congelato resta byte-identico. Il ledger modifica soltanto semanticDiff;
  gli altri campi, compresi SHA e verdicti, sono invariati.
- D: proprietà ack portata e baggage escluso sono ora distinti. Il donor
  3ee18131 contiene sia il callback dopo append sia lo spostamento della
  conferma UI, oltre a workflow/spec/e2e esclusi dalla proprietà portata.
- Albero YAML e tutte le righe non di commento identici prima/dopo; nessuna
  modifica in apps, packages o bin. Receipt R-01/R-02/R-03/R-03b invariati.
- Gate workflow, boundary e controllo spazi del diff candidate: exit 0.
  Boundary mantiene i 12 offender storici, senza aggiunte.

PR #256 resta OPEN/DRAFT, head 705284acc4322db4d241032de071437ab0473cc1,
base/main b124eee04acc8062c27284f23c5d9108e3767c27, zero review sottomesse.
Nessuna CI remota del candidate locale viene rivendicata.

## Prove e limiti

[Risultati strutturati](results.json), [comandi reali](commands.json),
[sorgente del probe](run.py.txt) e [originali completi](raw-evidence.zip).
L'archivio conserva stdout/stderr diretti e copie dei testi ai due SHA, senza
ripulire i fallimenti; hash in [manifest](SHA256SUMS). Per riprodurre il probe,
copiare il sorgente nella cartella artifacts/restart/r04-review con nome run.py
in un checkout all'evidence head, usando la venv Engine già predisposta.

Python 3.13.14, PyYAML 6.0.3. Le chiavi provider sono rimosse dai processi
di verifica. Suite Studio/Engine, browser, build e PDF non rieseguiti:
non necessari a questa review di documenti/commenti. Le prove del builder
restano distinte; nessuna pretesa di qualità didattica o workflow completo.

**Unica prossima azione:** Muse corregge i riferimenti della consegna R-04
e aggiunge il nuovo esito del gate mirato; Codex revisiona il nuovo SHA.
R04_INDEPENDENT_REVIEW=REQUEST_CHANGES.
MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

Receipt capability: unità r04-independent-review-20260922;
persistent-capability-evolution riusata localmente, inherited/unknown,
nessuna quota modelli o risparmio token misurato rivendicati. Preregistrazione,
receipt e prossimo gate aggiunti senza riscrivere la storia. Nessuna promozione
o riscrittura degli oracoli; INDEX_SYNC_DEFERRED. Nessun vault, Basic Memory,
AgentMemory o lavoro Kirchhoff.
