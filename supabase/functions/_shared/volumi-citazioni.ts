/**
 * volumi-citazioni — iter 14 Andrea fix Onniscenza citation Vol/pag verbatim.
 *
 * capitoli.json (37 cap) ha citazioni_volume vuoto 0/37 — buildCapitoloSummaryFragment
 * produce solo titolo + esperimenti list, NO citazione verbatim "Vol.X pag.Y «...»".
 *
 * Questo file fornisce 30 citazioni hardcoded core da volume-references.js (bookText
 * + bookQuote) per Vol.1 cap.6-14 + Vol.2 cap.3-12 + Vol.3 cap.5-12.
 *
 * Fonte: src/data/volume-references.js (1280 righe verificate da pdftotext sui 3 PDF
 * ELAB ufficiali estratti 15/04/2026):
 *   Vol1: VOL1_ITA_COMPLETO V.0.1 GP.pdf (114 pp)
 *   Vol2: VOL2_ITA_COMPLETO GP V 0.1.pdf (117 pp)
 *   Vol3: Manuale VOLUME 3 V0.8.1.pdf (95 pp)
 *
 * Wired in unlim-chat/index.ts via lookupCitazioneByCapitolo(volume, capitolo).
 * LLM riceve "Citazione Vol.X pag.Y «testo verbatim»" inline system prompt → cita sempre.
 */

interface VolumeCitazione {
  vol: number;
  cap: number;
  pag: number;
  titolo: string;
  testo_verbatim: string;
  analogia?: string;
  errori_comuni?: string[];
}

export const VOLUMI_CITAZIONI_CORE: VolumeCitazione[] = [
  // ─── VOL.1 LE BASI ─────────────────────────────────────────────
  { vol: 1, cap: 6, pag: 27, titolo: "Cos'è il diodo LED?",
    testo_verbatim: "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: Un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.",
    analogia: "Il LED è come una piccola lampadina molto efficiente, ma funziona solo nel verso giusto",
    errori_comuni: ["polarità invertita anodo/catodo", "resistore da 470Ω mancante", "LED bruciato senza protezione"] },
  { vol: 1, cap: 7, pag: 35, titolo: "Cos'è il LED RGB?",
    testo_verbatim: "Un LED RGB contiene tre LED (rosso, verde, blu) nello stesso involucro, condivide il catodo (gambetta lunga).",
    analogia: "Come tre piccole lampadine colorate dentro uno stesso bulbo",
    errori_comuni: ["catodo confuso con anodo", "resistori mancanti su uno dei colori", "miscelazione PWM imperfetta"] },
  { vol: 1, cap: 8, pag: 43, titolo: "Cos'è il pulsante?",
    testo_verbatim: "Il pulsante è un componente che chiude il circuito solo quando viene premuto. Quando lasci il pulsante, il circuito si apre e la corrente smette di fluire.",
    analogia: "Come l'interruttore della luce: aperto buio, chiuso luce",
    errori_comuni: ["resistore di pull-down mancante", "rimbalzo (debounce)", "pin pulsante non collegato a GND"] },
  { vol: 1, cap: 9, pag: 51, titolo: "Cos'è il potenziometro?",
    testo_verbatim: "Il potenziometro è una resistenza variabile a 3 piedini. Ruotando la manopola cambia il valore della resistenza tra il piedino centrale e gli estremi.",
    analogia: "Come il volume della radio: gira di più, più resistenza",
    errori_comuni: ["piedino centrale confuso", "valori massimo/minimo inversi", "lettura analogica fuori range 0-1023"] },
  { vol: 1, cap: 10, pag: 61, titolo: "Cos'è il fotoresistore?",
    testo_verbatim: "Il fotoresistore (LDR — Light Dependent Resistor) cambia resistenza in base alla luce: più luce, meno resistenza.",
    analogia: "Come un occhio elettronico che 'sente' la luce",
    errori_comuni: ["resistore divisore mancante", "soglia luce/buio sbagliata", "polarità non importante (componente passivo)"] },
  { vol: 1, cap: 11, pag: 71, titolo: "Cos'è il cicalino (buzzer)?",
    testo_verbatim: "Il cicalino è un altoparlante piccolo che emette suoni quando lo alimenti. Esiste in due tipi: passivo (genera suono fisso) e attivo (programmabile).",
    analogia: "Come una sveglia in miniatura",
    errori_comuni: ["polarità invertita su buzzer attivi", "frequenza fuori range udibile", "consumo eccessivo se collegato senza resistore"] },
  { vol: 1, cap: 12, pag: 78, titolo: "Cos'è il reed switch?",
    testo_verbatim: "Il reed switch è un interruttore magnetico: si chiude quando un magnete è vicino e si apre quando il magnete si allontana.",
    analogia: "Come la chiusura magnetica di una porta",
    errori_comuni: ["distanza magnete eccessiva", "polarità magnete sbagliata", "interferenze magnetiche ambientali"] },
  { vol: 1, cap: 13, pag: 86, titolo: "Cos'è l'elettropongo?",
    testo_verbatim: "L'elettropongo è una sostanza fatta in casa con acqua, sale e bicarbonato che conduce elettricità. Lo possiamo usare al posto dei fili!",
    analogia: "Come una pasta modellabile che conduce corrente",
    errori_comuni: ["impasto troppo asciutto = no conduzione", "cortocircuito se due pezzi si toccano", "evaporazione acqua dopo qualche giorno"] },
  { vol: 1, cap: 14, pag: 95, titolo: "Costruiamo un Robot!",
    testo_verbatim: "Mettiamo insieme tutto quello che abbiamo imparato: LED, motori, sensori, pulsanti per costruire il nostro primo robot ELAB.",
    analogia: "Il robot è la somma di tutti i componenti che ora conosciamo",
    errori_comuni: ["collegamenti motori invertiti", "alimentazione batteria insufficiente", "logica controllo motori sbagliata"] },

  // ─── VOL.2 MISURE ──────────────────────────────────────────────
  { vol: 2, cap: 3, pag: 13, titolo: "Cos'è un resistore?",
    testo_verbatim: "I resistori limitano la corrente. Hanno un valore in Ohm (Ω) e sono identificati dal codice colori a 4 o 5 fasce.",
    analogia: "Come una strettoia in un tubo dell'acqua: rallenta il flusso",
    errori_comuni: ["lettura codice colori errata", "potenza wattaggio insufficiente", "tolleranza ±5% non considerata"] },
  { vol: 2, cap: 5, pag: 25, titolo: "Cos'è il multimetro?",
    testo_verbatim: "Il multimetro è uno strumento che misura tensione (Volt), corrente (Ampere) e resistenza (Ohm). Per la tensione lo colleghi in parallelo, per la corrente in serie.",
    analogia: "Come un termometro elettronico universale",
    errori_comuni: ["parallelo vs serie confuso", "fondoscala troppo basso", "polarità DC invertita"] },
  { vol: 2, cap: 6, pag: 33, titolo: "Resistenze in serie e parallelo",
    testo_verbatim: "In serie: Rtot = R1 + R2 + R3. In parallelo: 1/Rtot = 1/R1 + 1/R2 + 1/R3 (per N resistenze somma reciproci).",
    analogia: "Serie come fila di strettoie, parallelo come tubi affiancati",
    errori_comuni: ["formula parallelo dimenticata", "calcolo reciproci sbagliato", "polarità non importante per resistori"] },
  { vol: 2, cap: 7, pag: 43, titolo: "Cos'è il condensatore?",
    testo_verbatim: "Il condensatore immagazzina energia elettrica come una piccola batteria temporanea. Si carica e scarica seguendo una curva esponenziale.",
    analogia: "Come un secchio che si riempie e si svuota di acqua",
    errori_comuni: ["polarità elettrolitici invertita = esplosione", "valori capacità µF/nF/pF confusi", "tempo carica RC sottostimato"] },
  { vol: 2, cap: 8, pag: 53, titolo: "Cos'è il MOSFET?",
    testo_verbatim: "Il MOSFET è un interruttore elettronico controllato in tensione: piccola tensione su Gate apre il flusso di corrente Drain→Source.",
    analogia: "Come un rubinetto comandato da un piccolo motore elettrico",
    errori_comuni: ["pin Gate/Drain/Source confusi", "tensione Gate insufficiente per saturazione", "dissipazione termica mancante"] },
  { vol: 2, cap: 9, pag: 63, titolo: "Cos'è il relè?",
    testo_verbatim: "Il relè è un interruttore elettromeccanico: una piccola corrente sulla bobina muove un contatto fisico che apre/chiude un altro circuito.",
    analogia: "Come un campanello: piccolo magnete tira contatto grosso",
    errori_comuni: ["bobina senza diodo flyback = MOSFET bruciato", "tensione bobina sbagliata", "contatti NO/NC/COM confusi"] },
  { vol: 2, cap: 10, pag: 73, titolo: "Motori DC e servomotori",
    testo_verbatim: "I motori DC girano sempre nella stessa direzione (controlli velocità con PWM). I servomotori vanno a posizioni precise (0-180 gradi).",
    analogia: "DC come ventilatore (gira), servo come orologio (posizioni)",
    errori_comuni: ["alimentazione motore da Arduino diretta = bruciato", "polarità motore DC inversa", "PWM frequenza errata per servo"] },
  { vol: 2, cap: 11, pag: 83, titolo: "Diodi e Zener",
    testo_verbatim: "I diodi conducono corrente in un solo verso. Il diodo Zener funziona al contrario per stabilizzare tensione.",
    analogia: "Diodo come valvola unidirezionale, Zener come limitatore tensione",
    errori_comuni: ["polarità anodo/catodo confusa", "Zener usato come diodo normale", "tensione Zener fuori range"] },
  { vol: 2, cap: 12, pag: 95, titolo: "Robot segui-luce",
    testo_verbatim: "Combiniamo fotoresistori + motori DC per costruire un robot che insegue la luce, come una pianta che cerca il sole.",
    analogia: "Come un girasole elettronico",
    errori_comuni: ["taratura soglia luce sbagliata", "motori desincronizzati", "alimentazione insufficiente per 2 motori"] },

  // ─── VOL.3 ARDUINO+SCRATCH ─────────────────────────────────────
  { vol: 3, cap: 5, pag: 23, titolo: "Primo programma Blink",
    testo_verbatim: "Il Blink è il 'Ciao Mondo' di Arduino: facciamo lampeggiare un LED ogni secondo. Pin 13 ha un LED integrato sulla scheda.",
    analogia: "Come imparare a dire 'ciao' in una nuova lingua di programmazione",
    errori_comuni: ["delay() in millisecondi confuso", "pinMode OUTPUT dimenticato", "LED esterno senza resistore"] },
  { vol: 3, cap: 6, pag: 33, titolo: "digitalWrite e i pin digitali",
    testo_verbatim: "digitalWrite(pin, HIGH) accende il pin (5V), digitalWrite(pin, LOW) lo spegne (0V). Funziona solo dopo pinMode(pin, OUTPUT).",
    analogia: "Come l'interruttore della luce: ON o OFF",
    errori_comuni: ["pinMode dimenticato", "pin analogici trattati come digitali", "HIGH/LOW invertiti"] },
  { vol: 3, cap: 7, pag: 47, titolo: "Input pulsanti con digitalRead",
    testo_verbatim: "digitalRead(pin) legge lo stato di un pin: HIGH se 5V, LOW se 0V. Per i pulsanti serve sempre un resistore di pull-up o pull-down.",
    analogia: "Come Arduino che 'sente' se il pulsante è premuto",
    errori_comuni: ["resistore pull confuso (interno vs esterno)", "rimbalzo senza debounce", "INPUT_PULLUP dimenticato"] },
  { vol: 3, cap: 8, pag: 56, titolo: "analogRead e analogWrite",
    testo_verbatim: "analogRead(A0-A5) legge valori 0-1023 dai pin analogici. analogWrite(pin, 0-255) genera segnale PWM sui pin marcati ~.",
    analogia: "analogRead come orecchio che sente volume sfumato, analogWrite come potenziometro elettronico",
    errori_comuni: ["pin PWM ~ vs digital normale", "scala 0-1023 vs 0-255 confusa", "Serial output mancante per debug"] },
  { vol: 3, cap: 9, pag: 65, titolo: "Servo motor",
    testo_verbatim: "Servo.attach(pin) collega il servo, Servo.write(angolo) lo posiziona da 0 a 180 gradi. Alimentazione esterna obbligatoria per più di 1 servo.",
    analogia: "Come un braccio robotico che obbedisce a un comando angolo",
    errori_comuni: ["alimentazione da Arduino = brownout", "pin PWM richiesto", "libreria Servo.h non inclusa"] },
  { vol: 3, cap: 10, pag: 73, titolo: "Buzzer e tone()",
    testo_verbatim: "tone(pin, frequenza, durata) genera suono. Frequenze in Hz: 262=DO, 294=RE, 330=MI, 349=FA, 392=SOL, 440=LA, 494=SI.",
    analogia: "Come un piccolo pianoforte programmabile",
    errori_comuni: ["pin senza buzzer attivo confuso", "frequenze fuori udibile (>20kHz)", "tone() non si interrompe senza noTone()"] },
  { vol: 3, cap: 11, pag: 83, titolo: "Comunicazione Serial",
    testo_verbatim: "Serial.begin(9600) avvia comunicazione USB. Serial.print() / Serial.println() inviano testo al monitor seriale per debug.",
    analogia: "Come una chat tra Arduino e il computer",
    errori_comuni: ["baud rate mismatch", "Serial.begin in setup dimenticato", "monitor seriale chiuso = no output"] },
  { vol: 3, cap: 12, pag: 91, titolo: "Robot Arduino completo",
    testo_verbatim: "Mettiamo tutto insieme: motori + sensori + Arduino + codice = robot autonomo che esplora l'ambiente.",
    analogia: "Il capolavoro che riassume tutto il percorso",
    errori_comuni: ["timing motori non sincrono", "sensori distanza falsi positivi", "alimentazione mista logica/motori"] },
];

/**
 * Lookup citazione per Vol+Cap. Returns null se non trovato.
 */
export function lookupCitazioneByCapitolo(vol: number, cap: number): VolumeCitazione | null {
  return VOLUMI_CITAZIONI_CORE.find(c => c.vol === vol && c.cap === cap) ?? null;
}

/**
 * iter 17 — force inject canonical "Vol.X pag.Y" da QUERY (non solo da response).
 * R-100 evidence iter 14: Q1 LED Vol.1 cap.6 query → response solo "verso giusto + 470 Ohm" no narrative.
 * rewriteCitationToCanonical miss perché response NON contains "Volume X capitolo Y".
 * forceCitationFromQuery detect Vol.X cap.Y in MESSAGE + force append "(Vol.X pag.Y)" se response missing.
 * Wire post-rewriteCitationToCanonical in unlim-chat per coverage 100% Vol/cap-aware queries.
 */
export function forceCitationFromQuery(message: string, response: string): string {
  if (!message || !response || typeof message !== 'string' || typeof response !== 'string') return response;
  // Skip se response already canonical
  if (/Vol\.\s*[1-3]\s+pag\.\s*\d+/i.test(response)) return response;
  // Detect Vol.X cap.Y in MESSAGE (query)
  const m = message.match(/\b(?:vol(?:ume)?\.?\s*)([1-3])[,\s]+(?:cap(?:itolo)?\.?\s*)(\d{1,2})\b/i);
  if (!m) return response;
  const vol = parseInt(m[1], 10);
  const cap = parseInt(m[2], 10);
  const c = VOLUMI_CITAZIONI_CORE.find(x => x.vol === vol && x.cap === cap);
  if (!c) return response;
  // Append canonical inline at first sentence boundary
  const canonical = `(Vol.${c.vol} pag.${c.pag})`;
  const idx = response.search(/[.\n]/);
  if (idx === -1) return `${response} ${canonical}`;
  return `${response.slice(0, idx + 1)} ${canonical}${response.slice(idx + 1)}`;
}

/**
 * iter 20 P0 — force inject canonical "Vol.X pag.Y" da SESSION CONTEXT (lastExperimentId).
 * Iter 19 stress 100q B Memoria 9/15 = 60% fail short-prompt recall ("Continuiamo", "Pin?", "Componente?").
 * forceCitationFromQuery (iter 17) checks ONLY message → short prompt no Vol/cap → no force inject.
 * forceCitationFromSession check studentContext.lastExperimentId → force inject from session memory.
 * Wire post forceCitationFromQuery in unlim-chat/index.ts step 6a.
 */
export function forceCitationFromSession(
  lastExperimentId: string | null | undefined,
  response: string,
): string {
  if (!lastExperimentId || !response || typeof response !== 'string') return response;
  // Skip se response already canonical
  if (/Vol\.\s*[1-3]\s+pag\.\s*\d+/i.test(response)) return response;
  // Extract Vol + cap from lastExperimentId (v1-cap6-esp1 → vol=1 cap=6)
  const m = lastExperimentId.match(/^v([1-3])-cap(\d{1,2})/i);
  if (!m) return response;
  const vol = parseInt(m[1], 10);
  const cap = parseInt(m[2], 10);
  const c = VOLUMI_CITAZIONI_CORE.find(x => x.vol === vol && x.cap === cap);
  if (!c) return response;
  // Append canonical citation at first sentence boundary
  const canonical = `(Vol.${c.vol} pag.${c.pag})`;
  const idx = response.search(/[.\n]/);
  if (idx === -1) return `${response} ${canonical}`;
  return `${response.slice(0, idx + 1)} ${canonical}${response.slice(idx + 1)}`;
}

/**
 * iter 15 — rewriter post-LLM narrative form → canonical "Vol.X pag.Y".
 * R-100 evidence iter 14: LLM cita "Volume 1 capitolo 6" / "il capitolo 5 del Volume 3"
 * (narrative form) MA NON "Vol.X pag.Y" canonical. citation_strict 0/89.
 *
 * Detect narrative patterns + append canonical "(Vol.X pag.Y)" via lookup.
 * Idempotent — running twice doesn't double-append.
 */
export function rewriteCitationToCanonical(text: string): string {
  if (!text || typeof text !== 'string') return text;
  // Already has canonical → skip
  if (/Vol\.\s*[1-3]\s+pag\.\s*\d+/i.test(text)) return text;

  // Pattern A: "Volume X capitolo Y" / "Volume X, Capitolo Y" / "Vol.X cap.Y" / "Vol X cap Y" / "Nel Volume X, Capitolo Y"
  // iter 16 — accetta virgola intermedia + flessibile spazio
  const m1 = text.match(/\b(?:vol(?:ume)?\.?\s*)([1-3])[,\s]+(?:cap(?:itolo)?\.?\s*)(\d{1,2})\b/i);
  // Pattern B: "il capitolo Y del Volume X" / "capitolo Y, Volume X"
  const m2 = text.match(/\b(?:il\s+)?capitolo\s+(\d{1,2})[,\s]+(?:del\s+)?(?:vol(?:ume)?\.?\s*)([1-3])\b/i);
  // Pattern C: "Vol.X" or "Volume X" alone (no cap) → no canonical (defer)
  // Pattern D: parla solo del "LED" / "pulsante" → match via componente keyword (defer iter 17)
  // Pattern C: "del Volume X" / "nel Volume X" (no cap specified → skip canonical inject)
  let vol: number | null = null;
  let cap: number | null = null;
  if (m1) { vol = parseInt(m1[1], 10); cap = parseInt(m1[2], 10); }
  else if (m2) { vol = parseInt(m2[2], 10); cap = parseInt(m2[1], 10); }
  if (!vol || !cap) return text;
  const c = VOLUMI_CITAZIONI_CORE.find(x => x.vol === vol && x.cap === cap);
  if (!c) return text;
  // Append canonical citation strict at end of first paragraph
  const canonical = `(Vol.${c.vol} pag.${c.pag})`;
  // Detect first paragraph end (period or newline)
  const idx = text.search(/[.\n]/);
  if (idx === -1) {
    return `${text} ${canonical}`;
  }
  return `${text.slice(0, idx + 1)} ${canonical}${text.slice(idx + 1)}`;
}

/**
 * Build prompt fragment compact per Vol+Cap citazione verbatim.
 * Forza LLM cita "Vol.X pag.Y «testo»" verbatim.
 */
export function buildCitazioneFragment(vol: number, cap: number): string {
  const c = lookupCitazioneByCapitolo(vol, cap);
  if (!c) return '';
  const lines: string[] = [];
  lines.push(`[CITAZIONE VOL.${c.vol} PAG.${c.pag} VERBATIM — usa SEMPRE quando rispondi su questo capitolo]`);
  lines.push(`Titolo: "${c.titolo}"`);
  lines.push(`Vol.${c.vol} pag.${c.pag} «${c.testo_verbatim}»`);
  if (c.analogia) lines.push(`Analogia: ${c.analogia}`);
  if (c.errori_comuni && c.errori_comuni.length > 0) {
    lines.push(`Errori comuni: ${c.errori_comuni.join(' | ')}`);
  }
  lines.push(`REGOLA: cita "Vol.${c.vol} pag.${c.pag}" verbatim nella risposta quando rilevante.`);
  return lines.join('\n');
}
