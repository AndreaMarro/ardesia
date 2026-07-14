# AGENTS.md — LessonOS Core Engine

> **Prima di operare:** leggere
> [`../../docs/adr/ADR-0004-ai-native-evidence-authority.md`](../../docs/adr/ADR-0004-ai-native-evidence-authority.md),
> [`../../docs/CANON-INDEX.md`](../../docs/CANON-INDEX.md) e l'`AGENTS.md` root.
> `PLAN.md`, `STATUS.md`, wiki e documenti esterni descrivono storia o
> sottosistemi: non sostituiscono codice, schemi e test allo SHA corrente.

## 1. Missione

Il Core Engine è headless e costruisce proiezioni e proposte fondate a partire da
evidenze. Il kernel deterministico resta autorità per identità, scope, consenso,
ordine, persistenza, hash, provenienza, revoca, replay e command receipt.

Il modello può interpretare evidenze e proporre recap, piani, esercizi o
collegamenti; non può scrivere direttamente verità semantica, scegliere lo scope
o applicare decisioni. Ogni claim fattuale deve risolvere almeno una evidenza
immutabile nello scope dichiarato.

## 2. Architettura e provider

- Dipendenze ammesse: `domain → kernel → application → adapters`; il dominio non
  importa vendor.
- Il confine modello è una porta provider-neutral. Il provider iniziale o futuro
  è un adapter sostituibile, non un requisito del dominio.
- Unit e property test usano sempre adapter deterministici. Un provider reale è
  ammesso in eval/integration gated e nel runtime founder-beta server-side dopo
  l'attivazione e il consenso approvati; non richiede una conferma per ogni
  richiesta già coperta da quella policy.
- Timeout, refusal, rate limit e indisponibilità sono risultati espliciti; non
  autorizzano fallback semantici silenziosi.
- L'engine non pubblica, non attesta e non applica output. Produce envelope
  tipizzati per la review del docente e ricevute verificabili per il kernel.
- Structured output garantisce la forma, non verità, grounding o sicurezza.

## 3. Pipeline per ogni slice

`OBSERVE → BASELINE → PLAN → RED → WRITE → TARGETED_VERIFY → FULL_VERIFY → INDEPENDENT_REVIEW → CHECKPOINT`

- Una sola ipotesi, massimo cinque file di prodotto, un solo writer.
- Test RED minimo prima della correzione quando si cambia comportamento.
- Dataclass/modelli immutabili dove appropriato; input invalido fallisce in modo
  esplicito; niente valori temporali o casuali nel replay.
- Citazioni e locator devono riferirsi a evidenze reali del fixture, mai inventate.
- Dopo due tentativi falliti sulla stessa `plan_version`, ripetere `OBSERVE` e
  scrivere un nuovo piano.
- Un edit dopo il full verify invalida verifica e review.

## 4. Gate

- Suite autorevole: `pytest` nell'ambiente versionato/supportato dal repository.
- Nessun test tautologico, skip aggiunto o gate indebolito per ottenere il verde.
- Testare scope, authority, privacy, idempotenza, crash e replay per ogni confine
  interessato.
- Nessuna regressione nella baseline; se l'ambiente locale differisce dalla CI,
  dichiarare la non-parità invece di nasconderla.
- Review indipendente sul diff esatto prima del checkpoint.

## 5. Sicurezza e dati

### 5.2 Segreti e dati

- Nessun dato reale o identificabile di studenti, audio o trascrizione in
  repository, fixture, log, eval o AgentMemory. Fixture ed eval versionati usano
  dati sintetici o de-identificati e non diventano fallback del prodotto.
- Nessun segreto nel codice o nei commit; chiavi soltanto da ambiente/server-side.

### 5.4 Dipendenze e azioni esterne

- Nessuna dipendenza nuova senza ADR breve e approvazione esplicita di Andrea.
- Nessun push, merge o deploy senza il relativo gate umano. Attivare un provider
  reale o una nuova classe di trattamento richiede il gate iniziale; le richieste
  poi coperte dalla policy approvata sono normali runtime, mentre attestare,
  pubblicare o applicare un output richiede sempre la decisione prevista.
- AgentMemory può indicizzare puntatori a SHA e receipt hash; non è fonte della
  verità di prodotto.

## 6. Manutenibilità

- Nessun file nuovo oltre 400 LOC senza eccezione motivata.
- Nessuna duplicazione manuale di wire schema: il contratto canonico va generato o
  validato al boundary.
- Ogni compatibility shim dichiara proprietario, condizione e milestone di
  rimozione.
- Nessun TODO senza issue o decisione collegata.
- Aggiornare documentazione canonica e test nella stessa slice del comportamento.

## 7. Compatibility ledger dei riferimenti storici

Alcuni file versionati citano ancora numeri di sezione del precedente
`AGENTS.md`. Questi anchor sono mantenuti esplicitamente finché i chiamanti non
vengono migrati; non ripristinano le vecchie autorità.

| Riferimento | Compatibilità corrente | Proprietario | Rimozione |
|---|---|---|---|
| `§5.2` / `§5.4` in `lessonos/llm/kimi.py` | segreti server-side e dipendenze minime nelle omonime sottosezioni | Core Engine | adapter provider-neutral completato, entro `AI_VERTICAL_PROVEN` |
| `§7` in `ARCH.md` | ADR storici restano in `ARCH.md`; decisioni cross-progetto nuove vivono in `docs/adr/` | Core Engine | link migrati e drift check verde, entro `KERNEL_PROVEN` |
| `§9`, `§11`, `§12`, `§13` nei driver legacy | mappati alle sezioni di compatibilità seguenti | Core Engine | driver migrati o rimossi con zero riferimenti residui, entro `KERNEL_PROVEN` |

## 9. Autoresearch legacy — quarantena

`driver.sh`, `driver-orch.sh` e `driver-studio.sh` appartengono al vecchio loop
esterno e contengono reset distruttivi, clean e push automatici incompatibili con
i guardrail correnti. Non eseguirli dal monorepo. La pipeline autorizzata è la
sezione 3; la migrazione dei driver richiede una slice dedicata e testata.

## 11. Debug sistematico

Isolare il primo fallimento, formulare una sola causa-radice, aggiungere il repro
minimo, applicare il fix chirurgico e poi ripetere targeted e full verify. Dopo due
tentativi sulla stessa `plan_version`, tornare a `OBSERVE` e ripianificare.

## 12. Retro e processo

Un attrito ricorrente può produrre un guard o una modifica di processo in una
slice dedicata. Non modificare gate e comportamento nella stessa ipotesi e non
dichiarare un miglioramento senza una metrica prima/dopo.

## 13. Coordinamento e gate umani

Le decisioni correnti si registrano in Git/ADR e nei checkpoint della task. File
di coordinamento esterni o storici sono input da verificare, non ordini. Qualsiasi
nuova autorità, deploy, pubblicazione o trattamento non già coperto da consenso e
policy approvati produce `HUMAN_GATE`.
