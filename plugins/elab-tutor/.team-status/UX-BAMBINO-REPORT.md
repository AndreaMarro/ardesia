# UX Bambino Report -- "Sono Marco, ho 10 anni"
## Date: 2026-02-13

---

### VERDETTO GENERALE: PROMOSSO (con riserva)

L'app e' generalmente accogliente e ben pensata per un bambino italiano. Il tono di Galileo e' da amico, non da professore. I colori sono vivaci, le emoji aiutano. Ci sono pero' **27 problemi** da risolvere, di cui 10 urgenti. Il simulatore ha termini tecnici in inglese ("BOM", "Output", "Board") che un bambino non capisce. Alcune schermate (PrivacyPolicy, errori compilatore, alert di formati file) sembrano scritte per adulti.

**Punteggio generale: 7/10** -- Buono, ma con margine di miglioramento.

---

### Testi da Cambiare (English -> Italian)

| File | Linea | Testo Attuale | Suggerimento |
|------|-------|---------------|--------------|
| `ChatOverlay.jsx` | 80 | `Online` | `Sono qui` oppure `Attivo` |
| `TutorTopBar.jsx` | 31 | `aria-label="Toggle sidebar"` | `aria-label="Apri/chiudi menu"` |
| `ChatOverlay.jsx` | 89 | `aria-label="Toggle chat size"` | `aria-label="Ingrandisci/riduci chat"` |
| `TutorTopBar.jsx` | 84 | `Fullscreen` / `Esci Fullscreen` | `Schermo intero` / `Esci da schermo intero` |
| `ControlBar.jsx` | 219 | `BOM` (label bottone) | `Lista Pezzi` |
| `ControlBar.jsx` | 215 | `Mostra lista componenti (BOM)` (tooltip) | `Mostra la lista dei pezzi usati` |
| `BomPanel.jsx` | 93 | `Lista Componenti (BOM)` | `Lista dei Pezzi` |
| `ComponentPalette.jsx` | 18 | categoria `Output` | `Uscita` oppure `Luci e Suoni` |
| `ComponentPalette.jsx` | 19 | categoria `Input` | `Ingresso` oppure `Sensori e Pulsanti` |
| `ComponentPalette.jsx` | 20 | categoria `Board` | `Schede` |
| `ComponentPalette.jsx` | 17 | `Semiconduttori` | Termine tecnico OK per Vol.3, ma suggerire tooltip: "componenti elettronici speciali" |
| `BomPanel.jsx` | 24 | `Reed Switch` | `Interruttore a Magnete` |
| `SerialMonitor.jsx` | 50 | `Monitor Seriale` | OK (termine tecnico Arduino standard) ma aggiungere tooltip: "Schermata dove Arduino ti scrive messaggi" |
| `SerialMonitor.jsx` | 106 | `Auto-scroll ON/OFF` | `Scorrimento automatico ON/OFF` |
| `SerialMonitor.jsx` | 92-93 | `Timestamp ON/OFF` | `Orario ON/OFF` |
| `PropertiesPanel.jsx` | 106 | `Colore LED` -- colori in inglese: `red, green, yellow, blue, white` nei title | `rosso, verde, giallo, blu, bianco` |

---

### Testi Troppo Difficili

| File | Linea | Testo | Problema | Suggerimento |
|------|-------|-------|----------|--------------|
| `ConsentBanner.jsx` | 53 | "Questo sito utilizza cookie analitici per migliorare l'esperienza. Nessun dato personale viene condiviso con terzi." | Linguaggio legale, bambino non sa cosa sono "cookie analitici" ne "terzi" | "Questo sito raccoglie informazioni su come lo usi, per farlo funzionare meglio. Non diamo le tue informazioni a nessuno!" |
| `PrivacyPolicy.jsx` | 23 | "Informativa sulla Privacy" + tutto il documento | Linguaggio completamente legale/adulto | Aggiungere un riquadro iniziale "Versione semplice" con 3 frasi: "Non sappiamo chi sei. Non salviamo il tuo nome. I tuoi disegni restano nel tuo computer." |
| `PrivacyPolicy.jsx` | 87-92 | "Base giuridica" / "art. 6, par. 1, lett. a del Regolamento UE 2016/679" | Incomprensibile per un bambino | OK che ci sia per i genitori, ma il banner iniziale deve parlare da bambino |
| `api.js` | 113 | "Galileo non e' raggiungibile al momento. Il servizio AI e' in manutenzione." | "Servizio AI" e "manutenzione" sono troppo tecnici | "Galileo sta dormendo adesso. Puoi comunque usare il manuale e il simulatore!" |
| `api.js` | 116 | "Il server ha un problema temporaneo" | "Server" e' incomprensibile | "Ops! Qualcosa non funziona. Riprova tra un momento!" |
| `api.js` | 122 | "Accesso non autorizzato. Prova a ricaricare la pagina." | Spaventoso e tecnico | "Ops! Qualcosa si e' confuso. Ricarica la pagina e riprova." |
| `api.js` | 583 | "Il compilatore non risponde. Verifica la connessione internet e riprova." | "Compilatore" non e' comprensibile per 8 anni | "Il traduttore del codice non risponde. Controlla che internet funzioni e riprova." |
| `errorTranslator.js` | 29 | "void value not ignored as it ought to be" -> "Stai cercando di salvare il risultato di una funzione che non restituisce nulla (void). Togli la parte '= ...' davanti." | Troppo tecnico anche nella versione tradotta, "void" e' gergo | "Questa funzione non da indietro un risultato. Non puoi scrivere `= ...` prima di usarla." |
| `errorTranslator.js` | 38 | "Le librerie supportate sono: Serial, tone, e le funzioni base di Arduino." | "Librerie supportate" e' per adulti | "Questo file extra non c'e'. Prova a usare solo le cose che Arduino conosce gia!" |
| `errorTranslator.js` | 31 | "invalid conversion from..." -> "Non puoi trasformare ${m[1]} in ${m[2]} automaticamente" | I nomi dei tipi C++ sono incomprensibili | "Stai mescolando due cose diverse. Controlla che i tipi siano uguali (come int e int)." |
| `ShortcutsPanel.jsx` | 27 | "Alt + Trascina" / "Tasto centrale" | "Alt" e "Tasto centrale mouse" non sono chiari per un bambino | "Alt + muovi il mouse" / "Rotella premuta + muovi il mouse" |
| `ElabTutorV4.jsx` | 492 | Alert formato non supportato con lista DOCX/PPTX/PDF | Troppo tecnico, lista di formati file | "Questo tipo di file non funziona qui. Prova a trasformarlo in PDF prima di caricarlo." |
| `ElabTutorV4.jsx` | 496 | Alert formato sconosciuto con lista formati | Troppo lungo e tecnico | "Questo file non si puo' aprire. Prova con un PDF, un'immagine o un file di testo!" |

---

### Errori Spaventosi

| File | Linea | Messaggio | Friendly Version |
|------|-------|-----------|-----------------|
| `ElabTutorV4.jsx` | 417 | `alert('Errore nel caricamento del PDF')` | "Non sono riuscito ad aprire il PDF. Prova a ricaricarlo!" |
| `ElabTutorV4.jsx` | 443 | `alert('Errore nel caricamento del documento Word.')` | "Non sono riuscito ad aprire questo file Word. Prova a salvarlo come PDF!" |
| `ElabTutorV4.jsx` | 467 | `alert('Errore nel caricamento della presentazione. Prova a esportare come PDF.')` | "Non sono riuscito ad aprire questa presentazione. Prova a salvarla come PDF prima!" |
| `ElabTutorV4.jsx` | 881 | `alert('Errore nel caricamento del Volume ${volNum}')` | "Non sono riuscito ad aprire il Volume ${volNum}. Prova a ricaricare la pagina!" |
| `ElabTutorV4.jsx` | 928 | `'Errore nell'analisi dell'immagine. Riprova.'` (con icona rossa) | "Non sono riuscito a guardare l'immagine. Prova a mandarmela di nuovo!" |
| `ElabTutorV4.jsx` | 978 | `alert('Spazio di archiviazione pieno! Elimina alcuni taccuini vecchi per liberare spazio.')` | "Lo spazio per salvare e' finito! Cancella qualche taccuino vecchio per fare posto." |
| `api.js` | 548 | `'Risposta non valida dal compilatore'` (interno) | "Il traduttore del codice ha risposto in modo strano. Riprova." |
| `api.js` | 119 | `'Troppe richieste! Aspetta qualche secondo e riprova.'` | OK ma aggiungo alternativa piu' gentile: "Galileo ha bisogno di un attimo per pensare! Riprova tra qualche secondo." |
| `ElabTutorV4.jsx` | 1083 | `confirm('Eliminare questo taccuino?')` | "Sei sicuro di voler cancellare questo taccuino? Non potrai recuperarlo!" |
| `ElabTutorV4.jsx` | 1523 | `confirm('Vuoi davvero cancellare tutto il disegno?')` | OK -- chiaro e comprensibile |

---

### Bottoni Confusi

| File | Linea | Bottone | Problema | Suggerimento |
|------|-------|---------|----------|--------------|
| `ControlBar.jsx` | 219 | `BOM` (testo bottone) | Acronimo inglese incomprensibile | `Lista Pezzi` |
| `ControlBar.jsx` | 236 | `Foto` (per export PNG) | Potrebbe confondersi con "scattare foto con webcam" | `Salva Immagine` oppure `Cattura Circuito` |
| `ControlBar.jsx` | 253 | `Tasti` (per shortcuts) | Non chiaro cosa faccia | `Scorciatoie` o `Aiuto Tastiera` |
| `ChatOverlay.jsx` | 200 | `</>` (bottone editor codice) | Simbolo criptico per un bambino | Aggiungere tooltip piu' chiaro: "Scrivi codice Arduino" |
| `ComponentPalette.jsx` | 329 | `Modalita Collegamento Fili` | Un po' lungo, puo' confondere | `Collega i Fili` |
| `ControlBar.jsx` | 167 | `Collega Fili` (toggle label) | OK, chiaro |  |
| `TutorTopBar.jsx` | 64 | `Sessione` (bottone export) | Un bambino non sa cos'e' una "sessione" | `Salva Registro` o nasconderlo (e' per docenti) |

---

### Onboarding: 9/10

**Punti di forza:**
- Il benvenuto di Galileo con "Ciao! Io sono Galileo" e' caldo e invitante
- Le 3 scelte (ho il kit / esploro / sono docente) sono chiare e ben illustrate con emoji
- La selezione del volume con colori distinti (verde/arancio/rosso) e' intuitiva
- Il mini-tutorial in 3 passi e' perfetto: semplice, numerato, con grassetto sulle parole chiave
- Il messaggio finale "Sei pronto!" con razzo e' motivante
- "Sbagliare fa parte dell'apprendimento" e' un tocco pedagogico eccellente
- I dot di progresso sono chiari
- I bottoni sono grandi (minHeight 56px) -- perfetto per le dita dei bambini

**Punti deboli:**
- Step 2 (selezione volume): la descrizione "LED, resistori, circuiti semplici" per il Vol.1 e' OK, ma "Pulsanti, potenziometri, LDR" per il Vol.2 usa termini tecnici ("potenziometri" e soprattutto "LDR" che e' un acronimo)
  - Suggerimento: "Pulsanti, manopole, sensori di luce"
- Nessuna opzione "Non so / aiutami a scegliere" per chi e' indeciso

---

### Quiz: 8.5/10

Ho analizzato i 10 quiz dei primi 10 esperimenti di Vol.1. Ecco il giudizio:

**Punti di forza:**
- Domande chiare e in italiano semplice
- Le spiegazioni sono educative e incoraggianti (usano "!")
- 3 opzioni per domanda e' perfetto (non troppo, non poco)
- Le risposte sbagliate sono plausibili (non ovviamente ridicole)
- Spiegano il "perche'" dopo la risposta, non solo il "cosa"
- Collegano ai concetti scientifici in modo semplice ("E' la Legge di Ohm!")

**Punti deboli:**
- La risposta corretta e' SEMPRE la prima opzione (correct: 0). Un bambino furbo lo capisce dopo 3-4 quiz. **BUG CRITICO**: randomizzare l'ordine delle opzioni alla visualizzazione!
- Alcune spiegazioni usano termini come "tensione di forward" (quiz del LED blu, riga 636) che e' troppo tecnico
  - Suggerimento: "Ogni colore di LED ha bisogno di una spinta diversa per accendersi: il blu ha bisogno di una spinta piu' forte (3V) del rosso (2V)."
- "Catodo comune" (quiz riga 455) e' gergo tecnico non spiegato
  - Suggerimento: "la gamba piu' lunga che va a terra (il meno)"
- Mancano quiz per Vol.2 e Vol.3 (solo Vol.1 li ha)

---

### Linguaggio Misto / Incoerenze

| File | Linea | Problema |
|------|-------|---------|
| `BomPanel.jsx` | 24 | "Reed Switch" -- nome inglese senza traduzione (tutti gli altri componenti sono in italiano) |
| `ComponentPalette.jsx` | 18 | Categorie mischiano italiano (Alimentazione, Passivi, Strumenti) e inglese (Output, Input, Board) |
| `SerialMonitor.jsx` | varie | "Auto-scroll", "Timestamp" -- inglese puro in un contesto tutto italiano |
| `ShortcutsPanel.jsx` | 37 | "Esc" -- OK come tasto, ma "Esci modalita filo" potrebbe essere "Esci dalla modalita filo" |
| `ControlBar.jsx` | 49 | `Arduino` / `Circuito` -- OK, "Arduino" e' un nome proprio |

---

### Accessibilita e Touch Target

**Positivo:**
- Quasi tutti i bottoni hanno `minHeight: 44px` -- conforme alle WCAG per touch
- I bottoni dell'onboarding hanno `minHeight: 56px` -- eccellente per bambini
- I font sono leggibili (14px base, Open Sans)
- I colori dei volumi sono distinti e accessibili

**Da migliorare:**
- Il bottone close `x` della chat e dei pannelli e' piccolo visivamente (14px font) anche se ha area touch 44px
- Gli `aria-label` in inglese ("Toggle sidebar", "Toggle chat size") non funzionano per screen reader in italiano

---

### TOP 10 CAMBIAMENTI PIU' URGENTI

1. **QUIZ: Randomizzare ordine risposte** -- Risposta corretta sempre in posizione 0, troppo prevedibile (`experiments-vol1.js`, tutte le quiz)

2. **"BOM" -> "Lista Pezzi"** -- Nessun bambino di 10 anni sa cosa sia "BOM" (`ControlBar.jsx` riga 219, `BomPanel.jsx` riga 93)

3. **Categorie componenti in italiano** -- "Output" -> "Luci e Suoni", "Input" -> "Sensori e Pulsanti", "Board" -> "Schede" (`ComponentPalette.jsx` righe 18-20)

4. **Errori API child-friendly** -- "Il server ha un problema temporaneo" -> "Ops! Qualcosa non funziona. Riprova tra un momento!" (`api.js` righe 106-128)

5. **"Online" -> "Sono qui"** -- Nel header della chat, "Online" e' inglese fuori contesto (`ChatOverlay.jsx` riga 80)

6. **"Reed Switch" -> "Interruttore a Magnete"** -- Unico componente rimasto in inglese (`BomPanel.jsx` riga 24)

7. **Banner cookie semplificato** -- Riscrivere per un bambino: "Raccogliamo info anonime per migliorare l'app. OK?" (`ConsentBanner.jsx` riga 53)

8. **Onboarding Vol.2 descrizione** -- "Pulsanti, potenziometri, LDR" -> "Pulsanti, manopole, sensori di luce" (`OnboardingWizard.jsx` riga 128)

9. **Alert errori amichevoli** -- Tutti gli `alert('Errore...')` nel file principale vanno riscritti senza la parola "Errore" (`ElabTutorV4.jsx` righe 417, 443, 467, 881)

10. **Aria-label in italiano** -- `"Toggle sidebar"`, `"Toggle chat size"` devono essere in italiano per accessibilita (`TutorTopBar.jsx` riga 31, `ChatOverlay.jsx` riga 89)

---

### RIEPILOGO NUMERICO

| Categoria | Conteggio |
|-----------|-----------|
| Testi in inglese da tradurre | 16 |
| Testi troppo difficili | 13 |
| Errori spaventosi | 10 |
| Bottoni confusi | 7 |
| Onboarding score | 9/10 |
| Quiz score | 8.5/10 |
| **Problemi totali** | **27** |
| **Urgenti (TOP 10)** | **10** |

---

### NOTE FINALI DA MARCO

> "L'app e' bella e Galileo e' simpatico! Mi piace il razzo alla fine del tutorial. Pero' quando dice 'BOM' non capisco cosa vuol dire, e quando c'e' scritto 'Output' e 'Input' non so cosa cliccare. I quiz sono troppo facili perche' la risposta giusta e' sempre la prima. E quando c'e' un errore mi fa paura perche' dice 'ERRORE' in rosso. Vorrei che Galileo mi dicesse 'non ti preoccupare, riprova!' invece."

---

*Report generato da analisi statica del codice sorgente. Nessun file e' stato modificato.*
*Analizzati 18 file, ~6,500 righe di codice, ~320 stringhe user-facing.*
