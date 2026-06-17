# Routing dei modelli e costi

Fonte: `~/ardesia-wiki/Architettura/ARDESIA-ALIGNMENT.md` (carta 13/06) e `ARDESIA-ARCHITECTURE.md` sez. 1; analisi costo dagli audit R3 e research:headless-changes (15/06).

Fonte di verita del routing: `~/lessonos/routes.env` (default) + `~/.ardesia-routes.override` (dinamico, vince). Risolutore: `bin/route.sh <ruolo>`. Il primo modello accessibile della scala vince. Principio: mai cambiare modello mid-sessione (= cache azzerata, full cache-miss verificato); il routing e per-invocazione/per-ruolo.

## Tabella ruoli (carta 13/06)
| Ruolo | Primario | Scala fallback | Razionale |
|---|---|---|---|
| brain (pianifica/progetta/skill) | fable-5 | opus-4-8, sonnet-4-6 | visione e decomposizione |
| builder (sviluppo, multiagente) | opus-4-8 | sonnet-4-6 | qualita del codice = prodotto |
| research (multiagente) | opus-4-8 | fable-5 | ricerca profonda, web nativo |
| review (decorrelato, free-first) | codex | gemini, kimi, fable-5, opus-4-8 | mai lo stesso modello che ha scritto |
| adversarial (red-team) | kimi | (solo kimi) | lente di famiglia diversa |
| audit (2x/g, puo modificare) | fable-5 | opus-4-8 | capo-ingegnere |

Stato 13/06: fable-5 INACCESSIBILE via token headless (rollout Anthropic non esteso al setup-token) -> brain/audit cadono su opus-4-8; il routing ripiglia fable quando torna. Lo stato "fable-5 inaccessibile headless" resta tecnicamente plausibile ma non confermato in modo indipendente (audit research:headless-changes: UNCONFIRMED ma plausibile).

## Evento di costo del 15/06/2026 (urgente)
Fonte: audit research:headless-changes + max-cost-routing (R3).
- Dal 15/06/2026 Anthropic sposta `claude -p` headless, Agent SDK, GitHub Actions e agenti terzi FUORI dal pool della sottoscrizione, su un credito mensile separato in dollari, fatturato a tariffe API piene, senza rollover.
- E esattamente il comando che il loop ARDESIA esegue sul Mini. A credito esaurito le richieste si fermano (o cadono su usage-credits a tariffa API solo se l opt-in e abilitato). Coerente con gli eventi "out of extra usage" gia loggati nel sistema e con il fermo attuale del loop.

## Confronto tariffe (per Mtoken, da R3)
| Modello | Input | Output | Note |
|---|---|---|---|
| Opus 4.8 | $5 | $25 | builder attuale per carta |
| Sonnet 4.6 | $3 | $15 | ~1.67x piu economico di Opus |
| Haiku 4.5 | $1 | $5 | esecutore economico |
| DeepSeek V3/V4-Flash | $0.14 | $0.28 | ~36x input / ~89x output piu economico di Opus |

## Verdetto economico (R3)
"builder=opus" e economicamente insostenibile per un loop autonomo headless, e l evento del 15/06 lo rende urgente. Il sistema lo ha gia diagnosticato due volte: l 11/06 ha demoto il default chat da opus a sonnet/haiku ("opus-default cannibalizza la quota Max condivisa"); il 13/06 ha messo builder=opus SOLO come ripiego per l inaccessibilita di fable, con warning esplicito "brucia quota Max piu in fretta".
Raccomandazione R3: ripristinare il modello alternativo (builder economico DeepSeek/Kimi + Claude come reviewer/escalation Opus mirato) come default, con Opus riservato a planning/synthesis/escalation. Questa e la posizione degli AGENTS.md operativi (vedi la contraddizione in [[Allineamento-Due-Claude]]).

## Leve token verificate (ARDESIA-ARCHITECTURE.md sez. 4)
1. Prompt caching, prefisso byte-identico, TTL 1h (leva #1; cache-read = 0.1x input). Attenzione: tick a 300s con TTL default 5min fa scadere la cache a ogni giro.
2. Compressione output-tool (test/git/grep -> solo segnale) prima del contesto.
3. Subagent context-isolation: il routing economico va NEI subagent, mai cambio-modello nel main.
4. Handoff packet self-contained + vetting-gate pre-PR.
5. CLAUDE.md/MEMORY minimal.
BOCCIATI dopo verifica avversariale: gli slogan 70%, 25x, 3-5x, 35x.

## Rischio Gemini
Gemini OAuth muore (ban third-party 25/03, sunset consumer 18/06): il gradino `gemini` di review si rompera. Il ladder cade su kimi/claude — non dipenderci. Gemini solo come API-key paid per video, differito.

Vedi anche: [[Architettura-Sistema]], [[Allineamento-Due-Claude]].
