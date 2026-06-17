# PROMPT PER COWORK — PDF per Chiara

## Istruzioni per Cowork

Crea un PDF informale e chiaro per Chiara. Tono: come se stessi parlando a una collega/amica che vuole capire il progetto e darmi una mano. Mai formale, mai corporate. Usa il "tu". Quando proponi cose future (AI, prompt, automazione) usa sempre "se vorrai, ti spiego come...".

Il PDF deve avere queste sezioni, in ordine. Layout pulito, leggibile, con titoli chiari.

---

## CONTENUTO DEL PDF

### Sezione 1: Cos'e' ELAB (panoramica veloce)

ELAB e' un progetto educativo che insegna elettronica e Arduino a ragazzi di 8-14 anni. Ci sono 3 volumi (libri fisici venduti su Amazon) e una piattaforma digitale.

La piattaforma ha due parti:
- **Sito pubblico** (https://funny-pika-3d1029.netlify.app) — vetrina, informazioni, landing pages per i volumi
- **ELAB Tutor** (https://www.elabtutor.school) — la parte principale: un simulatore di circuiti interattivo con un assistente AI chiamato Galileo

Il simulatore permette ai ragazzi di costruire circuiti elettronici virtualmente, come se avessero una breadboard vera davanti. Possono piazzare LED, resistenze, Arduino, fili — e poi "premere play" per vedere il circuito funzionare. Galileo (l'AI) li aiuta se si bloccano, risponde alle domande, e puo' persino guardare il loro circuito tramite la camera e dire cosa c'e' che non va.

Il backend AI si chiama "nanobot" ed e' hostato su Render. Usa diversi modelli AI (DeepSeek, Groq per il testo, Gemini per la visione) per dare risposte contestuali. Ma Galileo non rivela mai la sua architettura — per i ragazzi e' semplicemente "Galileo, il tuo compagno di laboratorio".

Target utenti: studenti 8-14, insegnanti, genitori che comprano il libro su Amazon.

### Sezione 2: Ultimi sviluppi (cosa abbiamo fatto nelle ultime sessioni)

Nelle sessioni S66-S71 ci siamo concentrati su rendere ELAB Tutor perfetto su iPad con Apple Pencil. Ecco cosa e' stato fatto:

**S66 — Pointer Events + Tap-to-place**
Il simulatore usava 7 event handler vecchi (mousedown, touchstart, etc.). Li abbiamo sostituiti con 3 soli Pointer Events (pointerdown, pointermove, pointerup). Questo ha sbloccato:
- Pan con 1 dito fluido
- Pinch-zoom con 2 dita
- Palm rejection (appoggi il palmo e non succede nulla)
- Tap-to-place: tocchi un componente nella palette, poi tocchi il canvas, e il componente si piazza li'

**S67 — Context Menu Long-Press**
Su iPad non c'e' il tasto destro. Abbiamo aggiunto un menu contestuale che appare tenendo premuto 500ms su un componente. Da li' puoi eliminare, ruotare, o vedere le proprieta'. Se muovi il dito durante la pressione, il menu non appare (per non interferire col drag).

**S68 — Apple Pencil con pressione**
Il tab "Disegno" del simulatore ora reagisce alla pressione dell'Apple Pencil. Premi leggero: linea sottile. Premi forte: linea spessa. Il dito ha sempre spessore fisso (fallback 0.5).

**S69 — Feedback visivo + Pin Tooltips**
Tutti i pulsanti ora hanno feedback :active istantaneo su iPad (si rimpiccioliscono e cambiano colore al tocco). Nessun "sticky hover" (il problema dove un pulsante resta evidenziato dopo il tocco). Tocchi un pin di un componente e appare un tooltip scuro col nome del pin (es. "D13", "A0") che scompare dopo 2 secondi.

**S70 — 12 Bugfix da Quality Audit**
Audit brutale del codice ha trovato 12 bug. Tutti fixati: menu contestuale migrato da SVG a HTML (zoom-safe), target touch portati a 44px (dimensione minima Apple per le dita), tooltip con flip automatico se troppo vicino al bordo, pressione Apple Pencil con clamp di sicurezza, testi dinamici per iPad ("Tieni premuto" invece di "Click destro"), attributi ARIA per accessibilita'.

**S71 — 10 Fix Touch Target + Font**
Ultimo giro: 6 elementi interattivi avevano minHeight sotto 44px (il minimo per le dita dei bambini su iPad). Portati tutti a 44px. 4 font troppo piccoli (10-11px) portati a 12px. Build passa con 0 errori.

**Score attuale: 9.2/10** per iPad (era 6.5 prima di S66).

### Sezione 3: CREDENZIALI PER ACCEDERE

Per accedere a ELAB Tutor:

1. Vai su **https://www.elabtutor.school**
2. Clicca "Registrati" e crea un account con email e password
3. Una volta dentro, vai su "Attiva Licenza" e inserisci uno di questi codici:

| Codice | Sblocca |
|--------|---------|
| `ELAB-BUNDLE-ALL` | Tutti e 3 i volumi |
| `ELAB-VOL1-2026` | Solo Volume 1 |
| `ELAB-VOL2-2026` | Solo Volume 2 |
| `ELAB-VOL3-2026` | Solo Volume 3 |

Usa `ELAB-BUNDLE-ALL` per avere tutto sbloccato.

Una volta attivata la licenza, vai nella sezione "Simulatore" per vedere la breadboard, i componenti, e Galileo.

### Sezione 4: COME FARE I TEST SU iPAD (la parte piu' importante)

Questa e' la checklist completa. Serve per verificare che tutto funzioni su iPad reale. Ogni punto va testato e annotato.

**Preparazione:**
- Apri Safari su iPad
- Vai su https://www.elabtutor.school
- Fai login con le credenziali create
- Vai al simulatore (dalla dashboard, clicca "Simulatore")
- Carica un esperimento qualsiasi (es. "LED Rosso" dal Volume 1)

**A. Touch base (il canvas si muove bene?)**

| # | Test | Come farlo | Risultato atteso | PASS/FAIL |
|---|------|-----------|-----------------|-----------|
| A1 | Pan con 1 dito | Metti 1 dito sul canvas (non su un componente) e trascinalo | Il canvas si muove fluido, senza scatti | |
| A2 | Pinch zoom | Metti 2 dita sul canvas e allargale/stringile | Zoom smooth, centrato fra le dita | |
| A3 | Palm rejection | Appoggia il palmo della mano sul canvas | Non succede NULLA — nessun pan, nessun click | |
| A4 | Seleziona componente | Tocca un componente sulla breadboard | Bordo verde tratteggiato intorno al componente | |
| A5 | Trascina componente | Tocca e trascina un componente | Segue il dito, si aggancia alla breadboard quando lo molli | |

**B. Tap-to-place (piazzare componenti toccando)**

| # | Test | Come farlo | Risultato atteso | PASS/FAIL |
|---|------|-----------|-----------------|-----------|
| B1 | Seleziona dalla palette | Tocca un componente nella lista a sinistra (es. "LED") | Appare un banner in alto: "Tocca il canvas per piazzare: LED" | |
| B2 | Piazza sul canvas | Tocca un punto qualsiasi del canvas | Il componente appare nella posizione toccata | |
| B3 | Modo Passo Passo | Seleziona modo "Passo Passo" e premi "Avanti" | Il componente va nella posizione esatta del libro (non in un punto a caso) | |

**C. Context Menu (menu con pressione lunga)**

| # | Test | Come farlo | Risultato atteso | PASS/FAIL |
|---|------|-----------|-----------------|-----------|
| C1 | Long-press | Tieni premuto su un componente per mezzo secondo | Appare un menu con "Elimina", "Ruota", "Proprieta'" | |
| C2 | Cancellazione drag | Tieni premuto ma muovi il dito prima che il menu appaia | Il menu NON appare (perche' stai trascinando) | |
| C3 | Elimina | Tocca "Elimina" nel menu | Il componente sparisce | |
| C4 | Ruota | Tocca "Ruota" nel menu | Il componente ruota di 90 gradi | |
| C5 | Chiudi menu | Tocca un punto qualsiasi fuori dal menu | Il menu si chiude | |
| C6 | ControlBar | Seleziona un componente, poi usa i pulsanti Elimina/Ruota nella barra in alto | Stessa funzione del menu, ma dalla toolbar | |

**D. Apple Pencil (se disponibile)**

| # | Test | Come farlo | Risultato atteso | PASS/FAIL |
|---|------|-----------|-----------------|-----------|
| D1 | Disegno con pressione | Vai nel tab "Disegno" e disegna con Apple Pencil | Il tratto ha spessore variabile: sottile se premi piano, spesso se premi forte | |
| D2 | Pressione leggera vs forte | Fai una linea premendo piano, poi una premendo forte | Differenza visibile nello spessore | |
| D3 | Disegno col dito | Disegna col dito (senza Pencil) | Lo spessore e' uniforme (non varia) | |
| D4 | Nessun scroll | Mentre disegni, la pagina non scrolla e non fa bounce | La pagina resta ferma | |

**E. Feedback visivo + Tooltips**

| # | Test | Come farlo | Risultato atteso | PASS/FAIL |
|---|------|-----------|-----------------|-----------|
| E1 | Feedback pulsante | Tocca un qualsiasi pulsante della toolbar | Il pulsante si "preme" visivamente (diventa piu' piccolo e piu' scuro per un istante) | |
| E2 | No sticky hover | Dopo aver toccato un pulsante, guarda se resta evidenziato | NON deve restare evidenziato — torna normale subito | |
| E3 | Pin tooltip | Tocca un pin di un componente (i puntini dove si attaccano i fili) | Appare una etichetta scura col nome del pin (es. "D13", "GND") | |
| E4 | Tooltip auto-dismiss | Aspetta 2 secondi dopo che il tooltip appare | Il tooltip scompare da solo | |
| E5 | Tooltip dismiss manuale | Tocca un punto qualsiasi lontano dal pin | Il tooltip scompare subito | |

**F. Test generali**

| # | Test | Come farlo | Risultato atteso | PASS/FAIL |
|---|------|-----------|-----------------|-----------|
| F1 | Esperimento Vol1 | Carica un esperimento del Volume 1 (es. "LED Rosso") | Tutti i componenti visibili e toccabili | |
| F2 | Esperimento Vol3 | Carica un esperimento del Volume 3 (es. uno con NanoBreakout) | Arduino e wing pins corretti, componenti visibili | |
| F3 | Simulazione | Premi il pulsante Play (triangolo) | Il LED si accende, il buzzer suona (se presente) | |
| F4 | Stabilita' | Usa il simulatore per almeno 5 minuti, cambiando esperimenti | Nessun crash, nessuna schermata bianca | |

### Sezione 5: COME ANNOTARE GLI ERRORI

Quando trovi un problema durante i test, annotalo cosi':

**Formato per ogni bug trovato:**
```
ID: [lettera del test, es. A1, C3, F2]
Descrizione: cosa hai fatto e cosa e' successo di sbagliato
Gravita': CRITICO (non funziona per niente) / MEDIO (funziona male) / LIEVE (fastidio minore)
Screenshot: se possibile, fai uno screenshot su iPad (premi Power + Volume Su)
Dispositivo: modello iPad (es. iPad Air 5a gen) + versione iOS (la trovi in Impostazioni > Generali > Info)
```

**Esempio:**
```
ID: A2
Descrizione: Il pinch zoom funziona ma e' scattoso, non fluido. A volte il canvas "salta" durante lo zoom.
Gravita': MEDIO
Screenshot: pinch-zoom-scatti.png
Dispositivo: iPad Air 5a gen, iPadOS 17.3
```

Se qualcosa non funziona proprio (crash, schermata bianca, tocco che non risponde), e' CRITICO.
Se funziona ma male (scatti, ritardi, posizione sbagliata), e' MEDIO.
Se e' solo un dettaglio estetico (font bruttino, colore leggermente diverso), e' LIEVE.

**Dove mandare i risultati:** mandali ad Andrea (WhatsApp o email). Anche un messaggio vocale va benissimo — l'importante e' che ci sia il codice del test (A1, B2, etc.) e cosa e' successo.

### Sezione 6: CONCETTI AI (se vorrai approfondire)

Queste sono cose che, se vorrai, ti spiego con calma in una call o di persona. Non c'e' fretta, ma possono esserti utili per capire come lavoro e come potresti usarle anche tu.

**Prompt migliori**
Un "prompt" e' l'istruzione che dai a un'AI. La qualita' della risposta dipende tantissimo da come chiedi. Per esempio, dire "fammi un sito" produce risultati molto diversi da "crea una landing page per un prodotto educativo per ragazzi 8-14 anni, tono informale, palette navy+verde lime, con sezione hero, features, e CTA per Amazon". Se vorrai, ti faccio vedere come strutturare prompt che danno risultati 10x migliori.

**Contesto**
Le AI lavorano meglio quando sanno il contesto. Io per esempio do a Claude dei file di "memoria" (MEMORY.md, INVARIANTS.md, TASK-TRACKER.md) dove c'e' scritto tutto sul progetto: architettura, decisioni passate, regole, score. Cosi' ogni nuova sessione riparte da dove avevamo lasciato, senza rispiegare tutto. Se vorrai, ti mostro come creare il tuo "contesto" per qualsiasi progetto.

**Agenti e Automazione**
Un "agente" e' un'AI che non solo risponde, ma fa cose: legge file, scrive codice, esegue comandi, verifica i risultati. Io lavoro con agenti che fanno audit automatici del codice, cercano bug, e propongono fix. Posso lanciarli in parallelo per fare piu' cose contemporaneamente. Se vorrai, ti faccio vedere come funziona un workflow con agenti.

**Vibe Coding**
Vibe coding e' un modo di programmare dove descrivi a parole cosa vuoi, e l'AI scrive il codice per te. Tu guidi la direzione ("voglio che il pulsante diventi verde quando lo tocchi") e l'AI implementa. Non serve sapere programmare nel dettaglio — serve sapere cosa vuoi e come verificare che funzioni. E' il modo in cui ho costruito gran parte di ELAB Tutor. Se vorrai, ti faccio provare dal vivo.

### Sezione 7: Contatti e link utili

- **ELAB Tutor**: https://www.elabtutor.school
- **Sito pubblico**: https://funny-pika-3d1029.netlify.app
- **Andrea (WhatsApp)**: 346 165 3930
- **Omaric SRL (WhatsApp)**: 346 809 3661

---

## NOTE PER COWORK — STILE E FORMATTAZIONE

- Tono: informale, amichevole, come un messaggio a una collega. Mai aziendale.
- Usa frasi corte. Niente paragrafi da 10 righe.
- Le tabelle dei test iPad devono essere chiare e stampabili (Chiara potrebbe stamparle e usarle con una penna).
- La colonna PASS/FAIL nelle tabelle va lasciata vuota — la compila Chiara durante i test.
- Metti in grassetto le cose importanti.
- NON usare emoji.
- Colori suggeriti: Navy #1E4D8C per i titoli, Verde #7CB342 per gli accenti. Ma va bene anche semplice bianco e nero.
- Il PDF deve essere leggibile su schermo E stampabile.
- Aggiungi in fondo: "Documento generato il 5 marzo 2026 — Progetto ELAB — Andrea Marro"

## FILE DI CONTESTO DA CONSULTARE (per Cowork)

Se hai bisogno di piu' dettagli, questi sono i file chiave del progetto:

1. `docs/context/ipad-libero/05-TASK-TRACKER.md` — stato di tutti i task, checklist test iPad completa
2. `docs/context/ipad-libero/02-INVARIANTS.md` — regole tecniche inviolabili del progetto
3. `.team-status/QUALITY-AUDIT.md` — audit qualita' post-S71 con score card completa
4. `MEMORY.md` (nella root .claude del progetto) — memoria completa del progetto con architettura, decisioni, score
5. `netlify/functions/utils/valid-codes.js` (nella cartella newcartella) — codici licenza validi

---

*Prompt scritto da Andrea — S71 — 2026-03-05*
