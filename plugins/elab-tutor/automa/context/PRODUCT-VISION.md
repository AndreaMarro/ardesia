# ELAB UNLIM — Visione Prodotto Definitiva
> Fonte: Andrea Marro, 27/03/2026
> Questo file è LA BUSSOLA. Ogni decisione, ogni ciclo, ogni task deve servire questa visione.
> Se un'azione non avvicina il prodotto a questa visione → non farla.

---

## IL PROBLEMA FONDAMENTALE DEL PRODOTTO OGGI

Il prodotto dice: "guarda quante cose so fare."
Il prodotto DEVE dire: "ecco da dove inizi, ecco cosa fai adesso."

Il motore è 9/10. L'esperienza è 4/10. Il gap è tutto nella UX, non nella tecnologia.

### I 6 problemi strutturali (dalla analisi video reale)

1. **Troppa complessità tutta insieme** — sidebar, risorse, guida, simulatore, chat,
   codice, blocchi, toolbar tutti visibili contemporaneamente. Per il docente inesperto
   è sovraccarico.

2. **Gerarchia visiva non netta** — non è chiaro cosa sia il centro dell'attenzione,
   il supporto secondario, la parte avanzata, la parte opzionale. L'occhio deve
   decidere troppo.

3. **Nessuna vera modalità docente semplice** — non si vede: apro → scelgo → seguo
   pochi step → spiego → Galileo mi supporta senza rubare la scena.

4. **Usabile solo da chi lo conosce** — chi l'ha costruito si orienta. Un docente medio
   non ha evidenza di poter: entrare, capire dove stare, non sentirsi tecnico,
   non avere paura di sbagliare.

5. **Modalità guida non dominante** — la guida compare ma non è il cuore. Dovrebbe
   essere la parte regina: non il codice, non i blocchi, non la chat, ma il percorso
   guidato di insegnamento.

6. **Codice e blocchi intimidiscono** — vederli subito sposta la percezione verso
   "strumento tecnico". Devono essere in secondo livello.

---

## LA VISIONE: UNLIM È IL PRODOTTO, NON UN CHATBOT

UNLIM non è un chatbot accanto a un simulatore.
UNLIM È il prodotto stesso.

### UNLIM ha le mani (action tags)
Già implementato: 26+ action tags. Può caricare esperimenti, piazzare componenti,
collegare fili, scrivere codice, compilare, play/pause, evidenziare, interagire.

### UNLIM ha gli occhi (vision)
Già implementato: screenshot analysis via Kimi/Gemini. Può vedere il circuito.

### UNLIM ha la voce (Whisper)
Già implementato: comandi vocali. Il docente parla, UNLIM fa.

### UNLIM manca il CERVELLO PEDAGOGICO
NON sa:
- Quale esperimento viene dopo
- Cosa ha già fatto la classe
- Come preparare una lezione
- Quando suggerire e quando stare zitto
- Come adattarsi al livello del docente

---

## I 3 PEZZI PER UNLIM COMPLETO

### Pezzo 1: UNLIM conosce i volumi
Iniettare tutti i 67 esperimenti con:
- componenti necessari
- circuito da costruire
- codice Arduino (se Vol3)
- obiettivo didattico
- prerequisiti
- misconception comuni dei bambini
- vocabolario progressivo (cosa può dire, cosa non può)

UNLIM deve poter dire:
"Per il capitolo 8 ti serve: 1 pulsante, 1 LED, 1 resistore. Vuoi che lo monto io?"

### Pezzo 2: UNLIM prepara la lezione
Quando il docente apre un esperimento, UNLIM genera automaticamente:

1. **PREPARA**: "Oggi facciamo il pulsante. Servono: ..."
2. **MOSTRA**: costruisce il circuito con [INTENT:JSON]
3. **CHIEDI**: "Secondo voi cosa succede se premo il pulsante?"
4. **OSSERVA**: [AZIONE:play] + evidenzia cosa cambia
5. **CONCLUDI**: riassunto di 2 frasi

Le lezioni sono preparate da UNLIM, fondate sulle esperienze dei volumi
e sul punto a cui si trova la classe.

### Pezzo 3: UNLIM inline, non in una chat
I suggerimenti appaiono DENTRO il simulatore:
- accanto al componente
- sopra la breadboard
- nel pannello esperimento
Non in una finestra chat separata. Questo è il "mai visto".

---

## COSA FUNZIONA GIÀ (non buttare via)

1. **Non separa teoria e pratica** — i contenuti non sono separati dal fare
2. **Non separa simulazione e spiegazione** — Galileo è vicino all'azione
3. **Offre diversi livelli di accesso** — blocchi, codice, guida, simulazione
4. **Integrazione kit+volumi+software** — si percepisce come prodotto unico
5. **Galileo è già abbastanza discreto** — laterale, contestuale, non invadente

Il problema NON è l'idea. È la gerarchia d'uso.

---

## COSA VA CORRETTO (priorità decrescente)

### P0 — Senza questi il prodotto non funziona per le scuole

A. **Il prodotto per default È teacher mode** — nessun toggle, nessuna differenza.
   Vista super essenziale: pochi controlli, step chiari, focus su ciò che si spiega,
   UNLIM in supporto laterale, niente parti avanzate esposte troppo presto.
   La complessità si sblocca con l'USO, non con un bottone.

B. **Ridurre densità cognitiva** — non togliere potenza, togliere esposizione
   simultanea. Il docente vede solo ciò che serve ORA.

C. **Percorso lezione centrale** — ogni esperimento ha:
   PREPARA → MOSTRA → CHIEDI → OSSERVA → CONCLUDI.
   Questo è il cuore del prodotto.

D. **UNLIM conosce i volumi** — senza curriculum nel prompt, UNLIM non può
   preparare nulla.

### P1 — Migliorano significativamente il prodotto

E. **Coerenza con mondo ELAB** — deve sembrare ecosistema ELAB, non piattaforma
   software generica. Palette, stile, sensazione dei volumi fisici.

F. **Centralità breadboard e appunti** — strumenti di annotazione naturali,
   centrali, fluidi. Il docente lavora alla lavagna.

G. **UNLIM ancora più breve e didattico** — max 3 frasi + analogia + azione.
   Parole corte. Esempi quotidiani. Non assistente generico.

H. **Distinguere base vs avanzato** — il livello avanzato (codice, blocchi, seriale)
   appare solo quando il docente lo cerca o lo sblocca con l'uso.

---

## STATO VERIFICATO (audit fisico 27/03/2026)

| Obiettivo | Stato | Evidenza |
|-----------|-------|----------|
| Insegnante spiega subito | ❌ NON DIMOSTRATO | Homepage rotta, menu con Dev/Admin, troppa densità |
| Galileo invisibile | ⚠️ PROMETTENTE | Laterale, contestuale. Ma "Sono qui" invade |
| Kit+volumi+software unico | ✅ SI PERCEPISCE | 67 esperimenti, 3 volumi, palette coerente |
| Controllo vocale | ⚠️ NON TESTATO | Whisper integrato, bottone visibile, mai verificato |
| Arduino/Breadboard perfetti | ✅ 8/10 | LED si accende, KCL funziona, SVG nitido |
| Scratch impeccabile | ⚠️ 6/10 | Generatore esiste, blocchi non verificati live |
| Penna lavagna fluida | ⚠️ NON TESTATO | Tab Lavagna esiste |
| Piattaforma minimale | ❌ NO | 20+ elementi visibili contemporaneamente |
| AI non clone ChatGPT | ✅ OK | "Sono UNLIM", zero identity leaks |
| Linguaggio 10-14 anni | ⚠️ PARZIALE | Risposte troppo lunghe (534 char), ma tono OK |
| GDPR | ❌ NON VERIFICATO | Dati su server USA, nessun DPIA |
| Marketing tutte le scuole | ❌ ZERO | Nessuna landing, redirect rotto |

---

## OBIETTIVI STRATEGICI

### Prodotto
- Chiunque deve poter insegnare subito (Principio Zero)
- UNLIM = cervello pedagogico che prepara lezioni
- Progressive disclosure = il default
- 67 esperimenti guidati con percorso 6-step

### Mercato
- TUTTE le scuole italiane
- Kit €75 + licenza €500-1000/anno
- Landing page per dirigenti scolastici
- Registrazione MePa/Consip
- PNRR Piano Scuola 4.0 come canale

### Tecnologia
- Mistral (EU) per AI in produzione → GDPR compliant
- Brain locale (Qwen) per routing → zero costi API
- PWA offline → scuole con connessione instabile
- Codice protetto → legato ai kit fisici, difficile da copiare

### Galileo/UNLIM
- NON clone ChatGPT/Claude
- Linguaggio 10-14 anni
- Esempi pratici, analogie quotidiane
- Conosce PERFETTAMENTE volumi e contesto
- Non rivela implementazione tecnica
- Filtri sicurezza linguaggio

---

## LINEE DI RICERCA (il sistema deve esplorare continuamente)

1. **Pedagogia**: misconcezioni elettricità bambini, scaffolding AI, effetto Protégé
2. **UX docente inesperto**: teacher adoption barriers, onboarding patterns, LIM usage
3. **Competitor**: Tinkercad, Wokwi, PhET, Arduino Education — cosa fanno meglio
4. **Mercato Italia**: PNRR bandi, MePa, pricing scuole, decision makers
5. **AI GDPR**: Mistral vs Anthropic, modelli locali, school hardware clusters
6. **Voice/NLU**: intent parsing, validator, comandi strutturati per simulatore
7. **Inline AI**: suggerimenti contestuali dentro il simulatore (non chat separata)
8. **Progressive disclosure**: pattern UX per complessità graduale

---

## TEST DI VERITÀ

Ogni modifica, ogni ciclo, ogni task deve superare questi test:

1. La Prof.ssa Rossi (52 anni, zero esperienza) capisce in 5 secondi?
2. Un ragazzo di 12 anni dalla LIM capisce cosa succede?
3. Il prodotto dice "ecco cosa fai adesso" o "guarda quante cose so fare"?
4. UNLIM sta preparando la lezione o sta solo rispondendo a domande?
5. Il percorso guidato è il CENTRO o è un'opzione nascosta?
6. Il codice/blocchi sono visibili solo quando servono?
7. Il prodotto sembra ELAB (kit, volumi) o sembra software generico?
