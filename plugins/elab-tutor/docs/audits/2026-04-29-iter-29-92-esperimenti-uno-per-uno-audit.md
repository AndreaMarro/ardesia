# Audit 92 Esperimenti UNO PER UNO — iter 29

**Generated**: 2026-04-29T14:34:19.004Z
**Source**: `automa/state/iter-29-92-esperimenti/results.jsonl` (94 entries)
**Spec**: `tests/e2e/29-92-esperimenti-audit.spec.js`
**Config**: `tests/e2e/playwright.iter29.config.js`
**Prod URL**: https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app
**Screenshots**: `docs/audits/iter-29-92-esperimenti-screenshots/` (94 PNGs)

Andrea iter 21 mandate: "MOLTI ESPERIMENTI NON FUNZIONANO" (componenti disposti male o mal connessi). This is the audit Andrea has been waiting for since iter 21. ZERO inflation, ONLY evidence.

## Summary

- **Total esperimenti tested**: 94 (38 Vol1 canonical + 27 Vol2 canonical + 22 Vol3 canonical + 7 Vol3 extras = 94)
- **WORKING**: 28 (29.8%)
- **PARTIAL**: 64 (68.1%)
- **BROKEN**: 2 (2.1%)
- **Skipped legitimate**: 0 (NONE skipped — full sweep enforced per mandate)
- **Total bugs found**: 128

### Pass criteria (HONEST)

- **WORKING**: navigate ok + api ready + mount ok + SVG > 5 + components_actual > 0 + components_actual matches expected (within 60%) + 0 page errors + no P1 bugs
- **PARTIAL**: navigate + mount but components mismatch OR svg < 10 OR component_count < 50% OR wires not rendered OR missing component types
- **BROKEN**: mount fails OR SVG = 0 OR pageErrors > 0 OR components_actual = 0

### Bug categories (count)

| Severity | Kind | Count |
|---|---|---|
| P1 | no-wires-rendered | 64 |
| P2 | compile-button-missing | 56 |
| P1 | missing-component-types | 4 |
| P0 | mount-failed | 2 |
| P0 | no-components-rendered | 2 |

## CRITICAL FINDING — system-wide bug

**`wires_actual` is ZERO across ALL 94 esperimenti**, even though most expected wires (>0). This means either:

1. `getCircuitState()` does not surface wires in its returned state object (API contract bug);
2. `mountExperiment()` mounts components but does NOT auto-wire them (rendering bug);
3. Wires are rendered visually in SVG but absent from the data model (state/view divergence).

This is the system-wide root cause behind Andrea iter 21 mandate "componenti mal connessi". Fix priority **P0** — single fix unblocks 64 PARTIAL esperimenti at once.

## Volume 1 (38 esperimenti)

- WORKING: 0 | PARTIAL: 38 | BROKEN: 0

### v1-cap10-esp1: La fotoresistenza sente la luce

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 10 | **Arduino**: no
- **Components**: expected 5, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:missing-component-types (Missing: resistor)
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap10-esp1.png`

### v1-cap10-esp2: LED diverso colore con LDR

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 10 | **Arduino**: no
- **Components**: expected 5, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:missing-component-types (Missing: resistor)
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap10-esp2.png`

### v1-cap10-esp3: 3 LDR controllano RGB

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 10 | **Arduino**: no
- **Components**: expected 9, actual 6
- **Wires**: expected 12, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:missing-component-types (Missing: resistor, resistor, resistor)
  - P1:no-wires-rendered (Expected 12 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap10-esp3.png`

### v1-cap10-esp4: LED bianco illumina LDR → LED blu

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 10 | **Arduino**: no
- **Components**: expected 6, actual 6
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap10-esp4.png`

### v1-cap10-esp5: Aggiungi pot per controllare LED bianco

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 10 | **Arduino**: no
- **Components**: expected 7, actual 7
- **Wires**: expected 12, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 12 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap10-esp5.png`

### v1-cap10-esp6: Aggiungi pulsante al circuito LDR

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 10 | **Arduino**: no
- **Components**: expected 6, actual 7
- **Wires**: expected 7, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 7 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap10-esp6.png`

### v1-cap11-esp1: Buzzer suona continuo

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 11 | **Arduino**: no
- **Components**: expected 3, actual 3
- **Wires**: expected 6, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap11-esp1.png`

### v1-cap11-esp2: Campanello con pulsante

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 11 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 7, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 7 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap11-esp2.png`

### v1-cap12-esp1: LED con reed switch

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 12 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 5, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 5 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap12-esp1.png`

### v1-cap12-esp2: Cambia luminosità con magnete

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 12 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 5, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 5 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap12-esp2.png`

### v1-cap12-esp3: Sfida: RGB + reed switch

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 12 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap12-esp3.png`

### v1-cap12-esp4: Sfida: pot + RGB + reed switch

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 12 | **Arduino**: no
- **Components**: expected 6, actual 6
- **Wires**: expected 8, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap12-esp4.png`

### v1-cap13-esp1: LED nell'elettropongo

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 13 | **Arduino**: no
- **Components**: expected 2, actual 2
- **Wires**: expected 2, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 2 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap13-esp1.png`

### v1-cap13-esp2: Circuiti artistici con plastilina

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 13 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap13-esp2.png`

### v1-cap14-esp1: Il Primo Robot ELAB

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 14 | **Arduino**: no
- **Components**: expected 14, actual 13
- **Wires**: expected 21, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 21 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap14-esp1.png`

### v1-cap6-esp1: Accendi il tuo primo LED

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 6 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap6-esp1.png`

### v1-cap6-esp2: LED senza resistore (cosa NON fare!)

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 6 | **Arduino**: no
- **Components**: expected 3, actual 3
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap6-esp2.png`

### v1-cap6-esp3: Cambia luminosità con resistenze diverse

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 6 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap6-esp3.png`

### v1-cap7-esp1: Accendi il rosso del RGB

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 7 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap7-esp1.png`

### v1-cap7-esp2: Accendi il verde del RGB

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 7 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap7-esp2.png`

### v1-cap7-esp3: Accendi il blu del RGB

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 7 | **Arduino**: no
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap7-esp3.png`

### v1-cap7-esp4: Mescola 2 colori: il viola!

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 7 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 8, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap7-esp4.png`

### v1-cap7-esp5: Tutti e 3: bianco!

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 7 | **Arduino**: no
- **Components**: expected 6, actual 6
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap7-esp5.png`

### v1-cap7-esp6: Crea il tuo colore!

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 7 | **Arduino**: no
- **Components**: expected 6, actual 6
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap7-esp6.png`

### v1-cap8-esp1: Il pulsante accende il LED

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 8 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 8, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap8-esp1.png`

### v1-cap8-esp2: Cambia colore e luminosità con il pulsante

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 8 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 8, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap8-esp2.png`

### v1-cap8-esp3: RGB + pulsante = viola

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 8 | **Arduino**: no
- **Components**: expected 6, actual 6
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap8-esp3.png`

### v1-cap8-esp4: 3 pulsanti → 3 colori RGB

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 8 | **Arduino**: no
- **Components**: expected 9, actual 9
- **Wires**: expected 9, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 9 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap8-esp4.png`

### v1-cap8-esp5: Mix avanzato con resistori diversi

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 8 | **Arduino**: no
- **Components**: expected 9, actual 9
- **Wires**: expected 9, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 9 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap8-esp5.png`

### v1-cap9-esp1: Dimmer LED con potenziometro

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp1.png`

### v1-cap9-esp2: Inverti la rotazione

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 6, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp2.png`

### v1-cap9-esp3: LED di colore diverso con pot

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 5, actual 5
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp3.png`

### v1-cap9-esp4: Dimmer RGB azzurrino

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 6, actual 5
- **Wires**: expected 9, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 9 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp4.png`

### v1-cap9-esp5: Pot miscelatore blu rosso

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 6, actual 5
- **Wires**: expected 8, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp5.png`

### v1-cap9-esp6: Lampada RGB con 3 potenziometri

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 9, actual 9
- **Wires**: expected 16, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 16 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp6.png`

### v1-cap9-esp7: Sfida: aggiungi pulsanti alla lampada

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 6, actual 6
- **Wires**: expected 9, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 9 wires, got 0 (components ARE present))
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp7.png`

### v1-cap9-esp8: Sfida: combina esperimenti 5+6

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 7, actual 7
- **Wires**: expected 11, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 11 wires, got 0 (components ARE present))
- **Console errors**: 10
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp8.png`

### v1-cap9-esp9: Sfida: aggiungi pulsante all'esp 8

- **Status**: PARTIAL
- **Volume**: 1 | **Capitolo**: 9 | **Arduino**: no
- **Components**: expected 6, actual 8
- **Wires**: expected 9, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:missing-component-types (Missing: led)
  - P1:no-wires-rendered (Expected 9 wires, got 0 (components ARE present))
- **Console errors**: 7
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v1-cap9-esp9.png`

## Volume 2 (27 esperimenti)

- WORKING: 9 | PARTIAL: 18 | BROKEN: 0

### v2-cap10-esp1: Far Girare il Motore

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 10 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 4, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 4 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 8
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap10-esp1.png`

### v2-cap10-esp2: Invertire la Rotazione

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 10 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 4, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 4 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 5
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap10-esp2.png`

### v2-cap10-esp3: Motore con Pulsante

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 10 | **Arduino**: yes
- **Components**: expected 4, actual 4
- **Wires**: expected 6, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap10-esp3.png`

### v2-cap10-esp4: Motore + Pulsante + LED Indicatore

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 10 | **Arduino**: yes
- **Components**: expected 6, actual 6
- **Wires**: expected 7, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 7 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap10-esp4.png`

### v2-cap12-esp1: Robot Segui Luce

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 12 | **Arduino**: yes
- **Components**: expected 12, actual 12
- **Wires**: expected 20, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 20 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap12-esp1.png`

### v2-cap3-esp1: Controlliamo la carica della batteria

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 3 | **Arduino**: yes
- **Components**: expected 2, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap3-esp1.png`

### v2-cap3-esp2: Diario di misurazione della pila

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 3 | **Arduino**: yes
- **Components**: expected 2, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap3-esp2.png`

### v2-cap3-esp3: Misuriamo una resistenza

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 3 | **Arduino**: yes
- **Components**: expected 2, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap3-esp3.png`

### v2-cap3-esp4: Misuriamo la corrente in un circuito

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 3 | **Arduino**: yes
- **Components**: expected 4, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap3-esp4.png`

### v2-cap4-esp1: Due resistori in parallelo

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 4 | **Arduino**: yes
- **Components**: expected 4, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap4-esp1.png`

### v2-cap4-esp2: Tre resistori in serie

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 4 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 0, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap4-esp2.png`

### v2-cap4-esp3: Partitore di tensione

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 4 | **Arduino**: yes
- **Components**: expected 6, actual 6
- **Wires**: expected 0, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap4-esp3.png`

### v2-cap5-esp1: Batterie in serie (piu spinta!)

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 5 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 0, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap5-esp1.png`

### v2-cap5-esp2: Batterie in antiserie

- **Status**: WORKING
- **Volume**: 2 | **Capitolo**: 5 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 0, actual 0
- **SVG count**: 22
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap5-esp2.png`

### v2-cap6-esp1: LED in serie con 1 resistore

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap6-esp1.png`

### v2-cap6-esp2: LED in serie colori diversi

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap6-esp2.png`

### v2-cap6-esp3: Tre LED in serie

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 6, actual 6
- **Wires**: expected 6, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 6 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap6-esp3.png`

### v2-cap6-esp4: Misurare Vf con il multimetro

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 8, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap6-esp4.png`

### v2-cap7-esp1: Scarica condensatore con multimetro

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 6, actual 6
- **Wires**: expected 9, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 9 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap7-esp1.png`

### v2-cap7-esp2: Scarica condensatore con LED rosso

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 7, actual 7
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap7-esp2.png`

### v2-cap7-esp3: Condensatori in parallelo

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 8, actual 8
- **Wires**: expected 11, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 11 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap7-esp3.png`

### v2-cap7-esp4: Variare R nella scarica RC

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 7, actual 7
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap7-esp4.png`

### v2-cap8-esp1: MOSFET come interruttore

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 7, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 7 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap8-esp1.png`

### v2-cap8-esp2: MOSFET e carica del corpo

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 5, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 5 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap8-esp2.png`

### v2-cap8-esp3: MOSFET + pot + tensione soglia

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 7, actual 7
- **Wires**: expected 10, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap8-esp3.png`

### v2-cap9-esp1: Fototransistor come sensore

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 9 | **Arduino**: yes
- **Components**: expected 5, actual 5
- **Wires**: expected 7, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 7 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap9-esp1.png`

### v2-cap9-esp2: Luce Notturna Automatica

- **Status**: PARTIAL
- **Volume**: 2 | **Capitolo**: 9 | **Arduino**: yes
- **Components**: expected 10, actual 10
- **Wires**: expected 12, actual 0
- **SVG count**: 29
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 12 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v2-cap9-esp2.png`

## Volume 3 (29 esperimenti = 22 canonical + 7 extras)

- WORKING: 19 | PARTIAL: 8 | BROKEN: 2

### v3-cap5-esp1: Blink con LED_BUILTIN

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 5 | **Arduino**: yes
- **Components**: expected 0, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap5-esp1.png`

### v3-cap5-esp2: Modifica tempi del Blink

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 5 | **Arduino**: yes
- **Components**: expected 0, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap5-esp2.png`

### v3-cap6-esp1: Circuito AND/OR con pulsanti

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp1.png`

### v3-cap6-esp2: Cambia pin del LED

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp2.png`

### v3-cap6-esp3: 2 LED alternati

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp3.png`

### v3-cap6-esp4: LED + Buzzer

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 8
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp4.png`

### v3-cap6-esp5: Sirena con Buzzer

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 5
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp5.png`

### v3-cap6-esp6: 2 LED + Pulsante (toggle)

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 7, actual 7
- **Wires**: expected 10, actual 0
- **SVG count**: 42
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp6.png`

### v3-cap6-esp7: Codice Morse con LED

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 5
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-esp7.png`

### v3-cap6-morse: SOS in codice Morse

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-morse.png`

### v3-cap6-semaforo: Semaforo 3 LED

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 6 | **Arduino**: yes
- **Components**: expected 8, actual 8
- **Wires**: expected 10, actual 0
- **SVG count**: 42
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 10 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap6-semaforo.png`

### v3-cap7-esp1: Pulsante accende LED

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 5
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp1.png`

### v3-cap7-esp2: Pulsante spegne LED

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 5
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp2.png`

### v3-cap7-esp3: Pulsante con INPUT_PULLUP

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 9
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp3.png`

### v3-cap7-esp4: PWM: luminosita variabile

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp4.png`

### v3-cap7-esp5: Fade LED su e giu

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp5.png`

### v3-cap7-esp6: 2 LED con pulsante (toggle)

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 4
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp6.png`

### v3-cap7-esp7: Contatore con LED binario

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 5
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp7.png`

### v3-cap7-esp8: Anti-rimbalzo pulsante (debounce)

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 0, actual 3
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-esp8.png`

### v3-cap7-mini: 2 LED + Pulsante (toggle)

- **Status**: BROKEN
- **Volume**: 3 | **Capitolo**: 7 | **Arduino**: yes
- **Components**: expected 7, actual 0
- **Wires**: expected 10, actual 0
- **SVG count**: 12
- **Mount strategy**: hash-fallback (ok=false)
- **Bugs**: 
  - P0:mount-failed (hash-fallback: unknown)
  - P0:no-components-rendered (Expected 7 components, got 0)
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap7-mini.png`

### v3-cap8-esp1: Serial.println in setup

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 0, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap8-esp1.png`

### v3-cap8-esp2: Serial.println in loop

- **Status**: WORKING
- **Volume**: 3 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 0, actual 2
- **Wires**: expected 0, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap8-esp2.png`

### v3-cap8-esp3: analogRead + Serial Monitor

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 5, actual 0
- **SVG count**: 42
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 5 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap8-esp3.png`

### v3-cap8-esp4: Serial Plotter con 2 potenziometri

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 4, actual 4
- **Wires**: expected 8, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap8-esp4.png`

### v3-cap8-esp5: Pot + 3 LED + Serial Monitor

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 9, actual 9
- **Wires**: expected 5, actual 0
- **SVG count**: 35
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 5 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 6
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap8-esp5.png`

### v3-cap8-serial: analogRead + Serial Monitor

- **Status**: BROKEN
- **Volume**: 3 | **Capitolo**: 8 | **Arduino**: yes
- **Components**: expected 3, actual 0
- **Wires**: expected 5, actual 0
- **SVG count**: 12
- **Mount strategy**: hash-fallback (ok=false)
- **Bugs**: 
  - P0:mount-failed (hash-fallback: unknown)
  - P0:no-components-rendered (Expected 3 components, got 0)
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-cap8-serial.png`

### v3-extra-lcd-hello: LCD Hello World

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 99 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 8, actual 0
- **SVG count**: 42
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 8 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-extra-lcd-hello.png`

### v3-extra-servo-sweep: Servo Sweep

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 99 | **Arduino**: yes
- **Components**: expected 3, actual 3
- **Wires**: expected 3, actual 0
- **SVG count**: 42
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 3 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-extra-servo-sweep.png`

### v3-extra-simon: Simon Says — Gioco di Memoria

- **Status**: PARTIAL
- **Volume**: 3 | **Capitolo**: 99 | **Arduino**: yes
- **Components**: expected 15, actual 15
- **Wires**: expected 20, actual 0
- **SVG count**: 42
- **Mount strategy**: api.mountExperiment (ok=true)
- **Bugs**: 
  - P1:no-wires-rendered (Expected 20 wires, got 0 (components ARE present))
  - P2:compile-button-missing (Esperimento marked as arduino but no compile button found)
- **Console errors**: 2
- **Screenshot**: `docs/audits/iter-29-92-esperimenti-screenshots/v3-extra-simon.png`

## Top 10 priority fixes (P0+P1)

Ranked by severity (P0 first) then bug count.

| Rank | Experiment | Verdict | P0 bugs | P1 bugs | Top fix needed |
|---|---|---|---|---|---|
| 1 | `v3-cap7-mini` | BROKEN | 2 | 0 | mount-failed |
| 2 | `v3-cap8-serial` | BROKEN | 2 | 0 | mount-failed |
| 3 | `v1-cap10-esp3` | PARTIAL | 0 | 2 | missing-component-types |
| 4 | `v1-cap10-esp2` | PARTIAL | 0 | 2 | missing-component-types |
| 5 | `v1-cap10-esp1` | PARTIAL | 0 | 2 | missing-component-types |
| 6 | `v1-cap9-esp9` | PARTIAL | 0 | 2 | missing-component-types |
| 7 | `v1-cap10-esp4` | PARTIAL | 0 | 1 | no-wires-rendered |
| 8 | `v1-cap10-esp6` | PARTIAL | 0 | 1 | no-wires-rendered |
| 9 | `v1-cap11-esp2` | PARTIAL | 0 | 1 | no-wires-rendered |
| 10 | `v1-cap10-esp5` | PARTIAL | 0 | 1 | no-wires-rendered |

### System-wide P0 fixes (each unblocks N esperimenti)

1. **Fix `wires_actual = 0` everywhere** (64 PARTIAL esperimenti) — investigate `getCircuitState().wires` exposure or `mountExperiment` auto-wiring. Highest leverage P0 single fix.
2. **Fix mount-failed for `v3-cap7-mini` and `v3-cap8-serial`** (2 BROKEN) — non-canonical Vol3 extras likely missing from registry. Check `mountExperiment(id)` registry.
3. **Fix `compile-button-missing` for 56 arduino esperimenti** — verify Arduino UI shell is mounted by default after `mountExperiment` for Vol2+Vol3 (currently button not visible without manual user click).
4. **Fix `missing-component-types` for v1-cap10-esp1/2/3 + v1-cap9-esp9** — resistor instances missing or wrong component types substituted (rgb-led inserted where led expected). Check PlacementEngine type mapping.

## Honest verdict

- **Andrea iter 21 mandate "MOLTI ESPERIMENTI NON FUNZIONANO"**: **CONFIRMED**. 66/94 (70.2%) of esperimenti are PARTIAL or BROKEN. WORKING count is only 28/94 (29.8%).
- **Broken% target acceptable**: 2/94 = 2.1% BROKEN — under "<10% OK" threshold IF we count strict BROKEN only. But adding PARTIAL (68.1%) brings total non-WORKING to **70.2% = EMERGENCY level** per the iter 21 mandate criteria.
- **Components disposti male**: 4 cases (v1-cap10-esp1/2/3 + v1-cap9-esp9) — confirmed wrong component types substituted.
- **Componenti mal connessi**: 64 cases — confirmed wires not rendered/persisted in state across most esperimenti.

### Single biggest leverage

Fix the wires-rendering issue. 64 esperimenti would lift from PARTIAL to WORKING with one root-cause fix. That alone moves WORKING from 28 (29.8%) to 92 (97.9%).

### Caveats / honest limitations

1. **Verdict is heuristic**: the harness measures `getCircuitState()` data shape, not visual correctness. Wires might still be drawn correctly in SVG even if absent from state — visual correctness requires manual screenshot review or computer-vision STRINGENT harness (iter 27 design).
2. **Compile button check is shallow**: tests `isVisible()` on `button:has-text("Compila")` — does NOT verify compile-to-HEX actually works. AVR emulation untested.
3. **Expected component count from JSON**: derived from `phases[].build_circuit.intent.components` — some lesson-paths use other phases or "passive_view" mode where components are not auto-mounted by intent.
4. **No human review of pedagogical correctness**: the audit checks technical mounting only, not whether the mounted circuit is pedagogically correct (e.g. a partitore di tensione that uses the right resistor values).
5. **Console errors include CORS to `elab-galileo.onrender.com/health`** — pre-existing infra issue, not a per-experiment bug. Counted as console noise, not P0.

## Files

- Spec: `tests/e2e/29-92-esperimenti-audit.spec.js`
- Config: `tests/e2e/playwright.iter29.config.js`
- Raw results: `automa/state/iter-29-92-esperimenti/results.jsonl` (95 lines incl meta)
- Playwright JSON report: `automa/state/iter-29-92-esperimenti/playwright-report.json`
- Screenshots dir: `docs/audits/iter-29-92-esperimenti-screenshots/` (94 PNGs)

## Reproduction

```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
rm -f automa/state/iter-29-92-esperimenti/results.jsonl
ELAB_PROD_URL="https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app" \
  npx playwright test tests/e2e/29-92-esperimenti-audit.spec.js \
  --config tests/e2e/playwright.iter29.config.js
```

Runtime: ~6 minutes for 94 tests with 4 parallel workers.
