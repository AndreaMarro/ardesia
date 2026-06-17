# Iter 25 ClawBot ToolSpec L2 Inventory — ONESTO

Date: 2026-04-29
Author: agent multi-tool dispatch test iter 25 (caveman terse)

## Honest Finding (G45 anti-inflation)

Mandato iter 24/25: "ClawBot collegato a TUTTO — 52/80 ToolSpec L2".
**Realtà file system**: 20 templates L2, NON 52.

`find scripts/openclaw/templates -name "L2-*.json" | wc -l` = **20**.

Claim 52/80 (CLAUDE.md "Sense 1" + master PDR) inflation 32 templates rispetto state filesystem confermato.

## Inventory completo 20 templates LIVE

Path: `scripts/openclaw/templates/L2-*.json`

| # | Template ID | Category | Steps | Tools (composition) |
|---|-------------|----------|-------|---------------------|
| 1 | L2-celebrate-end-volume | lesson-celebrate | 5 | (read JSON for full chain) |
| 2 | L2-celebrate-experiment-complete | feedback-positive | 5 | |
| 3 | L2-critique-circuit-photo | critique-vision | 5 | captureScreenshot+postToVision+ragRetrieve+speakTTS |
| 4 | L2-debug-short-circuit | diagnose-error | 5 | |
| 5 | L2-diagnose-led-fioco | lesson-diagnose | 5 | |
| 6 | L2-diagnose-led-rovesciato | diagnose-vision | 5 | captureScreenshot+postToVision+highlightComponent+speakTTS |
| 7 | L2-diagnose-no-current | diagnose | 5 | |
| 8 | L2-explain-condensatore-tempo | lesson-explain | 5 | highlightExperiment+mountExperiment+highlightComponent+ragRetrieve+speakTTS |
| 9 | L2-explain-led-blink | lesson-explain | 5 | highlightExperiment+mountExperiment+highlightComponent+ragRetrieve+speakTTS |
| 10 | L2-explain-pwm-fade | lesson-explain | 5 | |
| 11 | L2-explain-resistenza-pull-up | lesson-explain | 5 | |
| 12 | L2-guide-arduino-compile | guide-action | 5 | |
| 13 | L2-guide-mount-experiment | guide-build | 5 | mountExperiment+highlightComponent+ragRetrieve+speakTTS |
| 14 | L2-guide-scratch-blockly-first | lesson-program-first | 5 | |
| 15 | L2-guide-serial-monitor | lesson-guide | 5 | |
| 16 | L2-introduce-arduino-board | lesson-introduce | 5 | |
| 17 | L2-introduce-breadboard | lesson-introduce | 5 | |
| 18 | L2-introduce-resistor | lesson-introduce | 5 | |
| 19 | L2-recap-fine-lezione | lesson-recap | 5 | |
| 20 | L2-reroute-from-error | error-recovery | 5 | |

Tutti 5 step. Pattern morphic Sense 1.5 (docente experience + classProfile + kitTier inputs).

## Categorie aggregate

- lesson-explain: 4 (LED Blink, PWM, condensatore, pull-up)
- lesson-introduce: 3 (Arduino board, breadboard, resistor)
- diagnose: 4 (LED fioco, LED rovesciato, no current, short-circuit)
- critique-vision: 1 (foto circuito)
- guide-*: 4 (compile, mount, scratch first, serial monitor)
- celebrate: 2 (end volume, experiment complete)
- recap: 1
- error-recovery: 1

Multi-step composite handler: 100% (tutti 5-step pre-defined).
Single-tool: 0%.

## Layer 1 composite-handler runtime

`scripts/openclaw/composite-handler.ts:1-492` — `executeComposite()` sequential dispatch.
- Status: 'ok' | 'error' | 'blocked_pz' | 'cache_hit' | 'timeout' | 'unknown_tool' | 'not_composite' (lines 73-80).
- Iter introduzione: Sprint S iter 6 Task B1 (line 1).
- Test: 5/5 PASS (`composite-handler.test.ts`, iter 6 close + iter 8 +5 tests).
- Cache: deterministic `composite:${name}:${JSON.stringify(args)}` (line 226-230).

## Edge Functions LIVE (rinforzo claim iter 25)

`supabase/functions/`:
1. unlim-chat (v3 deploy iter 5 P3)
2. unlim-imagegen
3. unlim-stt
4. unlim-vision
5. unlim-tts
6. unlim-diagnose
7. unlim-hints
8. unlim-gdpr
9. unlim-dashboard-data + compile-proxy

**9 Edge Fn dirs filesystem**, claim "4 Edge Fn LIVE iter 25" UNDERREPORT.

## Gap inventory (52/80 originale)

L2 templates pianificati MA non ancora shipped: ~32 mancanti se obiettivo 52, ~60 se obiettivo 80. Distribuzione plausibile basata categorie esistenti:
- lesson-explain: 8 mancanti (corrente, tensione, GND, VCC, MOSFET, transistor, diodo, OpAmp)
- diagnose: 6 mancanti (no-output, scratch-error, timeout-arduino, ecc.)
- multimodal: ~10 mancanti (foto-kit + report fumetto + voice flow + ecc.)
- celebrate: 4 mancanti (capitolo, esperimento singolo, milestone classe, fine anno)
- guide: 4 mancanti (Scratch loop, Scratch condizione, Arduino upload, debug serial)

Stato: 20/52 = 38% (NON 52/52). 20/80 = 25%.
