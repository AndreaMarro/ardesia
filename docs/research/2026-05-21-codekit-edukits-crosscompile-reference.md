# Code Kit (EduKits) — analisi di riferimento per la cross-compilazione

**Data:** 2026-05-21 · **Tipo:** analisi competitiva read-only (browser live + Pro page + marketing)
**Fonte:** `edukits.co/code-kit-app/web/` → app `edukits.co/code/#/d/draft/editor` · `edukits.co/code-kit-app/pro/`
**Per:** Sprint B (cross-compile certezza) del master plan iter 103+.
**Regola:** CONFIRMED vs INFERRED marcati (G45).

> Andrea ha indicato Code Kit come "altro punto di riferimento per cross-compilazione".
> È un concorrente diretto nello stesso spazio di ELAB: kit educativi + block-coding Arduino.

---

## 1. Cosa è Code Kit (CONFIRMED — osservato live)

Editor a blocchi drag-and-drop per Arduino, di **EduKits** (azienda di kit educativi —
stesso modello di business di ELAB: kit fisici + software). 10.000 utenti, 120+ paesi.

- App SPA a `edukits.co/code/`, routing a hash (`#/d/draft/editor`, `/serial`, `/circuits`).
- 4 viste: **Blocks** (editor Blockly-style) · **Code** (C++ generato) · **BlockMorph** ·
  **Quick Start** (progetti esempio).
- ~20+ board: Arduino Uno R3/R4, Nano ATmega328P/128, Nano Every, Mega 2560, Leonardo,
  Micro, Pro/Pro Mini, ESP8266, ESP32 (S2/S3/C3/C6/H2). Selettore board "Arduino Uno".
- 150+ blocchi (sensori, motori, display, LED).

## 2. Architettura tecnica (CONFIRMED — network trace + DOM)

- **SPA 100% client-side.** Su load e su interazione: **ZERO chiamate backend** — solo
  analytics (`v.clarity.ms` Microsoft Clarity + `edukits.co/cdn-cgi/rum` Cloudflare RUM).
- **Blocchi → C++ generati real-time client-side** (generatore stile Blockly, nel bundle JS).
- Vista "Code": C++ + bottone copia. Free: "copy to clipboard" o "download zip per Arduino IDE".
- Routing a hash + viste editor/serial/circuits — **stessa architettura di ELAB** (App.jsx hash routing).

## 3. Modello compile + upload — Free vs Pro (CONFIRMED — Pro page)

| Feature | Free | Pro |
|---------|------|-----|
| Block coding + C++ gen | ✓ | ✓ |
| Copy C++ / download zip | ✓ | ✓ |
| **Upload diretto a board** | ✗ | ✓ |
| **App desktop Win/Mac/Linux** | ✗ | ✓ |
| **Compilazione** | ✗ (nessuna) | ✓ (locale, nel desktop app) |
| Simulatore circuiti | ✗ | ✓ |
| BlockMorph (text→blocchi) | ✗ | ✓ |
| Serial monitor (raw + grafici) | ✗ | ✓ |
| Cloud storage + offline + sharing | ✗ | ✓ |

**Il punto chiave (CONFIRMED dalla Pro page):**
- Code Kit **NON ha un compilatore cloud.** Il free web app si ferma a blocchi→C++.
- La compilazione vera (C++→hex) avviene **localmente nelle app desktop** Win/Mac/Linux:
  *"Compile and upload code completely offline"*, *"offline desktop apps handle
  compilation locally"*. → toolchain bundlata nel desktop app (INFERRED: arduino-cli o
  equivalente, locale).
- Il bottone "Upload" del web app è etichettato **"Web upload is a Pro feature"** — gated.
  L'upload "funziona in web e desktop" (Pro page). **Meccanismo web upload: INFERRED** —
  Web Serial / WebUSB per il flash dal browser; la compilazione web Pro o passa per il
  desktop app installato come agent locale, o c'è un path non osservabile senza account Pro.

**Pricing (CONFIRMED):** Pro $42.49/anno ($3.55/mese annuale, $7.49 mensile). Classroom
$253.49/anno per 30 licenze (~$8.45/studente/anno).

## 4. Confronto con ELAB Tutor

| Dimensione | Code Kit | ELAB Tutor |
|------------|----------|------------|
| Editor blocchi | Blockly-style, 150+ blocchi | Blockly (ScratchEditor / IdeShell) |
| Blocchi→C++ | client-side real-time | client-side (`scratchGenerator.js`) |
| **Compile C++→hex** | **Pro + desktop app, LOCALE** | **cloud Render `arduino-cli`, FREE, live** |
| **Upload a board** | Pro (web upload + desktop) | WebUSB (iter 76+, in sviluppo), FREE |
| Simulatore circuiti | **Pro** (a pagamento) | **FREE** — CircuitSolver MNA/KCL + avr8js (molto avanti) |
| text↔blocchi | BlockMorph (Pro) | parziale |
| Offline | Pro, desktop app | PWA (parziale) |
| Board | 20+ (Uno R3/R4, ESP32…) | focus Nano R4 (Renesas RA4M1) |
| Nano R4 | **non in lista marketing** (ha Uno R4 = stesso chip RA4M1) | target principale |
| Tutor AI | **nessuno** | **UNLIM** (chat, vision, voce, RAG) |
| Coerenza kit+volumi | no | **Morfismo** (kit Omaric + 3 volumi) |
| Prezzo | $42/anno indiv. · $253/anno classe (30) | idea: €20/classe/mese (≈ €240/anno/classe) |

## 5. Takeaway per ELAB — Sprint B (cross-compile)

1. **Il free-cloud-compile di ELAB è un vantaggio reale.** Code Kit fa **pagare** E fa
   **installare un desktop app** per compilare/caricare. ELAB compila gratis dal browser
   via cloud. Se ELAB chiude bene WebUSB upload + il cold-start, il claim Andrea iter-75
   "funziona DIRETTAMENTE dalla piattaforma, NO download" **batte** la UX di Code Kit.
   → valida il pivot iter-75.

2. **Onestà — il modello desktop-agent NON è morto.** Code Kit, con 10k utenti paganti,
   monetizza esattamente il modello **"compila in locale in un'app installata"**. È lo
   stesso modello dell'**ELAB Compile Agent `localhost:8765`** costruito a iter-63 e
   abbandonato al pivot iter-75. Il pivot a cloud+WebUSB resta difendibile (UX migliore),
   ma il dato di mercato dice che il modello locale funziona e vende. Da pesare onestamente.

3. **Cold-start = il vero rischio competitivo.** Code Kit compila in locale → istantaneo,
   offline, zero costo server. ELAB compila su Render → tassa di **36s di cold-start**
   (Sprint B2 warmup cron) + costo hosting. Se ELAB non risolve il cold-start, un bambino
   aspetta 36s mentre Code Kit è istantaneo. **B2 (warmup) sale di priorità.**

4. **Pricing — validazione.** Code Kit Classroom ≈ $8.45/studente/anno. L'idea ELAB
   (€20/classe/mese = €240/anno, ~30 studenti = €8/studente/anno) è nello **stesso
   ballpark** — pricing competitivo confermato.

5. **Dove ELAB è avanti:** simulatore (gratis + sofisticato vs Pro-gated di Code Kit);
   tutor AI UNLIM (Code Kit non ne ha — differenziatore forte); Morfismo (coerenza
   kit+volumi). **Dove Code Kit è avanti:** rifinitura, 20+ board, offline desktop,
   funnel Pro pulito, BlockMorph bidirezionale.

6. **Nano R4 non è un moat durevole.** Code Kit supporta Uno R4 (stesso chip Renesas
   RA4M1 del Nano R4) → aggiungere il Nano R4 sarebbe banale per loro. ELAB non può
   contare sul Nano R4 come differenziatore — il moat è UNLIM + Morfismo + simulatore.

7. **WebUSB confermato come standard di settore.** "Web upload" di Code Kit usa
   Web Serial/WebUSB (INFERRED). Conferma che la direzione WebUSB presa da ELAB iter 76+
   è la scelta giusta del settore.

## 6. Da verificare (open questions)

- Il "web upload" Pro di Code Kit: WebUSB puro o delega al desktop app come agent locale?
  (Richiede account Pro per osservarlo.)
- Code Kit ha un compilatore cloud nascosto per il web Pro? La Pro page dice di no
  (compile locale desktop) — ma non confermato al 100%.
- BlockMorph: come fa il text→blocchi? (potenziale spunto per ELAB IdeShell).
- Il loro simulatore circuiti (`#/d/draft/circuits`, Pro) — quanto è avanzato vs ELAB.

---

## 7. Perché Code Kit è bello — UX (CONFIRMED, osservato live)

1. **Focus.** Fa UNA cosa: blocchi → C++ Arduino → upload. Nient'altro. Nessun AI,
   dashboard, giochi, glossario. Ogni schermata serve quel job. Capisci il prodotto in 10s.
2. **Coerenza visiva.** Ogni blocco di una categoria ha lo stesso colore. Geometria
   arrotondata uniforme, ombre uniformi, dropdown inline uniformi. Un solo linguaggio di
   design — soft, chiaro, moderno, frame a gradiente pesca. Niente sembra incollato.
3. **Sobrietà.** Sidebar icone compatta, 4 tab, toolbar piccola. Tanto bianco, la canvas
   respira. Nessun cruscotto da 28 bottoni.
4. **Linguaggio piano.** Etichette blocchi leggibili: "read analogue pin A0", "set pin
   board LED to HIGH". Un docente senza conoscenze pregresse capisce.
5. **Paradigma familiare.** È Scratch/MakeCode. Milioni di docenti/bambini lo conoscono
   già. Curva di apprendimento ≈ zero. ELAB inventa una cosa sua.
6. **SHIPPA.** Prodotto finito, stabile, 10k utenti, 120 paesi. Funnel Pro che funziona.
   App desktop esistono. È FATTO e vende.
7. **Scope onesto.** Free = blocchi→C++. Pro = compile+upload+sim. Linea netta. L'utente
   sa sempre cosa ha.
8. **Onboarding.** Card video "New to Code Kit?". Esempi curati (Blink, Fade LED, Servo
   Knob). Ricette per componente. Il principiante ha un percorso.

## 8. Le cose negative in ELAB — confronto onesto (NO compiacenza)

1. **ELAB è gonfio.** Bundle JS 8.5 MB vs SPA snella di Code Kit. God component:
   `SimulatorCanvas` 2917 righe, **`ElabTutorV4` 2552 righe di CODICE MORTO ancora
   spedito**, `LavagnaShell` 1641, `api.js` 1335, `useGalileoChat` 1285.
2. **ELAB non ha focus.** Vuole essere simulatore + tutor AI + lavagna + fumetto +
   dashboard + 4 giochi + glossario + compilatore + admin + teacher panel + social.
   Code Kit fa UNA cosa bene. ELAB ne fa dodici a metà. Lo dice `scores.md`:
   *"Il motore è 9/10. Il prodotto (ciò che l'insegnante vede) è 4/10."*
3. **ELAB viola le sue stesse regole.** Regola 11 vieta emoji-come-icone → ELAB ne ha
   **134**. Palette baseline ~833 → ora **2157 hex raw fuori palette** (regredito). Il
   progetto non segue il proprio design system.
4. **ELAB spedisce codice morto + stato rotto.** ElabTutorV4 2552 righe morte,
   experimentNarrativeService morto, elab-blockly-theme.css morto, App.jsx 251-313 morto.
   **CI rossa da 9 giorni, 8 PR bloccati, 1010 branch ref (658 spazzatura bot).**
   Code Kit spedisce pulito.
5. **ELAB si auto-gonfia.** G45: self-score 8.6 vs reale 5.8. Il CLAUDE.md è un muro di
   log "9.30/10 ONESTO" — un progetto che parla a sé stesso di punteggi invece di spedire.
6. **L'UI cross-compile di ELAB è brutta — parole di Andrea (iter-102):** icone "brutte",
   editor "non ha senso", "bar soup" (4 barre impilate). Il `#compile-home` — esattamente
   la feature qui confrontata — ridisegnato più volte, Andrea ancora non contento.
   L'editor di Code Kit è pulito al primo colpo.
7. **102 iterazioni, ancora a consolidare.** Code Kit è un prodotto spedito. ELAB dopo
   102 iter ha CI rossa + un piano a 6 sprint solo per sbloccarsi + "ferma e consolida".
8. **ELAB non ha type safety.** tsconfig cancellato (iter 88), unico `.tsx` senza check,
   import cross-runtime hack (browser importa TS Deno). Fragile.
9. **Fumetto è uno stub.** Backend assente. Feature a metà.

**La verità scomoda:** la scommessa di ELAB è "fare più di Code Kit" (tutor AI, simulatore,
Morfismo). Ma Code Kit dimostra che **fare UNA cosa in modo eccellente batte farne dodici a
4/10.** Il rischio di ELAB non è mancanza di feature — è **mancanza di focus e di
rifinitura**. Il thread cross-compile va reso pulito e FINITO come Code Kit, non sepolto
sotto lo sprawl.

---
*Analisi di riferimento — 2026-05-21 · alimenta Sprint B del master plan iter 103+*
