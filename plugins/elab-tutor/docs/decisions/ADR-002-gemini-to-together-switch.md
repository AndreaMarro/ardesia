# ADR-002: Switch LLM Provider da Gemini a Together AI

**Status**: ACCEPTED  
**Date**: 2026-04-20  
**Decision makers**: Andrea Marro  

## Context

Gemini free tier causa 429 rate limit frequenti (30/15/5 RPM per lite/flash/pro).
I modelli 3.x hanno avuto instabilita 503 (17/04/2026, types.ts nota).
Serve un provider piu affidabile con costi prevedibili.

## Decision

Together AI con Llama 3.3 70B Instruct Turbo come provider primario.
Gemini mantenuto come fallback via `LLM_PROVIDER` env var.
Nuovo file `llm-client.ts` come dispatcher unificato.

## Consequences

**Positive**: rate limit eliminati, costo prevedibile (~$3.60/mese), rollback istantaneo via env var.

**Negative**: costo non-zero ($0.88/M token), possibile qualita inferiore italiano (mitigato da 20 prompt test + fallback Qwen 2.5 72B).

**Neutral**: gemini.ts, system-prompt.ts, router.ts, types.ts restano intatti. Vision resta su Gemini.

## Alternatives Considered

1. **Gemini paid tier** -- costo superiore, lock-in Google, stesse instabilita API.
2. **OpenAI GPT-4o-mini** -- buon italiano ma costo 3x Together, GDPR concerns (US processing).
3. **Self-hosted Ollama** -- latenza alta (VPS limitato), gia usato come ultimo fallback.
