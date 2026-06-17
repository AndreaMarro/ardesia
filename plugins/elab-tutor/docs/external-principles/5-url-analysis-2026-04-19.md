# Analisi Onesta 5 URL Andrea — 2026-04-19

**Scope**: valutazione onesta rilevanza per ELAB Tutor + Claude Code dev workflow.

---

## ❌ Fuori scope ELAB (IGNORARE)

### URL 1: github.com/circuit-synth/circuit-synth
- Python + KiCad per PCB professional design
- Target: ingegneri industria
- **NO** per bambini 8-14 anni
- **NO** integration con simulatore visuale ELAB

### URL 2: github.com/gdsfactory/circulax
- JAX differentiable simulator photonic + electronic
- Target: ricerca PhD semiconduttori
- **Assolutamente NO** per ELAB educational

### URL 3: github.com/topics/ai-circuit-design
- Solo 2 repo (`spicebridge` clones, 16+0 stelle)
- Topic quasi vuoto
- **NO** materiale utile

---

## ⚠️ Utile limitato

### URL 4: github.com/wilpel/caveman-compression
- **Script Python** compressione token (grammar stripping)
- Risparmi: 40-58% LLM / 20-30% MLM / 15-30% NLP
- License MIT
- **Use case ELAB**: post-processing PDR/context lunghi prima passaggio a Claude Max
- **NON usare** su content UNLIM bambini (distrugge Principio Zero)
- Clonato in `.claude/external-agents/caveman-compression/`

---

## 🎯 Ottimo e installato

### URL 5: github.com/JuliusBrussee/caveman → **IL "CAVEMAN" CHE ANDREA CERCAVA**
Plugin Claude Code completo.

**Installation eseguita**:
```bash
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
# ✔ Successfully installed plugin: caveman@caveman (scope: user)
```

**Features attive**:
- `/caveman` command + statusline badge
- 4 modalità: `lite` / `full` / `ultra` / `wenyan` (文言文)
- Sub-skills: `/caveman-commit`, `/caveman-review`, `/caveman-compress`, `/caveman-help`
- Auto-attivazione SessionStart hook
- Research basis: paper marzo 2026 "Brevity Constraints Reverse Performance Hierarchies"
- Risparmio token media 75% (benchmark 22-87%)

**⚠️ CRITICAL — Principio Zero conflict**:

Caveman DISTRUGGE Principio Zero v3. Confronto:

```
UNLIM ora (GIUSTO):
"Ragazzi, come spiega il Vol. 1 a pagina 29, per accendere il LED ci
servono: un LED, una breadboard, una batteria da 9V, la clip, un
resistore da 470 Ohm. È come preparare gli ingredienti per una ricetta!"

UNLIM con caveman (SBAGLIATO):
"Ragazzi. Libro p29. LED. Breadboard. 9V + clip. 470Ω. Ingredienti."
```

Caveman per UNLIM content = VIETATO.

### Uso corretto caveman in ELAB

**Dev-side SOLO** (Claude CLI che gira PDR autonomi):

| Skill | Uso ELAB dev | NO per |
|-------|--------------|--------|
| `caveman-commit` | Commit message concisi | N/A |
| `caveman-review` | PR review 1-line | N/A |
| `caveman-compress` | Comprime docs interni per context injection | `src/components/*` UI bambini |
| `/caveman lite` (session) | Reasoning agente dev | UNLIM BASE_PROMPT |
| `/caveman ultra` | Output interno dev verbose | Mai produzione |

**Regola hard**: caveman attivo in session Claude CLI SOLO quando si tocca codice dev. Mai quando si modifica `supabase/functions/_shared/system-prompt.ts` o contenuti UNLIM.

---

## 📦 Stato completo external tool

| Tool | Clonato | Plugin installato | Use case ELAB |
|------|---------|-------------------|---------------|
| wshobson/agents | ✅ 551 files | ❌ solo clone | Dev sub-agents |
| karpathy-claude.md | ✅ | ❌ no plugin | Dev principles (Think/Simple/Surgical/Goal) |
| oh-my-claudecode (OMC) | ✅ 190 files | ❌ solo clone | Dev multi-agent orchestration |
| **caveman (Julius)** | ✅ | **✅ REGISTRATO** in Claude CLI | Dev compression (NON UNLIM) |
| caveman-compression (wilpel) | ✅ | ❌ script | Post-process PDR per context budget |
| circuit-synth | — | — | **IGNORARE** (fuori scope) |
| circulax | — | — | **IGNORARE** (fuori scope) |
| omi (BasedHardware) | — | — | Wearable Andrea personal, non integrabile ELAB |
| claude-mem | già installato | ⚠️ serve setup Node | Persistent memory (future) |

---

## 🎯 Conclusione onesta

**3 tool Andrea su 5 URL erano off-topic** per ELAB Tutor (circuit-synth, circulax, ai-circuit-design topic).

**2 tool vere scoperte**:
1. **caveman JuliusBrussee** — Claude Code plugin legit, installato ORA
2. **caveman-compression wilpel** — script Python complementare

**Entrambi utili SOLO per workflow dev** (non per prodotto UNLIM rivolto a bambini).

Nessuno dei 5 URL è direttamente integrabile come feature user-facing in ELAB Tutor.
