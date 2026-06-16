# Allineamento dei due Claude (SSOT)

Fonte: `~/ardesia-wiki/Architettura/ARDESIA-ALIGNMENT.md` sez. 4, `ARDESIA-ARCHITECTURE.md`, audit:alignment.

## Fonte di verita unica
La fonte di verita e: il file di allineamento (`ARDESIA-ALIGNMENT.md`) + `COORDINATION.md` (kernel REGOLE PERMANENTI + pin) + la memoria supervisore (`~/maestro-docs/SUPERVISOR-MEMORY.md`).
- Supervisore (MacBook, puo essere assente) e Autonomo (Mini, audit) condividono questo file: quando il supervisore non c e, l audit agisce con lo stesso contesto e gli stessi vincoli.
- Brain (pianifica) e Builder (esegue) leggono entrambi questo file: piano ed esecuzione partono dalla stessa visione.
- I prompt dei builder e l audit "puntano qui via AGENTS.md". La chat Telegram supervisore carica questo contesto.

## Contraddizione aperta (verificata, NON risolta nei file)
La carta (`ARDESIA-ALIGNMENT.md`, 13/06) afferma: builder = **opus-4-8** (-> sonnet); DeepSeek builda SOLO come fallback quando i Claude Max sono out; "i vecchi AGENTS.md che dicono DeepSeek-builder sono STALE".
Ma gli AGENTS.md operativi dicono ANCORA "DeepSeek = ORCHESTRATORE PRINCIPALE + BUILDER":
- Mini: `~/lessonos/AGENTS.md`
- Mirror MacBook: `~/maestro-mirror/lessonos/AGENTS.md`, `~/maestro-audit/orch/AGENTS.md`
La carta dichiara "i prompt puntano qui via AGENTS.md", ma gli AGENTS.md NON puntano alla carta. La SSOT e dichiarata, non implementata: chi legge l AGENTS.md prima della carta riceve l istruzione vecchia.

## Come va risolta (raccomandazione, non ancora applicata)
L economia (audit R3, vedi [[Routing-Modelli-e-Costi]]) dice che dal 15/06 builder=opus e insostenibile per il loop headless. Quindi la risoluzione corretta NON e allineare gli AGENTS.md alla carta, ma il contrario sull economia: builder economico (DeepSeek/Kimi) + Opus riservato a planning/synthesis/escalation, come gia descrivono gli AGENTS.md "stale". Il sistema faceva cosi fino al 12/06.
In ogni caso serve UNA sola fonte: o gli AGENTS.md ereditano/citano la carta, o vengono allineati. Decisione di Andrea.

## Precedenza in caso di tensione
Dalla visione (MAESTRO-VISIONE sez. 3-bis): in caso di tensione percepita tra le visioni o le fonti, ci si ferma e si chiede ad Andrea; nel dubbio vince il piano operativo M0-M4 com era, e il gate frozen resta legge.

Vedi anche: [[Routing-Modelli-e-Costi]], [[Architettura-Sistema]], [[Glossario]].
