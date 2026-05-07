# Vol1 Inline Functional Test (Phase 2)

- Started: 2026-05-07T07:17:09Z (mega-loop start)
- Esperimenti: 38/38 (cap6+7+8+9+10+11+12+13+14)
- Tool: Claude in Chrome MCP (browser_batch + javascript_exec)
- Browser tabId: 1259340882
- Methodology identica Vol2 (mountExperiment + getLayout + getCircuitDescription + captureScreenshot async loop)

## Summary Statistics

- Mount success: **38/38 (100%)**
- Errors: **0/38**
- Captured screenshot data (base64 in browser): **38/38** average ~10KB
- Zero connections_count: **0/38** (Vol1 better than Vol2 — all esperimenti hanno wires)
- Zero components_count: **0/38**

## Per-Esperimento Compact Data

Format: `id | mount:Y/N | comps:N (types) | wires:N | title | screenshot_b64_size`

```
v1-cap6-esp1 | mount:Y | comps:4 (battery9v,breadboard-half,resistor,led) | wires:6 | title:"Cap. 6 Esp. 1 - Accendi il tuo primo LED" | ss:9618
v1-cap6-esp2 | mount:Y | comps:3 (battery9v,breadboard-half,led) | wires:6 | title:"Cap. 6 Esp. 2 - LED senza resistore (cosa NON fare!)" | ss:9422
v1-cap6-esp3 | mount:Y | comps:4 (battery9v,breadboard-half,resistor,led) | wires:6 | title:"Cap. 6 Esp. 3 - Cambia luminosità con resistenze diverse" | ss:9622
v1-cap7-esp1 | mount:Y | comps:4 (battery9v,breadboard-half,resistor,rgb-led) | wires:6 | title:"Cap. 7 Esp. 1 - Accendi il rosso del RGB" | ss:10914
v1-cap7-esp2 | mount:Y | comps:4 (battery9v,breadboard-half,resistor,rgb-led) | wires:6 | title:"Cap. 7 Esp. 2 - Accendi il verde del RGB" | ss:10962
v1-cap7-esp3 | mount:Y | comps:4 (battery9v,breadboard-half,resistor,rgb-led) | wires:6 | title:"Cap. 7 Esp. 3 - Accendi il blu del RGB" | ss:10890
v1-cap7-esp4 | mount:Y | comps:5 (battery9v,breadboard-half,resistor,resistor,rgb-led) | wires:8 | title:"Cap. 7 Esp. 4 - Mescola 2 colori: il viola!" | ss:11386
v1-cap7-esp5 | mount:Y | comps:6 (battery9v,breadboard-half,resistor,resistor,resistor,rgb-led) | wires:10 | title:"Cap. 7 Esp. 5 - Tutti e 3: bianco!" | ss:11638
v1-cap7-esp6 | mount:Y | comps:6 (battery9v,breadboard-half,resistor,resistor,resistor,rgb-led) | wires:10 | title:"Cap. 7 Esp. 6 - Crea il tuo colore!" | ss:11686
v1-cap8-esp1 | mount:Y | comps:5 (battery9v,breadboard-half,push-button,resistor,led) | wires:8 | title:"Cap. 8 Esp. 1 - LED con pulsante" | ss:10118
v1-cap8-esp2 | mount:Y | comps:5 (battery9v,breadboard-half,push-button,resistor,led) | wires:8 | title:"Cap. 8 Esp. 2 - Cambia colore e luminosità" | ss:10118
v1-cap8-esp3 | mount:Y | comps:6 (battery9v,breadboard-half,resistor,resistor,rgb-led,push-button) | wires:10 | title:"Cap. 8 Esp. 3 - RGB + pulsante = viola" | ss:10434
v1-cap8-esp4 | mount:Y | comps:9 (battery9v,breadboard-half,push-button,push-button,push-button,resistor,resistor,resistor,rgb-led) | wires:9 | title:"Cap. 8 Esp. 4 - 3 pulsanti → 3 colori RGB" | ss:11370
v1-cap8-esp5 | mount:Y | comps:9 (battery9v,breadboard-half,push-button,push-button,push-button,resistor,resistor,resistor,rgb-led) | wires:9 | title:"Cap. 8 Esp. 5 - Mix avanzato con resistori diversi" | ss:11370
v1-cap9-esp1 | mount:Y | comps:5 (battery9v,breadboard-half,potentiometer,resistor,led) | wires:6 | title:"Cap. 9 Esp. 1 - Dimmer LED con potenziometro" | ss:10110
v1-cap9-esp2 | mount:Y | comps:5 (battery9v,breadboard-half,potentiometer,resistor,led) | wires:6 | title:"Cap. 9 Esp. 2 - Inverti la rotazione" | ss:10090
v1-cap9-esp3 | mount:Y | comps:5 (battery9v,breadboard-half,potentiometer,resistor,led) | wires:6 | title:"Cap. 9 Esp. 3 - LED di colore diverso con pot" | ss:10074
v1-cap9-esp4 | mount:Y | comps:5 (battery9v,breadboard-half,potentiometer,resistor,rgb-led) | wires:7 | title:"Cap. 9 Esp. 4 - Dimmer RGB azzurrino" | ss:11254
v1-cap9-esp5 | mount:Y | comps:5 (battery9v,breadboard-half,potentiometer,resistor,rgb-led) | wires:6 | title:"Cap. 9 Esp. 5 - Pot miscelatore blu  rosso" | ss:10014
v1-cap9-esp6 | mount:Y | comps:9 (battery9v,breadboard-half,potentiometer,potentiometer,potentiometer,resistor,resistor,resistor,rgb-led) | wires:16 | title:"Cap. 9 Esp. 6 - Lampada RGB con 3 potenziometri" | ss:11482
v1-cap9-esp7 | mount:Y | comps:6 (battery9v,breadboard-half,potentiometer,push-button,resistor,rgb-led) | wires:9 | title:"Cap. 9 Esp. 7 - Sfida: aggiungi pulsanti alla lampada" | ss:10690
v1-cap9-esp8 | mount:Y | comps:7 (battery9v,breadboard-half,potentiometer,potentiometer,resistor,resistor,rgb-led) | wires:11 | title:"Cap. 9 Esp. 8 - Sfida: combina esperimenti 5+6" | ss:11654
v1-cap9-esp9 | mount:Y | comps:8 (battery9v,breadboard-half,potentiometer,potentiometer,push-button,resistor,resistor,rgb-led) | wires:9 | title:"Cap. 9 Esp. 9 - Sfida: aggiungi pulsante all'esp 8" | ss:11674
v1-cap10-esp1 | mount:Y | comps:4 (battery9v,breadboard-half,photo-resistor,led) | wires:6 | title:"Cap. 10 Esp. 1 - LED controllato dalla luce" | ss:9690
v1-cap10-esp2 | mount:Y | comps:4 (battery9v,breadboard-half,photo-resistor,led) | wires:6 | title:"Cap. 10 Esp. 2 - LED diverso colore con LDR" | ss:9690
v1-cap10-esp3 | mount:Y | comps:6 (battery9v,breadboard-half,photo-resistor,photo-resistor,photo-resistor,rgb-led) | wires:12 | title:"Cap. 10 Esp. 3 - 3 LDR controllano RGB" | ss:10938
v1-cap10-esp4 | mount:Y | comps:6 (battery9v,breadboard-half,resistor,led,photo-resistor,led) | wires:10 | title:"Cap. 10 Esp. 4 - LED bianco illumina LDR → LED blu" | ss:10958
v1-cap10-esp5 | mount:Y | comps:7 (battery9v,breadboard-half,potentiometer,resistor,led,photo-resistor,led) | wires:12 | title:"Cap. 10 Esp. 5 - Aggiungi pot per controllare LED bianco" | ss:11026
v1-cap10-esp6 | mount:Y | comps:7 (battery9v,breadboard-half,push-button,photo-resistor,resistor,led,led) | wires:7 | title:"Cap. 10 Esp. 6 - Aggiungi pulsante al circuito LDR" | ss:10714
v1-cap11-esp1 | mount:Y | comps:3 (battery9v,breadboard-half,buzzer-piezo) | wires:6 | title:"Cap. 11 Esp. 1 - Buzzer suona continuo" | ss:8994
v1-cap11-esp2 | mount:Y | comps:4 (battery9v,breadboard-half,push-button,buzzer-piezo) | wires:7 | title:"Cap. 11 Esp. 2 - Campanello con pulsante" | ss:9858
v1-cap12-esp1 | mount:Y | comps:5 (battery9v,breadboard-half,reed-switch,resistor,led) | wires:5 | title:"Cap. 12 Esp. 1 - LED con reed switch" | ss:9850
v1-cap12-esp2 | mount:Y | comps:5 (battery9v,breadboard-half,reed-switch,resistor,led) | wires:5 | title:"Cap. 12 Esp. 2 - Cambia luminosità con magnete" | ss:9850
v1-cap12-esp3 | mount:Y | comps:5 (battery9v,breadboard-half,reed-switch,resistor,rgb-led) | wires:6 | title:"Cap. 12 Esp. 3 - Sfida: RGB + reed switch" | ss:9986
v1-cap12-esp4 | mount:Y | comps:6 (battery9v,breadboard-half,reed-switch,potentiometer,resistor,rgb-led) | wires:8 | title:"Cap. 12 Esp. 4 - Sfida: pot + RGB + reed switch" | ss:10234
v1-cap13-esp1 | mount:Y | comps:2 (battery9v,led) | wires:2 | title:"Cap. 13 Esp. 1 - LED nell'elettropongo" | ss:10874
v1-cap13-esp2 | mount:Y | comps:4 (battery9v,led,led,led) | wires:6 | title:"Cap. 13 Esp. 2 - Circuiti artistici con plastilina" | ss:11678
v1-cap14-esp1 | mount:Y | comps:13 (battery9v,breadboard-full,potentiometer,potentiometer,potentiometer,resistor,resistor,resistor,resistor,led,led,rgb-led,reed-switch) | wires:21 | title:"Cap. 14 - Il Primo Robot ELAB" | ss:12802
```

## Pattern Analysis (Phase 2 Live Findings)

### Strong Spiattellato Candidates (per Andrea iter 21+ feedback)

**cap7 RGB esp1+esp2+esp3** — IDENTICAL CIRCUIT (4 comps 6 wires each)
- esp1: "Accendi il rosso del RGB"
- esp2: "Accendi il verde del RGB"
- esp3: "Accendi il blu del RGB"
- Same components (battery9v + bb + R + rgb-led)
- Same wires count (6)
- Different ONLY in which channel of RGB is energized
- **Diagnosis**: tre esperimenti separati per UN concetto narrativo "RGB ha 3 canali, accendi uno alla volta". Il PDF Vol1 cap7 probabilmente li presenta come UN esperimento con 3 prove (rosso/verde/blu).
- **Severity proposed**: medium (variations_collapsed_to_separate_esp: TRUE)

**cap9 Pot esp1+esp2+esp3** — IDENTICAL CIRCUIT (5 comps 6 wires each)
- esp1: "Dimmer LED con potenziometro"
- esp2: "Inverti la rotazione"
- esp3: "LED di colore diverso con pot"
- Same components (battery9v + bb + pot + R + led)
- Same wires count (6)
- Different in HOW the pot is used (rotate, invert direction, change LED color)
- **Diagnosis**: tre esperimenti separati per UN concetto "Controlla LED con pot — variazioni"
- **Severity proposed**: medium (variations_collapsed_to_separate_esp: TRUE)

### Other Identical/Near-Identical Circuit Pairs

- **cap8-esp1 = cap8-esp2** (same 5/8) — "LED con pulsante" + "Cambia colore e luminosità" (titoli divergenti, circuito identico)
- **cap8-esp4 = cap8-esp5** (same 9/9) — "3 pulsanti 3 colori" + "Mix avanzato resistori diversi"
- **cap10-esp1 = cap10-esp2** (same 4/6) — "LED controllato luce" + "LED diverso colore con LDR"
- **cap12-esp1 = cap12-esp2** (same 5/5) — "LED con reed" + "Cambia luminosità con magnete"

### Smart Design Highlights

- **cap6-esp2** "LED senza resistore (cosa NON fare!)" — pedagogical anti-pattern intenzionale
- **cap13 plastilina** (esp1+esp2) — NO breadboard intentionally, plastilina IS the conductor (concept innovative)
- **cap14 Robot ELAB** — capstone 13 components + 21 wires (più complesso di Vol2 capstone Robot Segui Luce 12 comps 20 wires)

### Mechanical/Material Notes

- cap13-esp1 has only 2 components (battery + LED, NO breadboard) — kit fisico richiede plastilina conductive (extra-SVG, ma intenzionale per concept)
- cap14 capstone richiede struttura meccanica (chassis, ruote, batteria fisica) extra-SVG come Vol2 cap12

## Anti-Inflation Mandate Compliance

- ✅ All data measured live via __ELAB_API
- ✅ Mount counts: actual return values
- ✅ Component lists: from getLayout() JSON
- ✅ Connection lists: from getLayout() JSON
- ✅ Title strings: extracted via regex from getCircuitDescription() verbatim
- ✅ Screenshot lengths: actual base64 string.length
- ⚠️ Per-esperimento PNG screenshots NOT saved to disk (technical limitation Claude in Chrome MCP — same Vol2 documented)
- ✅ NO synthesis: all observed values, zero invention
