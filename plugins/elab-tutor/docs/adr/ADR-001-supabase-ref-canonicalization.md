# ADR-001: Supabase Project Ref Canonicalization

**Status:** RESOLVED (verified 2026-04-21 Day 02 via MCP)
**Deciders:** MCP supabase live verification + Andrea delegate
**Date:** 2026-04-21

## VERDETTO: `euqpdueopmlllqjmqnyb` = CANONICAL PROD

Verificato 2026-04-21 via `mcp__supabase__list_edge_functions` + `list_tables`:
- **Edge Functions ACTIVE**: unlim-chat (v15), unlim-diagnose (v12), unlim-hints (v11), unlim-tts (v11), unlim-gdpr (v11)
- **Tabelle popolate**: volume_chunks=638, rate_limits=78, parental_consents=4, gdpr_audit_log=3
- **Frontend LIVE**: `src/services/api.js` usa questo ref = production utenti reali

**`vxvqalmxqtezvgiboxyv` = stale doc reference** presente in: `CLAUDE.md`, `scripts/cli-autonomous/deploy-prod.sh`, `scripts/cli-autonomous/verify-llm-switch.sh`, `docs/architectures/cli-autonomous-foundations.md`, recent 2026-04-xx docs. DA AGGIORNARE.

## Context

Il repo contiene 2 Supabase project ref diversi:

1. `euqpdueopmlllqjmqnyb.supabase.co` — usato in:
   - `src/services/api.js` (frontend LIVE produzione https://www.elabtutor.school)
   - `.env.production`
   - 36+ doc references storici
   - scripts Python RAG upload (`scripts/upload-rag-supabase.py`, `upload-chunks-supabase.py`)

2. `vxvqalmxqtezvgiboxyv.supabase.co` — usato in:
   - `CLAUDE.md` (documenting "Supabase | OK" line)
   - `scripts/cli-autonomous/deploy-prod.sh` (deploy target Edge Functions)
   - `scripts/cli-autonomous/verify-llm-switch.sh`
   - `docs/architectures/cli-autonomous-foundations.md`
   - Recent 2026-04-xx docs

## Conseguenza

- Frontend chiama `euqpdueopmlllqjmqnyb` mentre Edge Function deployment verso `vxvqalmxqtezvgiboxyv`.
- JWT 401 bug Day 01 verify-llm-switch.sh curl potrebbe essere causato da mismatch ref vs anon key.
- Live production URL `https://www.elabtutor.school` risponde HTTP 200 = frontend funziona con qualunque dei due sia reale.

## Decisione (RESOLVED via MCP verify)

Canonical confermato = `euqpdueopmlllqjmqnyb`. Aggiornare tutti i file che usano `vxvqalmxqtezvgiboxyv` (stale).

Grep command per trovare stale:
```bash
grep -rl "vxvqalmxqtezvgiboxyv" src/ supabase/ scripts/ docs/ CLAUDE.md .env*
```

## Opzioni

**A) Canonical = `euqpdueopmlllqjmqnyb`** (ipotesi alta probabilità: frontend LIVE)
- Aggiornare: CLAUDE.md, deploy-prod.sh, verify-llm-switch.sh, cli-autonomous-foundations.md, recent docs
- Rischio: rompere deploy Edge Functions se sono su `vxvqalmxqtezvgiboxyv`

**B) Canonical = `vxvqalmxqtezvgiboxyv`** (ipotesi bassa: solo se dati migrati)
- Aggiornare: src/services/api.js, .env.production, scripts Python RAG, 36+ doc
- Rischio: rompere frontend LIVE se dati utenti sono su `euqpdueopmlllqjmqnyb`

**C) Dual-project setup intenzionale (PROD + STAGING)**
- Documentare quale è quale
- Aggiornare file in base al contesto (prod vs staging)
- Nessuna rottura

## Action Items

- [ ] Andrea: dashboard check + conferma canonical
- [ ] Dev: grep + sed replace globale file by file
- [ ] Tester: verify prod HTTP 200 post-change
- [ ] Auditor: zero regression 12149 vitest

## Safety Rule

Nessuna modifica automatica senza Andrea. Memory saved: `feedback_production_safety.md`.
