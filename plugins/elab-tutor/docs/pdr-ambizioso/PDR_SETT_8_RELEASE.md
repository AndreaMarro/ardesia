# PDR Settimana 8 — OpenClaw Layer Docente + UAT + Release v1.0

**Periodo**: lunedì 09/06/2026 → domenica 15/06/2026
**Owner**: Andrea + Tea + Team Opus + Tester volontari (Giovanni, Davide, Omaric)
**Goal**: OpenClaw layer docente Telegram completo + UAT con docenti reali + **RELEASE v1.0** ELAB Tutor. **Score target**: 8.7/10.

---

## 0. Definizione "release v1.0"

ELAB Tutor v1.0 = **production-ready** con:
- ✅ UNLIM onnisciente (RAG 6000+)
- ✅ UNLIM onnipotente (33+ tool)
- ✅ UNLIM contesto profondo (AST + memoria + vision)
- ✅ Voice premium (Voxtral + Whisper + wake word)
- ✅ Self-host EU GDPR (Hetzner + RunPod EU)
- ✅ OpenClaw layer docente (Telegram bot)
- ✅ Tea integrata autoflow operativo
- ✅ UAT pass con 3+ docenti reali
- ✅ Score benchmark ≥8.5
- ✅ Test count ≥14000

---

## 1. Obiettivi misurabili sett 8

| Obiettivo | Target |
|-----------|--------|
| OpenClaw layer docente complete | sì |
| UAT 3+ docenti reali | 3/3 PASS |
| Migration switch Together AI → self-host | sì |
| GDPR audit complete | sì |
| Release v1.0 tagged | `v1.0.0` |
| Deploy prod stabile 48h | sì |
| Score benchmark | 8.7 |
| Test count | 14000+ |
| Documentation user-facing complete | sì |
| Press kit Andrea + Tea ready | sì |
| BOM finalizzata + Omaric quote | sì |

---

## 2. Task breakdown 7 giorni

### Lun 09/06 — OpenClaw layer docente completo

- DEV: comandi Telegram completi (`/lezione_oggi`, `/studente_X`, `/dashboard`, `/nudge_classe`)
- DEV: report PDF generation Telegram (`/report_settimana`)
- TESTER: bot E2E test 20 comandi
- File: `giorni/PDR_GIORNO_50_LUN_09GIU.md`

### Mar 10/06 — Migration self-host + GDPR audit

- DEV: switch Together AI → Hetzner self-host (Mistral 24B)
- DEV: fallback chain reordered (self-host PRIMARY, Anthropic FALLBACK, Together OFF)
- AUDITOR: GDPR audit complete (data flow, PII handling, retention policy)
- File: `giorni/PDR_GIORNO_51_MAR_10GIU.md`

### Mer 11/06 — UAT preparation

- ARCHITECT: UAT script (5 scenari realistic)
- DEV: setup UAT environment (staging stable URL)
- Andrea: contact 3 docenti volunteer (Giovanni, Davide, contact 1)
- File: `giorni/PDR_GIORNO_52_MER_11GIU.md`

### Gio 12/06 — UAT day 1

- Andrea + 3 docenti: UAT session 2h ognuno (6h total)
- Tester: live observe + log issue
- TPM: triage feedback (P0/P1/P2)
- File: `giorni/PDR_GIORNO_53_GIO_12GIU.md`

### Ven 13/06 — UAT fix P0/P1

- DEV: fix UAT P0 issues immediate
- TESTER: regression test post-fix
- DEV: fix UAT P1 issues
- Call settimanale Andrea + Tea (1h)
- File: `giorni/PDR_GIORNO_54_VEN_13GIU.md`

### Sab 14/06 — Release prep + documentation

- DEV: CHANGELOG.md complete v1.0.0
- DEV: README.md prod-ready
- DEV: documentation user-facing (`docs/user-guide/`)
- AUDITOR: final pre-release audit
- DEV: tag `v1.0.0` + deploy prod
- File: `giorni/PDR_GIORNO_55_SAB_14GIU.md`

### Dom 15/06 — RELEASE v1.0 + retro

- Release announce social/email
- Press kit publish
- Retro 8 settimane Andrea + Tea (2h)
- Plan v1.1 next 4 settimane
- File: `giorni/PDR_GIORNO_56_DOM_15GIU.md`

---

## 3. Costi sett 8

| Voce | Costo |
|------|-------|
| Together AI (last week, ramping down) | ~€10 |
| Hetzner CX31 (self-host primary) | €8.21 |
| RunPod (Vision + Whisper) | ~€15 |
| Tester docenti volunteer (gift card €30/each) | €90 |
| Press kit + design (Tea) | €0 (incluso) |
| **TOTALE settimana 8** | **~€123** |

---

## 4. Definition of Done sett 8 (RELEASE)

- [x] OpenClaw layer Telegram operational
- [x] UAT 3/3 docenti PASS (no P0 open)
- [x] Migration self-host complete
- [x] GDPR audit complete + documented
- [x] Release `v1.0.0` tagged + deployed
- [x] Deploy stabile 48h
- [x] Score ≥8.7
- [x] Test ≥14000
- [x] Documentation user-facing
- [x] Press kit ready

---

## 5. Riepilogo 8 settimane (cumulative)

| Sett | Goal | Score target | Delivered |
|------|------|--------------|-----------|
| 1 | Stabilize | 6.0 | TBD |
| 2 | Infra base | 6.5 | TBD |
| 3 | Bridge + orchestrator | 7.0 | TBD |
| 4 | Onniscienza | 7.5 | TBD |
| 5 | Onnipotenza | 8.0 | TBD |
| 6 | Voice premium | 8.3 | TBD |
| 7 | Contesto profondo | 8.5 | TBD |
| 8 | Release v1.0 | 8.7 | TBD |

**Score growth**: 2.77 → 8.7 = +5.93 punti in 8 settimane.

---

## 6. Costi cumulative 8 settimane

| Sett | Costo |
|------|-------|
| 1 | €0 |
| 2 | €11 |
| 3 | €29 |
| 4 | €28 |
| 5 | €41 |
| 6 | €33 |
| 7 | €41 |
| 8 | €123 |
| **TOTALE 8 settimane** | **~€306** |

Più costi una-tantum:
- Domain (~€10)
- Hetzner setup buffer (~€15)
- DALL-E test (~€2)
- UAT gift cards (€90 incluso sett 8)

**Cumulative total**: **~€333** per 8 settimane = **~€42/settimana media**.

vs cost stimato originale €5000+ → **-93% cost** grazie a path testing economico + Tea Babbalea + Max subscription Andrea.

---

## 7. Self-critica 8 settimane

**Cosa potrebbe fallire**:
- UAT scopre issue P0 critici → slip release v1.0 a sett 9
- Migration self-host instabile → rollback Together AI primary, ritardo GDPR full
- Tea capacity sotto target (<12h/sett media) → ritardo glossario + esperimenti
- Andrea burnout fine sett 8 → quality drop ultimi commit
- OpenClaw bot bug last-minute → demo in produzione fail

**Mitigazione**:
- Buffer sabato 14/06 per fix critici
- Plan B rollback chain pronta
- Tea capacity monitor settimanale (alert se <8h)
- Andrea no work weekend sett 8 (recovery)
- OpenClaw soak test 48h pre-demo

---

## 8. Post-release (v1.1+ teaser)

**Sett 9-12 (16/06 → 13/07)**:
- v1.1: bugfix UAT residue + perf optim
- v1.2: marketplace docenti (lezioni custom)
- v1.3: multi-lingua (English, Spanish)
- v1.4: mobile native app (Capacitor)

**Cost v1.1-1.4**: stimato €100-150/mese.

---

**Forza ELAB. Sett 8 RELEASE v1.0 inizia lun 09/06.**

**Domenica 15/06/2026: release party. ELAB Tutor v1.0 LIVE.**
