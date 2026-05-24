---
name: elab-demo-check
description: Pre-demo readiness check ELAB Tutor 25/05/2026. Run prima di dichiarare demo pronta. Trigger keywords - demo check, pre-demo, readiness, demo ready, skill ELAB demo, are we ready.
---

# Pre-Demo Readiness Check (ELAB Tutor 25/05)

Run questa checklist 2h prima della demo. Output: PASS / WARN / FAIL per ogni item.

## Build + Tests (5 item)

- [ ] **B1** `npm run build` exits 0 (target: success, <2min)
- [ ] **B2** `npx vitest run` >= baseline `automa/baseline-tests.txt` (no regression)
- [ ] **B3** Playwright `tests/e2e/demo-*.spec.js` all pass
- [ ] **B4** `npm run eval:unlim:demo` >= 80% pass rate
- [ ] **B5** Visual diff Playwright `tests/e2e/demo-geometric-fidelity.spec.js` 7/7 PASS

## Esperimenti Render (1 item)

- [ ] **B6** 7 esp render correctly visual smoke walkthrough:
  - v1-cap6-esp1 "Accendi il tuo primo LED"
  - v1-cap6-esp2 "LED senza resistore (cosa NON fare!)"
  - v1-cap6-esp3 "Cambia luminosità con resistenze diverse"
  - v2-cap7-esp1 "Scarica condensatore con multimetro"
  - v2-cap7-esp2 "Scarica condensatore con LED rosso"
  - v3-cap6-esp4 "Due LED che si alternano"
  - v3-cap6-esp5 "Costruiamo un semaforo"

## API + Infra (3 item)

- [ ] **B7** Compile endpoint healthy: curl POST + return HEX/BIN in <30s
- [ ] **B8** Gemini API key valid: test call `unlim-chat` Supabase Edge
- [ ] **B9** Supabase healthy: query `session_actions` table return 200

## UNLIM Scenari Rehearsed (3 item)

- [ ] **B10** Scenario 1: LED reverse polarity → UNLIM detect + suggest correct
- [ ] **B11** Scenario 2: code pin / circuit pin mismatch → UNLIM detect mismatch
- [ ] **B12** Scenario 3: condensatore esp2 button context → UNLIM teach charge/discharge

## Asset Fallback (3 item)

- [ ] **B13** Fumetto rehearsed asset presente in `public/demo-assets/comic/`
- [ ] **B14** Quiz hardcoded backup presente per 7 esp
- [ ] **B15** HEX/BIN pre-compiled `public/demo-assets/v3-cap6-esp4-blink.hex`

## Hardware + Network (3 item)

- [ ] **B16** Nano R4 fisico connesso, Chrome WebUSB requestDevice success
- [ ] **B17** Browser console 0 errors dopo 30-min smoke walkthrough
- [ ] **B18** Network: Supabase + Gemini + compile endpoint + Vercel reachable
- [ ] **B19** Hotspot mobile attivo + tested
- [ ] **B20** LIM/projector tested

## Documentation (2 item)

- [ ] **B21** Demo script printed + reviewed
- [ ] **B22** Fallback decision tree printed + reviewed

---

## Verdict

| Status | Range | Meaning |
|---|---|---|
| **PASS** | 22/22 | Demo ready. Procedi. |
| **WARN** | 18-21/22 + B6 OK | Demo possibile con caveats. Workaround. |
| **FAIL** | <18/22 OR B6 FAIL OR build/test fail | Demo POSTPONE o riduzione scope live. |

## Comandi quick verify

```bash
# Build
npm run build

# Test
npx vitest run
npx playwright test --config tests/e2e/playwright.config.js

# UNLIM eval (after harness setup)
npm run eval:unlim:demo

# API health
curl -s https://<compile-endpoint>/compile -X POST -H "Content-Type: application/json" \
  -d '{"sketch":"void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}","fqbn":"arduino:renesas_uno:nanor4"}'

curl -s https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat -X POST \
  -H "Content-Type: application/json" -H "x-api-key: $ELAB_API_KEY" \
  -d '{"messages":[{"role":"user","content":"ping"}]}'
```
