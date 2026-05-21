# Investigazione CI-rossa + systematic-debugging ×2 (iter 103 prep)

**Data:** 2026-05-21 · **Metodo:** /codex:rescue (Codex CLI dispatch) + /systematic-debugging
**Regola:** root-cause prima del fix · nessun fix implementato (sessione read-only).

> ⚠️ **CORRETTO da `2026-05-21-iter-103-codex-review-and-revisions.md`.** §1 sotto cita
> `tests/e2e/22-vision-flow.spec.js` — **file inesistente**. Gli spec vision reali sono
> `02-vision-flow.spec.js` e `13-vision.spec.js`. La logica reale dei 3 gate (letta dai
> workflow) è nel doc di revisione §3.

## 0. Stato Codex dispatch

`/codex:rescue` (agent `codex:codex-rescue`) è stato invocato per delegare a Codex CLI
(GPT-5.5 high) la lettura profonda di `.github/workflows/` + dei file compile. Codex
Desktop app-server è attivo (PID 1142, 15367). La diagnosi profonda live di Codex è
**lavoro di ingresso Sprint A (atom A1-A3)** — domani, su macchina dedicata. Qui sotto
l'analisi systematic-debugging fatta da Claude sui documenti iter-99/100/102 — sufficiente
a pianificare, da confermare con Codex domani.

---

## 1. systematic-debugging #1 — CI E2E rossa (gate `E2E Tests`)

**Sintomo:** `E2E Tests` → job `test` → FAILURE su ogni PR dal 2026-05-12. Run confermato
26196221233, 7m22s. Ultimo E2E verde su `main`: 2026-05-08.

**Evidenza raccolta:**
- Spec sospetto noto (handoff iter-83 §7): `tests/e2e/22-vision-flow.spec.js`, 5/29 fail
  (24 pass). `VisionButton` "Guarda il mio circuito" element-not-found, timeout 15s.
- Audit iter-100 P1: *"Onboarding concorrenti bloccano test — GDPR age banner + Scratch
  onboarding + HomeCompile onboarding possono sovrapporsi"*.
- NON causato da iter 83-102 (pre-esistente, ha bloccato false-positive merge).

**Albero di ipotesi:**
| H | Ipotesi | Plausibilità | Note |
|---|---------|--------------|------|
| H1 | Selettore VisionButton cambiato | Media | un refactor ~8 maggio avrebbe cambiato testo/testid |
| H2 | VisionButton nascosto da flag/route | Media | feature gate aggiunto? |
| **H3** | **Overlay onboarding/consenso copre il bottone** | **ALTA** | audit iter-100 P1 lo cita esplicitamente; timeline (8 mag) coincide |
| H4 | Differenza ambiente CI vs locale | Bassa | localmente vitest verde; ma E2E è browser |

**Root cause più probabile (da confermare):** **H3** — un overlay di onboarding/consenso
introdotto attorno al 2026-05-08 si sovrappone al `VisionButton`, l'elemento esiste nel
DOM ma non è cliccabile/visibile → element-not-found a 15s. Il test non ha una procedura
di bypass unica degli overlay per `#compile-home`/vision.

**Fix candidate (Sprint A atom A1):**
1. Diagnosi: `gh run view 26196221233 --log-failed`, riprodurre con Playwright headed.
2. Se H3: aggiungere bypass overlay esplicito nell'helper E2E (seed localStorage consenso
   + dismiss onboarding) — pattern già usato in altri spec.
3. Se H1: aggiornare il selettore.
4. NON disabilitare il job. Se serve, marcare il singolo test `.fixme` CON data + causa.
- **Exit:** check `test` verde su PR di prova da `origin/main`.

---

## 2. systematic-debugging #2 — `memory.flashPercent` sovrastimato

**Sintomo:** pannello "Compilato" mostra `107.2 KB / 256.0 KB (42%)` per un Blink Nano R4.
Valore reale ≈ 39 KB ≈ 15%. Sovrastima ~2.8×. Confermato live nel browser iter-102.

**Evidenza (iter-102 handoff §1):**
- Risposta API: `flashBytes: 109863`.
- 109863 = dimensione del file `.hex` **ASCII (Intel HEX)** — testo, non binario.
- Binario reale: ~39008 byte. arduino-cli stdout: *"Sketch uses 39008 bytes, 14%"*.

**Root cause (CONFERMATA, completa):** il servizio di compile riporta `flashBytes` =
`hex.length` (lunghezza del file Intel HEX in caratteri ASCII) invece dei byte reali del
binario. Il file Intel HEX codifica ogni byte come 2 caratteri esadecimali + overhead di
record → ~2.8× il binario. Il bug vive nel **repo Render `elab-cloud-compile`**, NON in
`elab-tutor` — il proxy `api/compile/nanor4.js` inoltra soltanto la risposta.

**Fix candidate (Sprint B atom B1, repo Render):** il servizio deve parsare lo stdout di
`arduino-cli` (`Sketch uses N bytes (P%) ... Maximum is 262144 bytes`) per i byte reali,
non `hex.length`. Anti-pattern: NON dividere per una costante magica ~2.8.
- **Exit:** `POST /api/compile/nanor4` con un Blink → `flashPercent` ≈ 15, non 42.

---

## 3. CI gate 2 + 3 — diagnosi preliminare (confermare con Codex domani)

**Gate `Quality Gate` (`quality-ratchet`):** il ratchet fallisce se una metrica del
benchmark regredisce sotto la soglia salvata. Alimentato da `scripts/benchmark.cjs`.
→ Sprint A atom A2: `node scripts/benchmark.cjs --fast` per trovare la metrica sotto soglia;
correggere la regressione **oppure** ricalibrare la soglia con motivazione scritta.
Candidato: il bundle 8546 KiB (quality-audit §4) potrebbe aver sforato una soglia di peso.

**Gate `Governance Gate` (`Verify governance rules 0-5`):** workflow di governance, 6
regole. Storico: a iter-99 la regola 5 richiedeva un update di CHANGELOG.md.
→ Sprint A atom A3: `gh run view <id> --log-failed` per identificare quale regola 0-5;
correggere workflow o repo.

---

## 4. CoV — Chain of Verification dei fatti del master plan

Verifica dei claim del master plan contro il repo live (passata #1):

| Claim | Verificato | Fonte |
|-------|-----------|-------|
| Test unit 14827 PASS, 0 fail | ✅ | `npx vitest run` agente health |
| Build PASS 14.9s, 27 precache | ✅ | `npm run build` agente health |
| 8 PR aperti (#128-135) | ✅ | `gh pr list` agente health |
| Branch 1010 ref, 658 mac-mini | ✅ | `git branch -a` agente health |
| Branch corrente 7 commit ahead main | ✅ | `git rev-list` agente health |
| Mega-PR #60 chiuso | ✅ | assente da `gh pr list` |
| CI E2E rossa dal 12/05 | ✅ | `gh run view 26196221233` |
| `flashPercent` bug nel repo Render | ✅ | iter-102 handoff §1 + audit iter-100 |
| Dead code 2 file | ✅ | quality-audit §6 |

**Passata #2 (verifica incrociata):** nessuna contraddizione tra master plan, quality-audit,
health report e docs iter-99/100/102. Unica correzione vs memoria: il "263-commit mega-PR
#60" NON esiste più (chiuso) — il master plan §1 lo annota già. Branch baseline test
"14503" coerente con +324 = 14827 attuale.

**Verdetto CoV:** 🟢 il master plan poggia su fatti verificati. Punti aperti onesti:
diagnosi precisa di Quality Gate + Governance Gate (Sprint A entrance, non bloccante per
pianificare).

---

## 5. Cosa NON è stato fatto (onestà G45)

- ❌ Diagnosi live profonda dei workflow CI via Codex — dispatched, output non recuperato
  questa sessione. È lavoro di ingresso Sprint A.
- ❌ Nessun fix implementato — sessione read-only di pianificazione.
- ❌ Root cause Quality/Governance gate solo preliminare — confermare domani.
