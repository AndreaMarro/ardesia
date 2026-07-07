# PROMPT-NEXT-FABLE-2026-07-15 (handoff da NOTTE-13)

Sei Claude Code FABLE NOTTE-14, ARDESIA/ELAB, sessione lunga, reasoning massimo.
Governance: AUTONOMIA MASSIMA con evidenza (nessun "gate Andrea" ordinario —
decidi, implementa, testa, documenta tradeoff+rollback). Regole assolute
invariate: no cancellazioni distruttive, no push su main, no segreti/PII/corpus
grezzo, no pagamenti/mail reali fuori sandbox, no git add -A, PR piccole con CoV.

## Stato ereditato da NOTTE-13 (tutto merged)

- **#136** Product Flow Shell: ViewNav in Room/ElabLab/cruscotto/lezioni, hash stanza preservato, e2e flusso completo.
- **#137** ADR-0003 zone di stress LED (D4-2 RISOLTO in autonomia): nominale ≤25mA / overdrive ≤50mA / pericolo ≤100mA / bruciato >100mA nel wrapper elabSolver (motore vendored intatto). esp3 sbloccata: catalogo 3/88, toolbar "sim esp3", zona in diagnostica.
- **#138** Student pack ARTEFATTO: formato ardesia.studentpack/1 (zod fail-closed), download da Z7, import "Riapri pack" con pannello, e2e round-trip reale. Gotcha: race scrittura-IndexedDB vs navigazione (retry con reload); labels reali hanno solo "it".
- **#139** Overlay strutturale visualMatch: scripts/visual-overlay-report.ts (Playwright rasterizza, zero nuove dep) → docs/ops/overlays/<id>-{overlay.png,report.json}; livello **verified-structural** (strictOnGrid+checks+evidenza; MAI verified-human). esp1/esp2/esp3 = 3/3. Drift-guard in VisualOverlayReport.test.ts; rigenerazione: `npx tsx scripts/visual-overlay-report.ts`.
- **#140** Catalogo multi-pin: potentiometer+rgb-led registrati (il motore li supportava già); v1-cap9-esp6 solve reale falsificabile (3 canali indipendenti). esp6 = mounted-candidate (solve reale).
- Suite ~1276/5. ⚠️ Gotcha CoV: MAI `vitest|playwright | tail` (maschera exit); `cd ..` da apps/studio finisce in apps/ (usare path assoluti nei one-liner multipli). Flake noto: Welcome.test excalidraw-mock timeout 1s sotto carico.

## Matrice 8/8 (docs/ops/ELAB-VISIBLE-EXPERIMENTS-VISUAL-REFERENCE-MATRIX-2026-07-13.md)

verified-structural: esp1, esp2, esp3 (3/8) · mounted-candidate solve reale: v1-cap9-esp6 · static-only: v2-cap7-esp1/esp2, v3-cap6-esp4 (HEX riconciliato pin-6) / esp5 (HEX in quarantena caratterizzata).

## PRIORITÀ NOTTE-14 (decidi tu l'ordine con evidenza)

1. **Scena circuit-scene/2 per v1-cap9-esp6** (pp.71-74 già estratte in NOTTE-12): bridge+renderer multi-pin (pot 3-pin, RGB 4-pin — oggi fail-closed), fixture con helper sceneAuthoring, bookConstraints, overlay strutturale. È il pezzo che manca per verified-structural 4/8.
2. **Vol.2 condensatore (v2-cap7-esp1/esp2)**: il motore ha _solveCapacitor + multimeter + push-button; serve breadboard-full nel renderer di scena + modello temporale (τ=RC=1000µF·R). Fonte: BreadboardFull.jsx del plugin.
3. **v3 con breakout**: portare NanoR4Board.jsx (SVG "ELAB NanoBreakout") in apps/studio per le scene esp4/esp5; per esp5 generare v3-cap6-esp5.hex+r4 (pin 5/6/9) con arduino-cli (binario arm's length, GPL ok come subprocess) e flippare la quarantena caratterizzata in ElabVol3HexTruth.test.ts.
4. **Wire editing interattivo**: modello dati pronto (insertBendPoint); pattern raccomandati dal research ledger: points nativi Excalidraw + FixedPointBinding + elbow ortogonale (docs/ops/EXTERNAL-RESEARCH-LEDGER-2026-07-13.md).
5. **Passo-passo esp3**: la grammatica step non esprime valori resistore — estenderla (expectation kind "component-value") o dichiarare permanente.
6. **Entitlement UI**: entitlementCore/mailSink esistono core-only; cablare in vista con mail SOLO sandbox/dev.

## Rossi noti pre-esistenti
- e2e montaggio-canvas (click bb1:i9 intercettato da canvas Excalidraw, da NOTTE-10, confermato con stash su main pulito) — candidato fix embed-activation.
- Canvas plugin in ElabLab = segnaposto neri (la superficie visiva è il post-it).

## Disciplina
git status + git log -1 origin/main + gh pr list prima di agire; TDD; tsc -b + build + full vitest ×3 (exit catturato) + Playwright se UI; NUL/secret/PII scan; merge SOLO con CI verde + bin/pr-merge-verify.sh (worktree ardesia-wt-merge-verify); branch mai cancellati; whitelist VISIBLE_EXP_IDS = fonte di verità; pagine libro via pdftoppm 180dpi dai PDF interni; chiudi con STATUS + PROMPT-NEXT-FABLE-2026-07-16-NOTTE14.md.
