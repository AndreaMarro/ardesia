# PDR Giorno 12 — Venerdì 02/05/2026

**Sett 2** | Andrea 8h + Tea 3h | Goal: **claude-mem corpus persistente + Tea PR Vol 3 cap 1-3 + call settimanale**.

## Pre-flight
```bash
git status; git pull; npx vitest run --reporter=dot | tail -3
```

## Task del giorno
1. **(P0) DEV: setup claude-mem hook auto-capture decisions** (2h)
2. **(P0) DEV: build corpus completo `docs/pdr-ambizioso/`** (1h)
3. **(P0) TPM: query test cross-session ("ricorda DECISION-007?")** (30 min)
4. **(P1) Tea: PR glossario Vol 3 cap 1-3 (auto-merge)** (Tea 3h)
5. **(P1) Andrea + Tea: call settimanale 18:00 Telegram (1h)** (1h)
6. **(P2) AUDITOR: weekly audit fine sett 2 (preview)** (1h)

## Multi-agent dispatch
```
@team-dev "Setup claude-mem hook auto-capture. File: ~/.claude/settings.local.json hook config."
@team-dev "Build corpus 'pdr-ambizioso' tutti file in docs/pdr-ambizioso/."
@team-tpm "Test query cross-session via mem-search. Verifica ADR-007 retrievable."
```

## PTC use case
claude-mem rebuild + 5 query test parallel:
```python
# Build corpus + test 5 cross-session queries
```

## DoD
- [ ] claude-mem hook attivo
- [ ] Corpus 'pdr-ambizioso' built
- [ ] Cross-session query test PASS
- [ ] Tea PR auto-merged
- [ ] Call Tea fatta
- [ ] Handoff doc

## Rischi
- claude-mem hook conflict altri hook → ordine config
- Tea call cancellata → reschedule sab

## Handoff
`docs/handoff/2026-05-02-end-day.md`
