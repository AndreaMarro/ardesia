# ARDESIA — Unificazione: tutto il lavoro fatto → monorepo (sintesi, 16/06/2026)

Sintesi "A": il quadro unificato che pesa correttamente **lessonos + maestro-studio = CORE**, **elab-tutor = primo plugin chiamabile**, e mappa **tutto il già-fatto** → monorepo `ardesia`. Da [[01-INVENTARIO-SISTEMATIZZATO]] + [[00-PIANO-MAXDEV-2026-06-15]] + correzioni di Andrea (15-16/06). Niente startup/milioni.

## 1. Pesi (corretti)
- **lessonos (engine)** + **maestro-studio (lavagna+ToolHost)** = il **CUORE della piattaforma**, già in gran parte costruito. Peso massimo.
- **elab-tutor** = **primo plugin chiamabile** (NON l'MVP/seme di ardesia). Due-piccioni: finirlo + avere il primo plugin + validare l'SDK.
- **Tutto il già-fatto** = fondamenta da **portare** nel monorepo (storia preservata), non ricostruire.

## 2. Mappa: già-fatto → destinazione nel monorepo `ardesia`
| Componente (dove ora) | Stato | → Destinazione | Note |
|---|---|---|---|
| **lessonos** M0-M4 (Mini ~/lessonos) | gate ~1780, verità sul Mini | `packages/engine` (Python+uv) | grafo-metodo, StyleProfile, dispense, learning-debt, next-lesson |
| **maestro-studio** lavagna+Room+S-DESIGN (MacBook working / Mini bare) | ToolHost T0-T3, gate ~138-471 | `apps/studio` | la superficie docente |
| **ToolHost** protocol+installer+ed25519+kill-list | fatto | `packages/toolhost` | il motore del marketplace |
| **plugin-SDK** (da generalizzare sim/bundle.ts) | da costruire | `packages/plugin-sdk` | il "framework ultra-facile" del co-founder |
| **elab-tutor** (GitHub, prodotto) | main fermo 28/05, 14 PR, 814 branch | **resta repo separato** + `plugins/elab-tutor` = adapter chiamabile | due-piccioni |
| **elab-sim** (whiteboard-studio/sim, Blink) | skeleton | confluisce in `plugins/elab-tutor` | primo tool dimostrato |
| **infra autonoma** (loop/gate/bin/bridge/strategos/audit) | viva sul Mini | `ops/` (FABBRICA, non spedita) | sistema-di-sviluppo |
| **ardesia-wiki** (docs canonici, GitHub live) | auto-sync 6h | vault B (output prodotto) | per-docente |
| **ARDESIA-VAULT** (questo) | governance umana | vault A (spec/SoT, spec-driven) | gli agenti lo leggono |
| **volumi** (elab-volumi) | markdown vol1/2/3 | `content/` (per dispense/plugin) | IP Davide Fagherazzi |
| **UNLIM/Galileo** (Supabase Edge) | prod | AI-tutor del plugin elab + **seme dell'AI-metodologica** | GDPR-runtime |

## 3. elab-tutor = primo plugin chiamabile (cosa serve per chiuderlo COME plugin)
1. **Finire elab** (prodotto a sé): mergere PR #196 (consent/GDPR-minori → ripristinare STRICT) + #198 (CI) + #199 (eslint); **scartare #200** (cross-contamina Numeria); chiudere **E2E-smoke rosso dal 12/05**; UNLIM/lavagna/sim a posto.
2. **Wrapparlo nel contratto ToolHost**: chiamabile/montabile sulla lavagna, sandbox iframe+caps, firma ed25519, immutabile (settings non-fork).
→ **Due piccioni:** elab finito + primo plugin reale + SDK validato (se l'SDK regge elab-tutor, regge per i terzi).

## 4. Il flagship-CERNIERA (prossimo lavoro vero — unisce i due core)
**grafo→suggerisci-tool** (oggi 0 codice): **engine** (lessonos calcola via betweenness "questo concetto richiede il tool X") → **studio** (la lavagna mostra il bottone giusto) → **plugin** (elab/altri eseguono). È dove lessonos + studio + marketplace diventano una cosa sola. Più: **CRM per-studente** (0 dati oggi) + **recensioni a-due-pesi**.

## 5. Modelli del loop (dev-system, cheap, non-Claude)
Backbone provato: **DeepSeek-V4-Flash/Pro · Kimi-K2.6** (i 2 migliori open-weight coder 2026) · Gemini-3.5-flash (API-key). **GLM-5.2 (Zhipu, uscita 13/06: 744B MoE, 1M-ctx, MIT) = TRIAL, non default** — API+pesi escono settimana-prossima, ZERO benchmark indipendenti al lancio → 4° rung in prova quando misurabile. Forza: MIT open-weight self-hostable (zero-dipendenza, risposta al ban-Fable). Via API-key non coding-plan; mai PII (cinese). Claude = solo desktop con Andrea presente.

## 6. Prossimo passo (F0)
Spostare i file da Downloads→`_inbox/` (TCC); leggere requisiti PDF+ogg; **scaffold monorepo Nx**; importare engine+studio+toolhost (storia preservata); **GitHub + CI affected + branch-protection** (chiude durabilità: lessonos stale-06-06 + studio-senza-GitHub). Poi flagship-cerniera + elab-come-plugin.
