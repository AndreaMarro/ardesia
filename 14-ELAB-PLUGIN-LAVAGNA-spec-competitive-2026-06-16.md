---
tipo: spec-prodotto + competitive
zona: governance (fabbrica) / prodotto ELAB-plugin
data: 2026-06-16 sera
parte-di: "[[08-FUNZIONALITA-E-ARCHITETTURA-PARALLELE]] · [[02-METAPIANO-ardesia]]"
stato: SPEC + RICERCA (3 agenti, fonti verificate) — opzioni, NON ratificato
---
# ELAB come PRIMO plugin LEGO della lavagna ARDESIA — requisiti + ricerca + moat (onestà brutale)

## A. Visione sistematizzata (da Andrea, 16/06)
1. **La lavagna (ARDESIA Studio) e UNA sola, NON cambia.** I plugin NON forkano/modificano il software.
2. **Plugin = strumenti (anche avanzati) che si attaccano come LEGO** sullo STESSO canvas condiviso, con estrema flessibilita e liberta creativa per chi li crea, sandboxed.
3. **ELAB = il PRIMO plugin VERO** (non app separata): gira DENTRO la lavagna come tool board-embed.
4. **Circuiti montati identici ai libri**, con pezzi montabili come nella realta (breadboard vera), **geometria e posizioni reciproche perfette**, software di **livello professionale**.

## B. Requisiti — PIATTAFORMA plugin "LEGO su canvas condiviso"
RF-P1 Mount: un plugin si monta sul canvas come oggetto (board-embed) — posizionabile, ridimensionabile, z-order, ancorabile a griglia; coesiste con altri tool.
RF-P2 SDK manifest (esiste gia in elab-blink): id, name, version, apiVersion, surfaces, capabilities, publisher.pubkey(ed25519), privacy.dataOut, networkAccess(allowlist).
RF-P3 SDK runtime = JSON-RPC su postMessage (modello Figma/OpenAI-Apps): canvas.create/update/delete/transform (handle OPACHI), state.get/set (CRDT Yjs scoped per-istanza), selection.get/subscribe, ui.modal/toast/resize, files.read, net.fetch (host-checked allowlist), host.requestCapability (escalation runtime).
RF-P4 Sandbox: iframe SEPARATE-ORIGIN (*.plugins.host) `sandbox="allow-scripts"` (MAI allow-same-origin), capability-gated, CSP+Permissions-Policy, schema-validate ogni messaggio, verify event.origin.
RF-P5 Sync: render PURO da stato sincronizzato (regola widget Figma) → tutti i collaboratori coerenti. CRDT Yjs (MIT) per-istanza.
RF-P6 Marketplace: firma ed25519 + review-pipeline + versioni-pinnate + kill-switch server-side (revoca senza redeploy host); tool comprati IMMUTABILI (ordine co-founder); revenue-share 70/30.
RNF-P liberta creativa: il plugin renderizza qualsiasi cosa DENTRO il suo iframe; superficie host RPC MINIMA + handle-opachi (lezione Figma: "surface area too large" = rischio). Tensione reale flessibilita-vs-sicurezza: tieni l'API host piccola, spingi la flessibilita nell'iframe del plugin.

## C. Requisiti — ELAB circuit-sim (primo plugin)
RF-E1 Libreria parti realistiche = wokwi-elements (MIT): LED, resistor, breadboard*, Arduino Uno/Nano/Mega, pushbutton, potenziometro, ecc. con coordinate-pin (`pinInfo`). (*breadboard NON c'e → da costruire).
RF-E2 Breadboard model = griglia-fori reale (righe a-j, colonne, rail +/-, gap centrale); connettivita elettrica = gruppi-colonna + rail → netlist union-find (lo skeleton SIM-C ha gia union-find).
RF-E3 Montaggio = drag parte → pin SNAP ai fori (pitch 2.54mm / 0.1"); fili foro↔foro / pin↔pin; posizioni reciproche preservate.
RF-E4 **Layout book-accurate**: ogni esperimento del libro ELAB ha un layout canonico (posizioni componenti+fori+fili) → "monta come nel libro"; lo studente carica e vede il circuito IDENTICO; oppure costruisce e viene verificato contro il canonico. = il MOAT-contenuto, e il costo-produzione maggiore.
RF-E5 Simulazione = avr8js (MIT) esegue lo sketch (.ino→HEX via backend compile) → GPIO/PWM pilotano le parti visive (LED on/off/brightness, button input); real-time, deterministico.
RF-E6 Authoring = Blockly Zelos → IR Zod → {emit .ino, interpret} (arch SIM-C esistente).
RF-E7 Integrazione = ToolHost board-embed plugin (manifest elab-blink gia ed25519-firmato, sandbox iframe, caps board.read/write) — si monta sulla lavagna come ogni tool.
RF-E8 (pro) bridge hardware reale = export .ino / WebSerial upload su Arduino vero → "identico alla realta" esteso all'hardware.
RNF-E geometria sub-pixel (allineamento pin/pitch esatto, fedelta posizioni-reciproche vs libro); avr8js ≥ real-time; determinismo (stessi blocchi→stessa sim, per grading); no-emoji; GDPR (zero PII nella sim).

## D. Decisioni tecniche (ricerca, fonti verificate 16/06)
- **BUILD-ON (MIT):** avr8js (github.com/wokwi/avr8js, MIT, attivo 2026) = core esecuzione AVR; wokwi-elements (MIT, attivo, v1.9.2) = parti+pinInfo. wokwi-cli (MIT) opzionale CI.
- **DA COSTRUIRE NOI (nessuna lib MIT lo da):** (1) breadboard SVG + modello elettrico (tie-points colonna, rail, gap) + netlist; (2) comportamento analogico semplificato per-componente (divisore, I-V del LED, wiper potenziometro) — NON serve SPICE per didattica; (3) **layout book-accurate** (bespoke per-esperimento = costo maggiore); (4) calibrazione scala pinInfo (unita pin ≠ viewBox-mm, da trasformare); (5) backend compile .ino→HEX (arduino-cli/avr-gcc server, costo+sandbox).
- **EVITARE (GPL/copyleft = trappola prodotto chiuso):** CircuitJS/Falstad (GPL-2), Fritzing (GPL-3 + CC-BY-SA), SimulIDE (GPL-3), AVR8js-Falstad (GPL-2). CircuitVerse (MIT ma solo-logica-digitale = dominio sbagliato).
- **Canvas:** tldraw = source-available, $6k/anno commerciale + license-key client-side (kill-switch controllato da tldraw) = RISCHIO strategico per prodotto da vendere. Excalidraw = MIT ma estensibilita limitata (fork per tool custom). Konva/Fabric (MIT) = substrato low-level se costruisci tu. NB lo Studio ARDESIA esiste gia → VERIFICARE su cosa e costruito prima di decidere. In OGNI caso il layer-sandbox-plugin lo costruisci tu.
- **SDK plugin = modello Figma + OpenAI Apps SDK** (vedi sez. B). CRDT = Yjs (MIT, default). avr8js copre solo AVR (Uno/Mega/Nano) — se i libri usano ESP32/STM32, avr8js non basta.

## E. ⚠️ MOAT del PLUGIN ELAB-tutor (NON della piattaforma ARDESIA) — verita brutale
**SCOPE (Andrea 16/06): questo moat e del PLUGIN elab-tutor, NON di ARDESIA-piattaforma. ELAB-tutor = primo PRODOTTO sulla piattaforma; ARDESIA = la PIATTAFORMA (lavagna+ecosistema plugin+method-graph+marketplace) con strategia propria e PIU AMPIA. Il verdetto 'architettura copiabile' vale SOLO per il pitch del plugin, non per la piattaforma. Mai confondere (regola 3-progetti).**
- **L'architettura "lavagna + plugin LEGO" NON e il moat.** E un gap-feature sottile, copiabile in 6-18 mesi. MakeCode (extension framework, OSS Microsoft) + LTI (tool montabili standard negli LMS) PROVANO gia il pattern a scala. Pitchare "marketplace plugin" come differenziatore invita il rebuttal "Tinkercad/MagicSchool/LTI lo fanno gia".
- **Moat REALE = il bundle, su 2 gambe commerciali/regolatorie:**
  1. **Layout book-accurate del libro italiano** = gap reale non servito (Tinkercad/Wokwi GENERICI apposta, per scalare). Moat OPERATIVO (relazioni editori + lavoro contenuto), reale per un player focalizzato ma FRAGILE se il mercato si rivela grande (copycat locale veloce).
  2. **GDPR + MePA/PNRR + EU-data-residency + AgID** = il moat PIU DUREVOLE. I giganti USA (Tinkercad/MagicSchool) sono GDPR-compliant ma US-built/US-data-default, NON nativi MePA. PNRR Scuola 4.0 = €2.1B, deadline-pressure = tailwind temporizzato.
- **Minacce reali (ranking):** Tinkercad/Autodesk (minaccia latente massima, motivazione bassa — Italia=rounding error per loro); MagicSchool (distribuzione, 5M docenti — ma tool first-party AI-testo, no circuit-sim, no book-lock); LTI/Canvas (commoditizza la narrativa-marketplace); Wokwi (qualita-sim, ma dev-centric/digital-only/no-MePA); **copycat italiano/EU finanziato** (barriera piu bassa una volta provato che book-accuracy vende → difesa = contratti-editori + footprint-procurement, NON il codice).
- **Cosa fare:** guidare con book-fidelity + procurement IT; bloccare relazioni-editori presto (filiera Omaric/Fagherazzi/Arduino gia presente); GDPR/AgID/MePA come feature di prima classe. **Cosa NON fare:** marketing "marketplace plugin" come differenziatore primario; out-simulare Wokwi/Tinkercad sull'ampiezza (multi-MCU/CI/analog-depth → perdi); aprire il marketplace a dev terzi prima di avere domanda (ecosistema = moat tardo, non di lancio).

## F. Fonti chiave (verificate)
avr8js MIT github.com/wokwi/avr8js · wokwi-elements MIT github.com/wokwi/wokwi-elements (no breadboard: issue #31) · Tinkercad proprietario tinkercad.com/circuits · Wokwi pricing $0-20/seat wokwi.com/pricing · CircuitJS GPL-2 · Fritzing GPL-3+CC-BY-SA · CircuitVerse MIT (logic-only) · tldraw license tldraw.dev/community/license ($6k/yr SDK4.0) · Excalidraw MIT · Figma plugin figma.com/blog/how-we-built-the-figma-plugin-system · OpenAI Apps SDK developers.openai.com/apps-sdk · web.dev/articles/sandboxed-iframes · Yjs MIT · MakeCode OSS microsoft.com/makecode · MagicSchool magicschool.ai/pricing · PNRR Scuola4.0 €2.1B pnrr.istruzione.it

## G. Prossimi passi (sequenza, rispetta il moat)
1. Verificare su cosa e costruito lo Studio canvas attuale (Konva? Excalidraw? custom) prima di scelte canvas.
2. Layer-0 contratti: `plugin-sdk` (manifest+postMessage gia abbozzato in elab-blink) — congelare l'API host MINIMA.
3. Breadboard model (SVG+netlist union-find, riusa SIM-C) + snapping fori = il cuore "montabile come reale".
4. Integrare avr8js (MIT) + wokwi-elements (MIT) + backend compile = sim funzionale.
5. **Layout book-accurate** di 1 esperimento pilota (es. Blink) end-to-end = prova del moat-contenuto.
6. Commerciale in PARALLELO: relazioni editori + dossier MePA/GDPR/AgID (il moat vero).
