# Kirchhoff reuse note (read-only audit, 2026-09-20 — NO integration)

Source: `/Users/andreamarro/MATJOURNEY/kirchhoff` (read-only). Kirchhoff
governance does NOT become Ardesia governance.

## BORROW (patterns, not code)

- Preinstalled-browser discovery, no downloads (`gate.mjs:28-36`) → already
  mirrored by `browser_pdf.py` discovery (`ARDESIA_CHROMIUM` → playwright
  cache newest-first → Chrome app).
- Publish-only-after-validate via staging + atomic swap → already mirrored
  (`os.replace` after candidate validation).
- Pure projection before effects → already mirrored (digest before
  store/router writes in `compose.py`).
- Single canonical root; PDF stays caller-side post-inspection.
- Typed boundary + schema pin → pin the Ardesia export contract the same way.
- Receipt = measurements not judgments + SHA → evidence pack records
  metrics/CI/SHA, never model verdicts as facts.
- Exact-SHA gate receipts with explicit P2/P3 disposition.
- Declared non-coverage → keep declaring limits (pdfinfo-open gate pattern).
- Distinct outcome vocab (failure vs refusal) → keep fail-closed
  `ValueError/FileNotFoundError/RuntimeError`, never `None`.

## DO_NOT_BORROW

- Domain logic (MNA/tableau, exact-claim machinery, DC-only scope).
- Governance-as-code (mandatory quorums, zero-human-review branch policy).
- VERIFIED/CLOSED/Product-Verified trichotomy tied to electrical claims;
  visual-single-truth layout store; vault paths; React workbench surface.

## FUTURE (adapter sketches only)

- Ardesia SummaryPack→Studio typed view modeled on a frozen versioned view.
- Pixel-paint gate for rendered PDF pages alongside %PDF-/%%EOF/pdfinfo.
- SHA-pinned per-run evidence note + adversarial fault-injection review lane.
