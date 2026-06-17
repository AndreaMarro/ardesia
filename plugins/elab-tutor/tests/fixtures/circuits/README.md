# Circuit fixture screenshots — Sprint S iter 8 (gen-test-opus)

## Strategy

20 placeholder PNGs (256x192, 8-bit RGB, deterministic stripe pattern, color-coded by category band) + companion `{N}.metadata.json` per fixture. PNG header bytes hand-crafted via `zlib.crc32` + `struct.pack` (no PIL/ImageMagick dependency — `which convert` returned not-found on this host iter 8).

## Categories (5 + 5 + 5 + 5 = 20)

| N range | band                  | Colore PNG | Topology examples                                            |
|---------|-----------------------|------------|--------------------------------------------------------------|
| 01-05   | `corretti_standard`   | Lime ok    | LED+R, partitore, deviatore, semaforo, fader PWM             |
| 06-10   | `errore_comune`       | Red error  | LED inverso, R mancante, GND scollegato, alim invertita, pin |
| 11-15   | `complessi_multi`     | Navy       | servo+pot+LED, multi-sensor LCD, tastiera, shift register    |
| 16-20   | `edge_case`           | Orange     | corto VCC-GND, parallelo no R, cavo parziale, floating, mix V |

## Companion metadata schema

```json
{
  "id": "circuit-01",
  "topology": "led_resistor",
  "expected_diagnosis": "ok",
  "error_type": null,
  "components": ["nano", "led1", "r220", "wire_d13_a", "wire_cathode_gnd"],
  "label": "LED+R standard",
  "category_band": "corretti_standard",
  "fixture_kind": "placeholder_png_with_metadata",
  "iter": 8,
  "real_screenshot_iter9_pending": true,
  "principio_zero_expected_response_pattern": "Ragazzi, ... Vol.X pag.Y ...",
  "morfismo_compliance": true
}
```

## Honesty caveat (HONEST iter 8)

These are NOT real simulator screenshots. Vision E2E `tests/e2e/02-vision-flow.spec.js`
will use them as deterministic upload payloads, but topology+diagnosis accuracy
measurements against Gemini Vision will be artificially LOW vs real circuits —
PNG content is just a colored stripe pattern, no recognizable schematic.

The metadata companion is the primary verification surface: tests assert
`expected_diagnosis` against the LLM response classification, while the PNG
serves as a stable byte payload (deterministic content hash for cache tests).

## Path forward iter 9 (real screenshots)

- Boot Playwright headed run against `https://www.elabtutor.school`
- Mount each topology via `__ELAB_API.mountExperiment(<id>)` with optional
  mutation (e.g., reverse LED polarity for case 6, disconnect GND for case 8)
- `__ELAB_API.captureScreenshot()` → save as `{N}.png` overwriting placeholder
- Update metadata `fixture_kind` → `"playwright_real_screenshot"` and
  `real_screenshot_iter9_pending` → `false`
- Re-run Vision E2E to measure real topology accuracy ≥80% + diagnosis ≥75%

## Iter 8 acceptance criteria status

- ✅ 20 PNG placeholders shipped (`01.png` ... `20.png`)
- ✅ 20 metadata.json companions (`01.metadata.json` ... `20.metadata.json`)
- ✅ 5+5+5+5 distribution exact
- ⚠️  Real screenshots deferred iter 9 (no Playwright execution iter 8 host)
- ✅ MORFISMO compliance flagged in metadata (`morfismo_compliance: true`)
- ✅ PRINCIPIO ZERO response pattern documented per fixture
