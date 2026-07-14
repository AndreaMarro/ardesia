---
id: ardesia-versioned-knowledge-index
status: active
freshness: 2026-07-15T01:12:57+02:00
baseline_sha: 33c2d0cfaad480f6ed8e2a8f989802ace3d29de1
authority: navigation-only
---

# Ardesia — indice operativo della knowledge

Questo è l'entrypoint umano e agentico della knowledge versionata. Obsidian è
l'interfaccia; Git, gli schemi, i test e le ricevute runtime restano le fonti
tecniche. Questo indice orienta: non rende vera una nota per il solo fatto di
collegarla.

## Ordine di lettura al resume

1. [Canone corrente](CANON-INDEX.md)
2. [ADR-0004 — AI-native, evidence-authoritative, deterministic authority](adr/ADR-0004-ai-native-evidence-authority.md)
3. [Operazioni della knowledge e migrazione Obsidian](KNOWLEDGE-OPERATIONS.md)
4. [Tooling readiness e fonti esterne](ops/TOOLING-READINESS.md)
5. [Matrice GitHub Actions](ops/CI-COVERAGE-MATRIX.md)
6. [Contratto privacy Sentry/PostHog](ops/TELEMETRY-PRIVACY-CONTRACT.md)
7. [Piano Storybook/Chromatic](ops/UI-QUALITY-PLAN.md)
8. [Runbook attività programmata 60 minuti](ops/AUTOMATED-LOOP-RUNBOOK.md)
9. [Protocollo CoV e audit](ops/COV-AUDIT-PROTOCOL.md)
10. [Template del packet successivo](ops/NEXT-SESSION-PACKET-TEMPLATE.md)

I documenti AgentMemory su [health](ops/AGENTMEMORY-HEALTH-STATUS.md),
[manutenzione](ops/AGENTMEMORY-MAINTENANCE-PLAN.md) e
[pointer-only](ops/AGENTMEMORY-SEMANTIC-PROTOCOL.md) sono storici e superseduti:
restano evidenza della dismissione, non istruzioni operative o gate di resume.

Poi il run deve verificare branch, HEAD, status, ref remoti e CI live. SHA o
stati riportati nelle note sono snapshot, mai sostituti della verifica.

## Stato verificato di questo checkpoint

| Oggetto | Stato | Evidenza |
|---|---|---|
| North star | ratificata | ADR-0004 digest-pinned dal gate CI |
| Gate canone locale | verde | commit `ce89aec6b76bd99b8a885bbfe05804b221f5510f` |
| `origin/main` osservato | baseline remota arretrata | `91ec22eda16cf4ed12e14c565358dedc3656979f` |
| Pubblicazione del branch | HUMAN_GATE | nessun push o PR effettuato |
| Secondo cervello Obsidian | working copy Git di `docs/` | Git/Markdown è durevole; Obsidian apre la stessa cartella e non crea un'autorità parallela |
| Vault esterno curato | migration source read-only, non autorità | 118 file; procedura di manifest in `KNOWLEDGE-OPERATIONS.md` |
| AgentMemory | `RETIREMENT_DECIDED / NO-READ / NO-WRITE` | sostituzione dietro `MemoryIndexPort`; Git+Obsidian+receipt restano il fallback verificabile |
| GitHub Actions root | `HARDENED_LOCAL / REMOTE_PENDING` | pin, runtime, identity e gate a `d1c24c60`; manca CI remota allo stesso SHA |
| Vendor qualità/cloud | `AUDITED / NOT INTEGRATED` | responsabilità, gap, ordine e gate in `ops/TOOLING-READINESS.md` |
| Attività programmata 60 minuti | `PREPARED / NOT ACTIVE` | runbook e CoV pronti; attivazione solo dopo verifica e review |

## Contratto di aggiornamento

- Ogni comportamento cambia insieme a test e documentazione canonica nella
  stessa slice.
- Decisioni correnti vanno in ADR; prove in ricevute; stato temporaneo in
  checkpoint o handoff. Una chat non è una decisione.
- Note supersedute non vengono cancellate: ricevono stato e puntatore al
  successore.
- Niente segreti, audio, trascrizioni, prompt, nomi di studenti o contenuto
  didattico sensibile nel vault.
- Il futuro adapter `MemoryIndexPort` riceve soltanto puntatori ricostruibili a
  SHA, decision ID, receipt hash e percorso relativo; AgentMemory non è usato.
- Se un link o uno stato non è verificabile, viene marcato `UNKNOWN`; non viene
  completato per somiglianza.

## Confini

`docs/vault/` è materiale legacy versionato e non torna a essere il punto di
ingresso. `ops/knowledge/`, `docs/wiki/` e gli handoff storici sono fonti da
classificare, non mappe concorrenti. La migrazione avviene per tranche di
massimo cinque file, senza copia massiva né cancellazione.
