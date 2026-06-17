# ELAB Project Memory — Index

## Architecture & Deploy
→ [architecture.md](architecture.md) — paths, deploy commands, palette, fonts, critical rules, Brain V13

## Scores & Bugs
→ [scores.md](scores.md) — quality scores per area, known bugs, honest assessment

## Session History
→ [session-summaries.md](session-summaries.md) — per-session deliverables
→ [resolved-issues.md](resolved-issues.md) — fixed bugs by session
→ [sprint-history.md](sprint-history.md) — Sprint 1-3 history

## Technical Notes
→ [simulator-notes.md](simulator-notes.md) — simulator architecture, Scratch/Blockly, Passo Passo
→ [galileo-brain-v13.md](galileo-brain-v13.md) — Brain PoC training details, GGUF, dataset
→ [game-scoring.md](game-scoring.md) — game scoring rules

## Verification
→ [chain-of-verification-19feb2026.md](chain-of-verification-19feb2026.md) — CoV methodology

## Reference
→ [tinkercad-palette.md](tinkercad-palette.md) — Tinkercad component colors

## Automa
- **State**: `PRODOTTO/elab-builder/automa/STATE.md` — current project state
- **Handoff**: `PRODOTTO/elab-builder/automa/handoff.md` — last session handoff
- **PDR**: `PRODOTTO/elab-builder/automa/PDR.md` — priority plan (16 aspects)
- **Knowledge**: `PRODOTTO/elab-builder/automa/knowledge/INDEX.md` — 22 research docs

## Quick Reference
- Build: `cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build`
- Deploy Vercel: `npm run build && npx vercel --prod --yes`
- Brain VPS: `http://72.60.129.50:11434` (model: galileo-brain-v13, Qwen3.5-2B Q5_K_M)
- Nanobot: `https://elab-galileo.onrender.com/health`
- Budget: €50/mese (Claude escluso)
