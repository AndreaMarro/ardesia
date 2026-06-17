# Sprint Q5 Audit — Memoria compounding student/teacher

**Branch:** `feat/sprint-q5-memoria-compounding-2026-04-25`
**Baseline:** 12459 (Q4) → 12481 (+22 Q5)

## Deliverable

### src/services/memoryWriter.js (180 lines)

Pure functions per generazione markdown memoria:
- `buildStudentMemory(classId, sessionLog, opts)` → markdown completo classe
- `buildTeacherMemory(teacherId, sessionLog, opts)` → markdown completo docente
- `inferLivello(log)` → 'principiante' | 'intermedio' | 'avanzato'
- `inferStileDidattico(log)` → 'hands-on' | 'narrativo' | 'visivo' | 'da-osservare'
- `collectEsperimentiFatti(log)` → unique sorted IDs
- `collectErroriRicorrenti(log)` → errors count >= 2
- `collectClassiSeguite(log)` → unique class IDs
- `collectVolumiPreferiti(log)` → volumes by frequency

### Output markdown structure

**Student** (`docs/unlim-wiki/students/<classId>.md`):
```yaml
---
classId, livello, created_at, updated_at, sessioni_count,
esperimenti_fatti[], errori_ricorrenti[]
---
# Memoria classe X
## Profilo / Esperimenti completati / Errori ricorrenti / Note
```

**Teacher** (`docs/unlim-wiki/teachers/<teacherId>.md`):
```yaml
---
teacherId, stile_didattico, created_at, updated_at, sessioni_count,
classi_seguite[], volumi_preferiti[]
---
# Memoria docente Y
## Profilo / Classi seguite / Volumi più usati / Note
```

### tests/unit/services/memoryWriter.test.js (22 test PASS)

- inferLivello (3): empty, few, many sessions
- inferStileDidattico (4): empty, hands-on, narrativo, visivo
- collectEsperimentiFatti (2): unique sorted, experiments_completed array
- collectErroriRicorrenti (2): count >= 2 sorted, single excluded
- collectClassi/Volumi (2): unique sorted, frequency desc
- buildStudentMemory (5): throws null, front-matter, esperimenti, livello avanzato, PRINCIPIO ZERO note
- buildTeacherMemory (4): throws null, front-matter, stile_didattico, classi_seguite

## GDPR

- Solo metadati pseudonimi (classId opaco, NO PII minori)
- Errori_ricorrenti formato slug (no foto, no nomi)
- Memoria genera markdown locale, sync Supabase opzionale Sprint 6+
- NO foto, NO testo libero studenti

## PRINCIPIO ZERO

- Memoria descrittiva nominale (no comandi)
- Note finale ribadisce: "UNLIM la usa per personalizzazione, NO comandi al docente"
- Plurale ragazzi nei placeholder

## CoV Q5

Baseline 12459 → 12481 (+22). Full suite 227 test files PASS.

## Verdetto Q5

**PASS**. Pure functions testabili, output markdown standard, GDPR conforme.

Sprint 6+ wire-up: invocare `buildStudentMemory` post-session save in unlimMemory service + Supabase mirror.
