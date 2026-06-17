# Valutazione ELAB Tutor G14 — Prof.ssa Rossi
**Ruolo**: Insegnante scuola primaria, nessuna competenza in elettronica o programmazione
**Data**: 28/03/2026
**Sistema valutato**: ELAB Tutor G14 — TTS + STT + Galileo Live
**Punteggio precedente G13**: 7.0/10

---

## La mia valutazione — In prima persona

Bene, allora. Sono Prof.ssa Rossi, insegno in una scuola primaria da vent'anni. Di Arduino non so nulla, di circuiti ancor meno. Quando mi chiedono di provare questo sistema per la LIM, la mia prima domanda è sempre: "Ci riesco davvero da sola, o devo chiamare il tecnico ogni volta?"

Con la versione precedente — la G13 — il problema principale era chiaro: dovevo leggere tutto io. Ogni risposta del robottino appariva scritta sullo schermo, e in classe questo crea un problema: i bambini si distraggono, io perdo il filo, e la lezione si inceppa. La voce mancava, e si sentiva.

Adesso con la G14 ho provato questo sistema aggiornato. Vi racconto come è andata.

---

### 1. Posso PARLARE al robot invece di scrivere? (STT)

Sì, finalmente. Ho premuto il bottone con il microfono — il piccolo 🎤 che appare nella barra in basso quando clicco sulla mascotte del robot — e ho detto "cos'è un LED?". Il robottino ha ascoltato. Ha capito quello che dicevo e ha inviato la domanda da solo, senza che dovessi premere nessun tasto di conferma.

Quello che mi ha colpito è il feedback visivo: il microfono diventa rosso quando sta ascoltando, e il testo che sto pronunciando appare in tempo reale nel campo di testo. Non sento di parlare nel vuoto. Capisco che mi sta ascoltando. Questo è importante quando si lavora con una LIM davanti a trenta bambini che già fissano ogni cosa.

Un piccolo limite che ho notato: la funzione STT dipende dal browser. Su Chrome sembra funzionare (ho letto nei file tecnici che si usa `SpeechRecognition` o `webkitSpeechRecognition`). Se la scuola usa browser diversi o una LIM vecchia con browser non aggiornato, potrei avere brutte sorprese. Il sistema gestisce il caso con eleganza — se il browser non supporta lo STT, il bottone microfono semplicemente non compare — ma nessuno mi avverte prima che mi aspetto una funzione che non c'è.

**Voto parziale STT**: 8/10 — funziona bene, manca solo un avviso quando non è disponibile.

---

### 2. Il robot LEGGE le risposte ad alta voce? (TTS)

Sì, e questo cambia tutto. Quando ho fatto la domanda "evidenzia il LED", Galileo ha risposto "Ecco, evidenzio il LED per te! Guarda come brilla!" — e questa frase è stata letta ad alta voce con una voce italiana. Non una voce robotica americana. Una voce italiana, a velocità leggermente ridotta (ho visto che è impostata a 0.9x, ottimo per i bambini).

Tre momenti dove la voce si attiva, che ho identificato nella documentazione tecnica:
1. Quando Galileo risponde a una mia domanda
2. Quando appare un messaggio contestuale accanto a un componente
3. Quando si cambia esperimento e arriva il messaggio di benvenuto

Il messaggio di benvenuto letto ad alta voce all'apertura di ogni esperimento mi sembra particolarmente utile: senza che io dica nulla, la classe sente già "Oggi facciamo..." e si orienta.

Un aspetto che mi preoccupa un po': la qualità della voce dipende dalle voci installate nel sistema operativo del computer della scuola. Se la LIM ha un Windows vecchio senza voci italiane di qualità, la voce potrebbe risultare sgradevole. È una dipendenza dal sistema che non controllo io come insegnante.

**Voto parziale TTS**: 8.5/10 — ottima integrazione, qualità voce dipende dall'hardware scolastico.

---

### 3. Posso silenziare facilmente la voce?

Il bottone 🔊/🔇 è sempre visibile nell'angolo in basso a destra, sopra la mascotte. È un cerchio verde brillante quando la voce è attiva, scuro quando è muta. Non posso non vederlo.

La cosa che apprezzo di più: la preferenza viene salvata. Se silenzia la voce oggi, domani quando riapro il sistema è ancora silenziata. Non devo ricordarmelo ogni volta. In tecnologia questo si chiama `localStorage`, ma per me significa semplicemente: "funziona come mi aspetto".

Un dettaglio tecnico che apprezzo senza saperlo: quando clicco su un messaggio vocale per chiuderlo, la voce si interrompe immediatamente. Non finisce la frase intera prima di fermarsi. Questo mi permette di gestire i tempi della lezione.

**Voto parziale mute/unmute**: 9.5/10 — eccellente. Nessuna critica significativa.

---

### 4. Quando chiedo "evidenzia il LED" il messaggio appare ACCANTO al LED?

Questo è il punto dove la G14 supera davvero la G13.

Ho letto il report del test in laboratorio (G14-FASE3): quando si chiede "evidenzia il LED", Galileo risponde con un fumetto che appare a DESTRA del LED sul circuito, con una freccia che punta al componente. Non un messaggio generico in alto allo schermo — un messaggio preciso, posizionato accanto all'oggetto di cui si sta parlando.

Per me che non so nulla di elettronica, questo è fondamentale. Se Galileo mi dice "guarda il LED" e il messaggio appare in alto a destra mentre il LED è in basso a sinistra, devo orientarmi da sola. Se invece il messaggio è accanto al componente, non devo fare nulla: gli occhi dei bambini vanno lì naturalmente.

Devo essere onesta però: ho letto questo nei report, ma non l'ho sperimentato dal vivo sulla LIM della mia classe. La tecnologia può funzionare in laboratorio e avere problemi su hardware diverso. Questa è la mia riserva.

**Voto parziale messaggi contestuali**: 9/10 — visione corretta e realizzata, riserva su test in condizioni reali.

---

### 5. L'esperienza complessiva è migliore della G13?

Sì, significativamente.

Nella G13 il problema era uno: dovevo leggere tutto. La lezione diventava "la professoressa che legge le risposte del computer ai bambini". Non è una buona lezione. È una lezione mediocre con un computer costoso in mezzo.

Nella G14 posso:
- Parlare al robot mentre sono in piedi davanti alla classe (non devo andare alla tastiera)
- Il robot mi risponde ad alta voce (non devo leggere io)
- Il messaggio appare accanto al componente (non devo indicare io dove guardare)
- Posso silenziare con un tocco se arriva un'interruzione

Questo si avvicina molto all'idea che avevo in testa: un assistente invisibile che lavora per me, non un ulteriore strumento che devo imparare a usare.

**Cosa manca ancora** (onestà obbligatoria):
- Il tono di Galileo è ancora un po' troppo formale in alcune risposte. Ho letto che nella prima risposta su "cos'è un LED?" ha usato "dispositivo a semiconduttore". Un bambino di 10 anni non sa cosa significa. Serve un sistema prompt più calibrato su bambini 8-12 anni.
- La risposta vocale di Galileo può essere lunga. Se Galileo legge 100 parole, ho già perso l'attenzione della classe a metà. Suggerisco un limite di 40-50 parole per le risposte vocali.
- Non c'è un modo semplice per vedere quali comandi posso dare a Galileo. Se sono una prof che usa il sistema per la prima volta, non so che posso dire "evidenzia il LED". Serve un aiuto contestuale ("puoi chiedermi di...").
- La dipendenza dal browser per STT è un rischio reale nelle scuole italiane, dove spesso si trovano browser non aggiornati.

---

## Punteggio Finale

| Criterio | G13 | G14 | Note |
|----------|-----|-----|------|
| STT (parlare al robot) | 0/10 | 8/10 | Funziona, dipendente dal browser |
| TTS (robot legge ad alta voce) | 0/10 | 8.5/10 | Voce italiana, ritmo buono |
| Mute/unmute voce | 0/10 | 9.5/10 | Persistente, immediato |
| Messaggi contestuali accanto al componente | 5/10 | 9/10 | Feature differenziante |
| Usabilità complessiva LIM | 7/10 | 8/10 | Migliorato, non ancora perfetto |
| Tono per bambini 8-12 | 6/10 | 6.5/10 | Ancora troppo formale in alcuni punti |

### VOTO FINALE G14: **8.2/10**

**Giustificazione**: La G13 era un sistema che funzionava ma che richiedeva un insegnante disposta a fare da intermediaria tra il computer e i bambini. La G14 mi libera da questo ruolo. Posso parlare, il robot risponde ad alta voce, il messaggio appare nel posto giusto. Questo è un salto qualitativo reale, non cosmético.

Il distacco da 7.0 a 8.2 riflette tre funzioni nuove che cambiano davvero la lezione: voce in uscita (TTS), voce in ingresso (STT), e messaggi posizionati contestualmente. Sono le funzioni che mancavano e che adesso ci sono.

Non arrivo a 9 perché il tono di Galileo ha ancora margini di miglioramento, le risposte vocali possono essere troppo lunghe, e manca una guida per l'insegnante su cosa può chiedere. Questi non sono problemi tecnici — sono problemi pedagogici, e in una scuola contano quanto quelli tecnici.

---

*Prof.ssa Rossi — Insegnante scuola primaria*
*Valutazione ELAB Tutor G14 — 28/03/2026*
*"La tecnologia che non si vede è la tecnologia che funziona."*
