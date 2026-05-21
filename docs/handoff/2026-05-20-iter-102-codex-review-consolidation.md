# Handoff iter-102 — Revisione Codex iter-101 + stato consolidamento

Data: 2026-05-20 · Sessione: revisione lavoro Codex Desktop + organizzazione morfismo/cross-compile + piano.
Mandato Andrea: **NO COMPIACENZA, massima onestà, documenta tutto.**

Questo file = stato corrente del progetto (per la mappa README, l'handoff più recente è la verità).

---

## 1. Revisione iter-101 Codex (cross-compilazione Nano R4)

Codex Desktop ha prodotto iter-99 (`a7cd406e`) + iter-101 (`2a700bf1`) sul branch
`fix/iter-99-compila-onesta` = **PR #131**. Poi ha deployato in produzione.

### Verifica live (test reale iter-102)

`POST https://www.elabtutor.school/api/compile/nanor4`:

```
HTTP 200 · ok:true · status:success
fqbn: arduino:renesas_uno:nanor4   (Renesas RA4M1 — corretto per Nano R4)
hex reale: 109863 byte · jobId presente · latencyMs 35916
upload: { attempted:false, status:"not_attempted_without_board" }
```

**Cross-compilazione Nano R4 funziona davvero.** Il claim di Codex è confermato.

### Verdetto: iter-101 ~8/10 — lavoro reale, onesto, riduce debito

Cosa fa, verificato leggendo il diff:
- **Security WIN reale.** Rimuove dal bundle client l'URL Render diretto
  (`VITE_ELAB_CLOUD_COMPILE_URL`) e l'invio di `X-Elab-Api-Key` lato browser.
  Tutto passa per il proxy same-origin `/api/compile/nanor4`, che inietta la
  chiave server-side. −116 righe, meno superficie d'attacco, un solo path
  canonico. Converge correttamente.
- **Onestà.** `upload.status:"not_attempted_without_board"` — il sistema NON
  mente sul flash fisico quando manca la scheda. iter-99: quando il risultato è
  `verified-legacy`, la UI lo dichiara e nasconde la CTA «carica sul kit» falsa.

### 🔴 Bug trovato (non-compiacenza)

`memory.flashPercent: 42` è **sbagliato**. La risposta riporta
`flashBytes:109863`, che è la dimensione del file `.hex` ASCII (Intel HEX), non
il binario. Il binario reale è ~39008 byte ≈ **15%** (arduino-cli stdout:
«Sketch uses 39008 bytes, 14%»). Il pannello memoria sovrastima ~2.8×.

Il bug vive nel servizio Render `elab-cloud-compile`, **NON in `elab-tutor`** —
il proxy `api/compile/nanor4.js` inoltra soltanto. Fix in repo diverso (Phase 5
del piano).

### ⚠️ Latency

36s di cold start. Un bambino clicca «Compila» e aspetta 36 secondi. Serve un
warm-up cron + aspettativa UI esplicita (Phase 6 del piano).

---

## 1bis. Debug live prod (Claude in Chrome, iter-102)

Smoke live `www.elabtutor.school` via browser:

- ✅ Homepage: render pulito, tutti gli asset ELAB HTTP 200, banner «Compila &
  Carica pronto su Nano R4» presente (`WebUsbBanner` + `CompileAgentBanner`).
- ✅ Route `#compile-home`: render corretto — tab Blocchi/C++ (iter-80),
  linguaggio Principio Zero («Vol.3 Cap.6 Esp.1 pag.72», «Ragazzi,»),
  «Carica sul kit fisico» onestamente disabilitato (nessuna scheda).
- ✅ Compile end-to-end UI: click «Compila» → `POST /api/compile/nanor4` →
  «Compilazione riuscita ragazzi!». La UI instrada al proxy same-origin (iter-101
  confermato lato browser, non solo via curl).
- 🔴 **Bug `flashPercent` CONFERMATO LIVE nel browser.** Il pannello «Compilato»
  mostra **«107.2 KB / 256.0 KB (42%)»**. 107.2 KB = dimensione file `.hex` ASCII;
  il binario reale è ~39 KB ≈ **15%**. La UI sovrastima ~2.8×. Non più solo
  predetto dal code review — visto a schermo. Fix nel servizio Render (Phase 5).
- 🟡 `elab-galileo.onrender.com/health` → **503** — Nanobot AI (Render) cold/down.
  Cold-start free-tier noto (CLAUDE.md infra). Chat UNLIM usa Vertex Gemini
  primario, Render è fallback legacy → 503 qui non rompe la chat.
- 🟡 `funny-pika-3d1029.netlify.app` — backend Netlify Functions di ELAB (auth
  HMAC + `student-data-sync`), correttamente in CSP allowlist. NON un leak
  (verificato in `studentService.js`/`authService.js`). MA: **non documentato**
  nella tabella «Infrastruttura» di CLAUDE.md — drift documentazione.
- Console: 5 eccezioni, tutte `message channel closed` (rumore estensioni Chrome,
  `:0:0`, nessuno stack ELAB) — **zero errori del codice ELAB**.

## 1ter. Fix iter-102 — demo-readiness (demo Riccardo Omaric ven 2026-05-22 11:00)

Mandato Andrea: «demo il più vicino possibile a prodotto vendibile» +
«deve esserci blockly drag and drop, no scuse». 3 fix + 1 chore, tutti su
`fix/iter-99-compila-onesta` (PR #131).

### Fix 1 — `flashPercent` onesto (`7994a6c2`)

Il pannello «Compilato» mostrava `42%` per un Blink (reale ~14%). `iter-80.A5`
derivava i byte da `result.artifactSizeBytes` (= `hexSize`, dimensione del file
Intel HEX ASCII, ~2.8× il binario). NUOVO `src/utils/compileSizeParse.js`:
`resolveCompileFlash` parsa lo stdout di arduino-cli («Sketch uses N bytes (P%)»,
autoritativo) con fallback ai data record Intel HEX. 12 unit test.

### Fix 2 — Blockly drag-and-drop sbloccato (`4ea84967`)

Su `#compile-home` non si potevano trascinare i blocchi. Causa:
`.starterOverlay` era `position:absolute inset:0` + background opaco
(rgba 255,255,255,0.97) + `z-index:100` + NESSUN `pointer-events:none` →
copriva l'intero editor Blockly (toolbox inclusa) ogni volta che il workspace
era vuoto (lo stato di default). Solo le 3 card di partenza erano usabili.
Fix: overlay trasparente + click-through; toolbox + canvas usabili; la card
resta come scorciatoia non bloccante. Verificato live (dev server): click su
categoria → flyout apre coi blocchi.

### Fix 3 — editor Blockly allargato (`5b4205e5`)

L'editor era schiacciato a ~258px (toolbox 4/12 categorie). 3 cause: il pannello
«Cosa fa questo programma?» espanso di default (~210px), `editorGrid` senza row
track esplicito, `.workspace` min-height 320. Fix: ProgramExplainer collassato
di default (persistenza 'true'/'false'), `grid-template-rows: minmax(0,1fr)`,
`.workspace` min-height 520. Risultato verificato live: editor **258 → 458px**,
toolbox 7/12 categorie visibili.

### chore — `71713d56`

Header copyright auto-hook su 2 CSS IDE (per `src/` pulito = deploy riproducibile).

### CoV

vitest: compileSizeParse 12/12 + HomeCompileEntry/elabBlocks/ProgramExplainer
46/46, zero regressioni. Build produzione PASS. Verifica fisica del flash su
scheda Nano R4 reale: NON possibile senza hardware — la cross-compilazione live
resta verificata (HTTP 200 + hex reale).

### Fix 4 — ridisegno #compile-home: mascotte + composizione editor (`9f126adc`)

Andrea (review demo Riccardo): «questi simboli sono brutti, il robottino deve
essere la mascotte animata» + «[editor] questo non ha senso» + «usa impeccable».
Decisione Andrea: A+B per la demo, C (UNLIM agisce davvero) feature post-demo.

- **A — mascotte:** `UnlimCompileHelper` usava un'icona SVG grezza. Ora la
  mascotte ufficiale ELAB (Vera, `elab-mascot-vera.png`) in frame tondo,
  animata via CSS (idle respiro + reazioni stato: thinking/happy/concern).
- **B — composizione editor Blockly:** l'area era «bar soup» (4 barre
  impilate) + card starter opaca che galleggiava sopra la canvas. Ridisegno:
  rimosso l'header blu ridondante «ELAB Scratch Arduino»; gli starter da
  overlay → striscia pulita sopra l'editor (sparisce al primo blocco);
  toolbox + canvas sempre pulite.
- Verificato live dev server: 59 test pass, zero regressioni.

### Scoperto NON fatto (onesto)

- **Icone HomePage cards** (keyboard/book/video in `ElabIcons.jsx`) — Andrea
  le ha chiamate «brutte». Fatta la mascotte (la più visibile); il set di
  icone card resta da rifare — è lavoro di design iterativo, va fatto con
  l'occhio di Andrea, non a freddo.
- **C — UNLIM agisce su Blockly + codice + proattivo** — feature vera
  multi-giorno (come la Lavagna), NON polish. Differita post-demo per
  ratifica Andrea.

## 2. Stato morfismo — PR #132

`feat/percorso-morfico-runtime`, +3101/−13, 14 file in `src/components/lavagna/`.
Modalità Percorso morfica (Sense 1.5): `PercorsoCapitoloView` morfico +
`percorsoMorphicAdapter.js`. Recupero della sessione rescue 2026-05-20 (7 commit
iter-83 cherry-pick puliti). Verificato in quella sessione: `vite build` PASS +
14834 vitest PASS, zero regressioni.

Limite onesto noto (dalla sessione rescue): la feature è solo il lato **consumer**.
Nessun producer emette `elab:percorso-live-signal` → in prod il pannello «regia
live» resta inerte finché i producer non sono cablati. L'estrazione di
`percorsoLiveSignalBus` + producer è gated su merge #132 + mandato Andrea (tocca
`GalileoAdapter`/`useGalileoChat`).

---

## 3. Stato cross-compilazione — PR #131

`fix/iter-99-compila-onesta`, +280/−127, 10 file. iter-99 (`a7cd406e`) + iter-101
(`2a700bf1`). È il branch che gira **in produzione adesso** (deploy Codex).
`origin/main` + 2 commit, **0 dietro** — forward deploy legittimo, NON la
regressione 41-commit-dietro di iter-83.

---

## 4. 🔴 BLOCKER: CI sistemica rossa

I 7 PR sono tutti `MERGEABLE/UNSTABLE`. Il rollup CI è **identico su tutti** →
rosso anche su `main`:

| Check | Esito |
|-------|-------|
| `Verify governance rules 0-5` | 🔴 FAILURE |
| `quality-ratchet` | 🔴 FAILURE |
| `test` | 🔴 FAILURE (≥1 job) |
| Vercel / coverage / security | ✅ SUCCESS |

`UNSTABLE` ≠ `BLOCKED`: GitHub permette tecnicamente il merge (check non
*required*). **Ma il mandato «CI deve passare» = non si merge con CI rossa.**
Pre-esistente (handoff iter-83 §7: «P0 CI E2E pre-existing fail dal 12/05»).

**Conseguenza onesta:** «consolidare i 7 PR» non è possibile finché la CI di
`main` è rossa. La Phase 1 del piano è sbloccare la CI. Niente è stato merged
in questa sessione — sarebbe stato un merge con CI rossa.

---

## 5. Stato 7 PR aperti

| PR | Contenuto | Note |
|----|-----------|------|
| #128 | CLAUDE.md 4079→568 righe | grande superficie conflitto |
| #129 | MEDIUM follow-up review 7-PR | tocca file compile → dopo #131 |
| #130 | Handoff mBlock R3-R14 | doc puro |
| #131 | Cross-compile Nano R4 (iter-99+101) | **in prod ora** |
| #132 | Modalità Percorso morfica | file `lavagna/` disgiunti |
| #133 | Open Design pilot Percorso | doc puro (rescue) |
| #134 | Quality audit + README mappa | doc (rescue) |

---

## 6. Deploy

Prod serve `2a700bf1` (PR #131 branch), `main`+2/0-dietro. La «versione più
avanzata» **è già live** — Codex l'ha deployata in iter-101. Drift residuo: prod
gira un branch ≠ `main`. Si riconcilia con il merge #131 + redeploy da `main`
(piano Phase 2). NON si fa un Frankenstein-merge dei 7 PR per «deployare»: non
esiste una singola «versione più avanzata», sono 7 PR non integrati.

---

## 7. Piano

`docs/plans/2026-05-20-iter-102-consolidation-plan.md` — 7 fasi:
1. Sbloccare CI (BLOCKER) · 2. Merge #131+#132 + redeploy · 3. Doc PR ·
4. #129 per ultimo · 5. Fix `flashPercent` (repo Render) · 6. Warm-up + hook
anti-deploy-stale · 7. Verifica.

---

## 8. Cosa NON fatto questa sessione — con motivo onesto

- **Merge dei PR:** CI rossa. Merge ora = violazione mandato «CI deve passare».
  Phase 1 prima.
- **Spawn agent-team** (`/agent-teams:team-spawn`, `/agent-development`): il
  lavoro è sequenziale (review→piano→deploy-verify→debug), non scomponibile in
  parallelo. Un team sarebbe overhead (karpathy: simplicity first).
- **`/codex:review`:** la verifica live (HTTP 200 + hex reale + caveat upload
  onesto) è evidenza più forte di una review statica; iter-101 è una net-delete
  (−116 righe). Review extra = valore marginale.
- **Fix `flashPercent`:** è nel repo Render `elab-cloud-compile`, non qui.
- **claude-md-improver:** PR #128 sta già ristrutturando CLAUDE.md — conflitto
  certo. Dopo merge #128.

---
Sessione iter-102 documentata 2026-05-20 · ELAB Tutor
