# PDR Giorno 51 — Martedì 10/06/2026

**Sett 8** | Andrea 8h + Tea 4h | Goal: **Migration self-host + GDPR audit complete**.

## Task del giorno
1. **(P0) DEV: switch Together AI → Hetzner self-host (Mistral 24B)** (3h)
2. **(P0) DEV: fallback chain reordered (self-host PRIMARY, Anthropic FALLBACK, Together OFF)** (1h)
3. **(P0) AUDITOR: GDPR audit complete (data flow, PII handling, retention)** (3h)
4. **(P1) TESTER: regression test post-migration** (1h)

## Multi-agent dispatch
```
@team-dev "Migration self-host. config Edge Function: PRIMARY Hetzner Mistral 24B, FALLBACK Anthropic Sonnet, Together OFF."
@team-auditor "GDPR audit complete.
- Data flow diagram
- PII handling (anonymization, encryption at rest, in transit)
- Retention policy
- DPO contact
- Cookie banner
- Privacy policy update
Output docs/audits/2026-06-10-gdpr-onesto-completo.md."
```

## DoD
- [ ] Self-host migration complete
- [ ] Fallback chain reordered
- [ ] GDPR audit completo
- [ ] Regression PASS
- [ ] Handoff

## Rischi
- Self-host instabile primo giorno → rollback ready (Together AI keep credentials)
- GDPR audit scopre P0 issue → fix urgente, slittare release possibile

## Handoff
`docs/handoff/2026-06-10-end-day.md`
