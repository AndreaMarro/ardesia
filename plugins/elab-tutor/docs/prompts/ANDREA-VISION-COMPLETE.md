# LA VISIONE DI ANDREA — Documento Completo
**Sintetizzato da tutti i messaggi della sessione 02/04/2026**

---

## 1. PRINCIPIO ZERO (LA REGOLA SUPREMA)
L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.
- Zero configurazione
- Zero tutorial
- Zero click prima di iniziare
- Il docente non deve capire l'interfaccia, deve INSEGNARE
- Il prof e il medium tra ELAB e la classe
- Linguaggio SEMPRE 10-14 anni

## 2. ELAB = UN UNICO PRODOTTO
Kit fisici + Volumi stampati + Tutor digitale = STESSA COSA
- Sono interdipendenti
- L'estetica del Tutor DEVE richiamare i volumi e le scatole (ELAB Tres Jolie)
- I colori DEVONO essere gli stessi: Lime (Vol1), Orange (Vol2), Red (Vol3), Navy (brand)
- Se il Tutor sembra "un progetto di uno studente" = FALLIMENTO
- Se sembra "un prodotto professionale venduto a scuole" = SUCCESSO

## 3. LA LAVAGNA — IL CONCETTO CENTRALE
ELAB non e un sito web con pagine. E una LAVAGNA DIGITALE.
- Il docente apre ELAB → vede una lavagna → inizia a insegnare
- 95% workspace, 5% chrome
- Pannelli flottanti trascinabili/ridimensionabili (come finestre OS)
- Zero navigazione tra pagine — tutto dalla lavagna
- Lavagna pulita = primo accesso, breadboard vuoto
- Lavagna con esperimento = circuito pre-caricato, guida attiva

## 4. UNLIM — L'INTELLIGENZA DEL SISTEMA
UNLIM NON e un chatbot. E la mascotte ELAB che vive nel simulatore.
- Mascotte ferma nell'angolo, si attiva quando serve
- Messaggi contestuali nei punti giusti dello schermo, poi SPARISCONO
- Input: barra semplice in basso (testo) + microfono (voce)
- Output: overlay brevi + voce TTS per la LIM
- ONNISCIENTE: vede stato circuito, storia TUTTE le sessioni, contesto classe
- ONNIPOTENTE: monta circuiti, compila codice, evidenzia, carica esperimenti, quiz, video
- Prepara la lezione dal contesto precedente + curriculum volumi
- La struttura lezione e VARIABILE — si adatta a cosa succede
- Sessioni salvate: UNLIM ricostruisce il contesto quando il docente torna
- Report fumetto: "Crea il report" → PDF con mascotte che racconta la lezione

### SPARISCONO:
- Chat come pannello fisso
- "Sono qui" (messaggio iniziale)
- Toggle Modalita Guida
- Menu Dev/Admin
- Toolbar densa (7 bottoni)
- Il nome "Galileo" (si chiama UNLIM)

### RESTANO (ma nascosti finche servono):
- Editor codice (appare quando il docente lo chiede o UNLIM lo suggerisce)
- Scratch/Blockly
- Serial monitor
- BOM, quiz, video, lavagna, appunti
- Export PNG, shortcuts

## 5. FLOATING WINDOWS (3 tipi)
Un solo componente FloatingWindow riusato per:
1. **UNLIM** — chat AI stile Claude.ai (drag/resize/fullscreen/minimize)
2. **Video** — YouTube embed + catalogo videocorsi ELAB
3. **Manuale** — documentazione/guida

## 6. MODALITA
3 modalita: Gia Montato / Passo Passo / Libero
- Toggle nella barra top
- La lavagna cambia comportamento in base alla modalita
- UNLIM si adatta

## 7. VOLUMI + LICENZE
- ExperimentPicker: modal con card per volume, colori, progress badge
- Volumi bloccati: lucchetto + "Sblocca con codice licenza"
- 62 esperimenti nei 3 volumi (38+18+6)

## 8. VIDEO SULLA LAVAGNA
- YouTube embed diretto (URL o catalogo curato)
- Videocorsi ELAB premium
- FloatingWindow trascinabile/ridimensionabile
- PiP minimize
- NO videocall (rimosso)

## 9. GIOCHI RIMOSSI
- CircuitDetective, PredictObserveExplain, ReverseEngineeringLab, CircuitReview → ELIMINATI
- Galileo/UNLIM fa quiz inline
- Gamification (punti, badge, streak) RESTA

## 10. ESTETICA
- Riferimenti: Claude.ai, Canva, Figma, Brilliant, Excalidraw, tldraw, PhET
- Glassmorphism header (backdrop-filter blur)
- Toolbar flottante sul canvas
- Pannelli con animazioni smooth (300ms cubic-bezier)
- Card con hover translateY + shadow
- Progress dots animati
- Canvas dot pattern sottile (stile Excalidraw/Figma)
- Touch first: 48px min, pointer events
- LIM: font 14px+, contrasto alto, 1024x768 ottimizzato

## 11. VOCE
- Migliorare TTS: meno robotica, piu fluida
- STT per comandi vocali (24 comandi)
- UNLIM capisce linguaggio naturale parlato
- Il docente parla alla LIM e UNLIM esegue

## 12. SICUREZZA
- GDPR con minori
- PII encrypted
- CSP hardened
- Codice protetto
- Licenze per volumi

## 13. APPROCCIO TECNICO
- Strangler Fig: #lavagna cresce accanto a #tutor
- Solo file NUOVI in src/components/lavagna/
- Zero regressioni: #tutor intatto fino allo switch finale
- Engine INTOCCABILE
- UNLIM INTOCCABILE (solo wrappare)
- CSS modules per tutto il nuovo codice
- React 19 + Vite 7 (gia in uso)
- NO librerie esterne per animazioni (CSS native)

## 14. QUALITY
- Test ESTREMI con preview tools (screenshot, click, snapshot, console)
- Benchmark 15 metriche (lavagna-benchmark skill)
- Audit 3x per sessione (1/3, 1/2, fine)
- CoV (Chain of Verification) con 3 agenti a fine sessione
- Score = MINIMO dei 3 agenti (anti-inflazione)
- MAI score > 7 senza 10+ screenshot di prova
- Storico inflazione: G45 +2.8 punti → ASPETTALO e correggilo
- Confronto con ELAB Tres Jolie ad ogni audit

## 15. PIANO SESSIONI
```
S1 ✅ AppShell + Header + FloatingWindow + route #lavagna
S2 ✅ Galileo/UNLIM in FloatingWindow
S3 ✅ VideoFloat (YouTube + catalogo + videocorsi)
S4 → ExperimentPicker + Stato-Driven Panels (IN CORSO)
S5    Dashboard docente come tab
S6    Dashboard studente + Vetrina V2
S7    Rimozione giochi + dead code + pulizia
S8    Switch #tutor → #lavagna
```
POI: stress test totale, UNLIM onnipotenza, voce migliorata, design Steve Jobs, perfezione

## 16. TOOL DA USARE
- /elab-quality-gate, /lavagna-benchmark, /quality-audit
- /systematic-debugging, /code-review, /simplify
- /frontend-design, /design:design-critique, /design:accessibility-review
- /impersonatore-utente, /lim-simulator, /analisi-simulatore
- preview tools (screenshot, click, snapshot, inspect, resize, console, network)
- Control Chrome, Playwright
- Figma MCP (gia installato)
