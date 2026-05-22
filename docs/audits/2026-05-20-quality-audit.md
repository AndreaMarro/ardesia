# Quality Audit — ELAB Tutor — 2026-05-20

Skill `/quality-audit` v1.0, eseguito durante la sessione "rescue percorso morfico".
Mandato Andrea: **NO COMPIACENZA, massima oggettività.**

## Scope

- Target: worktree `elab-builder-percorso-rescue` = `origin/main` `5e2573fa` + feature percorso morfico PR #132 (delta 14 file — trascurabile per metriche project-wide).
- 325 file JS/JSX + 76 file CSS in `src/`.
- Data: 2026-05-20.

## Score card

| Metrica | Valore reale | Target skill | Verdetto onesto |
|---|---|---|---|
| Font <14px (grep) | 183 (86 CSS + 97 JSX) | 0 | scomposto sotto — NON 183 violazioni |
| — 13px | 96 | — | ✅ OK (CLAUDE.md rule 8: 13px testi consentito) |
| — 10-12px | 71 | — | ⚠️ grey zone (OK se label secondaria ≥10px) |
| — <10px | 16 (JSX inline 8-9px) | 0 | 🔴 FAIL — sotto il floor assoluto 10px |
| Touch <44px (CSS min-height) | 6 | 0 | ⚠️ proxy grezzo |
| console.log (grep) | 9 | 0 | ✅ PASS — 0 cruft reale |
| console.* totale | 26 | — | OK (17 error/warn legittimi) |
| Bundle entry chunk | 546 KB | <1200 | ✅ PASS |
| Bundle chunk max | 1911 KB (react-pdf) | <1200 | 🟡 vendor lazy-split |
| Build (vite) | 1m 46s, PASS | <10s | target irrealistico per build offuscata |
| Vitest | 14834 PASS / 0 fail | — | ✅ PASS |
| aria-label | 378 | — | ✅ buona copertura |
| `<img>` senza alt | 0 | 0 | ✅ PASS |
| TODO/FIXME/HACK | 6 | — | ✅ basso |
| WCAG contrasto palette | 2/4 colori falliscono AA-testo | >90% | 🔴 vedi §4 |

## Dettaglio findings

### 1. Font size — 16 violazioni hard, 71 grey zone

Distribuzione <14px:
- CSS: 13px ×59 · 12px ×16 · 11px ×11
- JSX inline: 13px ×37 · 12px ×18 · 11px ×12 · 10px ×14 · 9px ×7 · 8px ×9

CLAUDE.md rule 8: "Font minimo 13px testi, 10px label secondarie."
- **96 a 13px** → conformi.
- **71 a 10-12px** → conformi SOLO se label secondaria; violazione se body text. Review per-caso.
- **16 a 8-9px (tutti JSX inline style)** → violazione hard, sotto il floor 10px.

Raccomandazione: i 16 sotto-10px → almeno 10px (label) o 13px (testo). I 71 grey-zone → audit per-componente.

### 2. console.log — 0 cruft reale (raw count 9 fuorviante)

9 occorrenze, tutte legittime:
- `utils/logger.js` ×3 — logger dev-gated (`if (isDev) console.log`). Pattern corretto.
- `services/elab-agent/cli.js` ×4 — CLI tool, stdout logging corretto.
- `services/simulator-api.js:16` — dentro commento JSDoc (esempio), non codice eseguito.
- `utils/codeProtection.js:75` — banner branding console, try/catch.

→ Nessun debug `console.log` lasciato nel bundle browser. **PASS.**

### 3. Bundle — entry OK, react-pdf pesante

Entry/index chunk 546 KB → OK. Chunk più grande `react-pdf` 1911 KB: è code-split (caricato solo per la visualizzazione PDF), non blocca il load iniziale. Resta target di ottimizzazione — valutare se react-pdf è sostituibile/alleggeribile.

### 4. WCAG contrasto palette (su bianco, calcolo approssimato)

- Navy `#1E4D8C` — ~7.5:1 → ✅ AA + AAA
- Lime `#4A7A25` — ~5.0:1 → ✅ AA testo normale
- Orange `#E8941C` — ~2.4:1 → 🔴 FAIL AA (e sotto anche 3:1 large)
- Red `#E54B3D` — ~3.9:1 → 🔴 FAIL AA testo normale; ✅ solo large text / graphics (3:1)

Orange e Red NON vanno usati come testo piccolo su bianco — OK come accenti, bordi, icone, large text. Verificare gli usi reali nei componenti.

### 5. Touch target — proxy

6 dichiarazioni `min-height` <44px in CSS. Proxy grezzo: non tutte su elementi interattivi. Audit per-elemento interattivo NON eseguito.

## Limiti dell'audit (onestà)

- **WCAG**: analitico (matematica contrasto + grep aria/alt). Nessuna scansione axe-core automatica (deferred iter 82, pending ratifica `@axe-core/playwright`).
- **Touch**: proxy `min-height` CSS, non audit per-elemento.
- **Font count**: solo literal numerici (`font-size: 13px`, `fontSize: 13`). Forme stringa (`'13px'`) o `var()` NON contate → conteggi = **lower bound**.
- **Dead code**: non misurato (grep `-L import` inaffidabile).
- **Scope**: worktree rescue, non checkout pristine di origin/main.

## Sintesi onesta

Qualità **discreta con debiti specifici reali** — né il disastro che le metriche blunt dello skill dipingerebbero (target "0 font <14px" contraddice rule 8; "console.log 0" non distingue logger dev-gated da cruft), né perfezione.

- **Forte:** 14834 test pass · 378 aria-label · 0 img senza alt · console pulita · build verde.
- **Debiti azionabili:** 🔴 16 font <10px · 🔴 contrasto Orange/Red come testo · 🟡 react-pdf 1911 KB · ⚠️ ~71 font 10-12px da verificare · ⚠️ 6 touch proxy.

NO score /10 — G45: niente self-rate senza review Opus indipendente. Score oggettivo canonico: `node scripts/benchmark.cjs --write`.

## Raccomandazioni prioritarie

1. Fix 16 font <10px (JSX inline) → ≥10px label o 13px testo.
2. Audit usi reali Orange/Red — se testo piccolo, scurire o passare a Navy/Lime.
3. Verificare i 71 font 10-12px caso-per-caso (label vs body text).
4. Valutare alleggerimento `react-pdf` (1911 KB).
5. Eseguire axe-core scan automatica (sblocca `@axe-core/playwright`) per WCAG completo.
