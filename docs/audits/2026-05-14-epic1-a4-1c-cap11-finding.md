# EPIC 1 A4.1c — finding: Vol2 Cap.11 "I diodi" is pure theory (no experiments)

> iter 56. Read-only audit. Corrects the A3 master verdict.

## Claim
Vol2 Cap.11 "I diodi" contains **zero printed experiments**. The A3 master verdict's
"has printed experiments" claim is **WRONG**.

## Evidence (Claude — direct read)
`CONTENUTI/volumi-pdf/vol2.txt` lines 2624-2738 (PDF pp.99-102) — the full Cap.11 body:
- "COSA SONO I DIODI" — theory, one-way street analogy
- "COME LO RICONOSCIAMO?" — anodo/catodo, the cathode stripe
- diodes protect circuits (reverse-polarity), flyback/ricircolo diodes for motors
- PDF p.102 is a blank "NOTE" page; `CAPITOLO 12` begins at line 2739
- no `ESPERIMENTO`, no `ESERCIZIO`, no "prova tu"/"costruisci", no materials list, no
  step-by-step build anywhere in 2624-2738

## Evidence (Codex — independent re-derivation)
Codex GPT-5.5 (`--profile verify`, read-only, iter 56) independently read the same chapter
body and returned verdict **NO** (no hands-on experiment/laboratory block), citing lines
2624-2738, and concluded the A3 master verdict's "has printed experiments" claim is **WRONG**.
Claude ∩ Codex converged — anti-inflation loop closed.

## Consequence
Per parità stretta, **0** `v2-cap11-*` lesson-paths are authored. The A3 master verdict
is corrected (this iter). The "Cap.11 as a theory node in the narrative arc" question is
handed to A4.1e (narrative-structure regeneration), documented in the verdict's Open
decision 6 — NOT dropped.
