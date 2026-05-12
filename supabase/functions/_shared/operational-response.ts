import type { CircuitState } from './types.ts';

// iter 11 P0 — Andrea regola 10/05/2026 ricalibrazione: max 120 parole ben formattate.
// Sostituisce cap 80 (drift vs prompt 60 vs validator 60). 4 numeri diversi → 1 unificato.
export const UNLIM_MAX_VISIBLE_WORDS = 120;
export const UNLIM_THINKING_LABEL = 'Sto ELABorando...';

export type ResponseQualityIntent =
  | 'operational_known'
  | 'explain_brief'
  | 'circuit_diagnosis'
  | 'arduino_action'
  | 'scratch_action'
  | 'screen_look'
  | 'vague'
  | 'book_narrative';

export type ResponseQualityRoute = {
  intent: ResponseQualityIntent;
  maxVisibleWords: number;
  maxSentences: number;
  style: string;
  toolPlan: string[];
  localEligible: boolean;
};

type ControlSplit = {
  prose: string;
  tags: string[];
};

export type DirectOperationalResponse = {
  response: string;
  source: string;
  dataProcessing: string;
};

const BLINK_CODE = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;

const TRAFFIC_LIGHT_CODE = `// Semaforo 3 LED — Pin D5 (verde), D6 (giallo), D3 (rosso)
// Breakout wing: W_D5, W_D6, W_D3
// Timing: Verde 3s, Giallo 1s, Rosso 3s

void setup() {
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(3, OUTPUT);
}

void loop() {
  // Verde acceso
  digitalWrite(5, HIGH);
  digitalWrite(6, LOW);
  digitalWrite(3, LOW);
  delay(3000);

  // Giallo acceso
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  digitalWrite(3, LOW);
  delay(1000);

  // Rosso acceso
  digitalWrite(5, LOW);
  digitalWrite(6, LOW);
  digitalWrite(3, HIGH);
  delay(3000);
}`;

const SCRATCH_BLINK_WORKSPACE = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

function startsWithAt(text: string, index: number, prefix: string): boolean {
  return text.slice(index, index + prefix.length).toLowerCase() === prefix.toLowerCase();
}

function findIntentTagEnd(text: string, start: number): number {
  const jsonStart = text.indexOf('{', start);
  if (jsonStart === -1) return -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = jsonStart; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.indexOf(']', i);
      }
    }
  }
  return -1;
}

export function splitControlTags(text: string): ControlSplit {
  const source = String(text || '');
  const tags: string[] = [];
  let prose = '';
  let i = 0;

  while (i < source.length) {
    if (startsWithAt(source, i, '[AZIONE:')) {
      const end = source.indexOf(']', i);
      if (end !== -1) {
        tags.push(source.slice(i, end + 1));
        i = end + 1;
        continue;
      }
    }
    if (startsWithAt(source, i, '[INTENT:{')) {
      const end = findIntentTagEnd(source, i);
      if (end !== -1) {
        tags.push(source.slice(i, end + 1));
        i = end + 1;
        continue;
      }
    }
    prose += source[i];
    i++;
  }

  return { prose: prose.replace(/\s+/g, ' ').trim(), tags };
}

export function capWordsPreservingControlTags(text: string, maxWords = UNLIM_MAX_VISIBLE_WORDS): string {
  const { prose, tags } = splitControlTags(text);
  const words = prose.split(/\s+/).filter(Boolean);
  const cappedProse = words.length <= maxWords
    ? prose
    : `${words.slice(0, maxWords).join(' ')}...`;
  return [cappedProse, ...tags].filter(Boolean).join(' ').trim();
}

export function visibleWordCount(text: string): number {
  const { prose } = splitControlTags(text);
  return prose.split(/\s+/).filter(Boolean).length;
}

export function visibleSentenceCount(text: string): number {
  const { prose } = splitControlTags(text);
  const normalized = prose.replace(/\b(?:D13|GND|pin)\b/gi, '').trim();
  if (!normalized) return 0;
  return normalized.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).length;
}

function route(
  intent: ResponseQualityIntent,
  maxVisibleWords: number,
  maxSentences: number,
  style: string,
  toolPlan: string[],
  localEligible = false,
): ResponseQualityRoute {
  return { intent, maxVisibleWords, maxSentences, style, toolPlan, localEligible };
}

export function classifyResponseQualityIntent(
  message: string,
  circuitState?: CircuitState | null,
): ResponseQualityRoute {
  const text = String(message || '').toLowerCase();
  const hasErrors = (circuitState?.errors?.length ?? 0) > 0;

  if (/\b(scratch|blocchi|blocchett\w*|blockly)\b/i.test(text)) {
    return route('scratch_action', 42, 2, 'naturale, operativo, breve, vivo', ['openeditor', 'switcheditor:scratch', 'loadblocks?'], true);
  }
  if (/\b(arduino|codice|sketch|blink|lampegg|compila|compilare|carica programma)\b/i.test(text)) {
    return route('arduino_action', 45, 2, 'naturale, operativo, breve, vivo', ['openeditor', 'switcheditor:arduino', 'setcode?', 'compile?'], true);
  }
  if (/\b(guarda|screenshot|schermo|schermata|foto|immagine|vedi|osserva)\b/i.test(text)) {
    return route('screen_look', 35, 2, 'naturale, operativo, breve, vivo', ['captureScreenshot', 'vision'], false);
  }
  if (hasErrors || /\b(non si accende|non va|non funziona|errore|sbagliato|come mai|perch[eé].*cos[iì]|diagnos)\b/i.test(text)) {
    return route('circuit_diagnosis', 65, 3, 'naturale, operativo, breve, vivo', ['getCircuitState', 'highlight', 'diagnose'], hasErrors);
  }
  if (/\b(fai tu|aiuto|panico|non so|boh|parti tu|decidi tu)\b/i.test(text)) {
    return route('vague', 35, 3, 'naturale, operativo, breve, vivo', ['ask_one_choice_or_start_safe'], true);
  }
  if (/\b(racconta|storia|libro|volume|esperimento|lezione|narra)\b/i.test(text)) {
    return route('book_narrative', 70, 4, 'naturale, narrativo, breve, vivo', ['use_system_volume_pack', 'micro_anchor_only_if_asked'], false);
  }
  if (/\b(spiega|breve|cos[eè]|come funziona|fammi capire|differenza)\b/i.test(text)) {
    return route('explain_brief', 55, 3, 'naturale, breve, vivo', ['answer_from_system_volume_pack'], false);
  }
  if (/\b(avvia|play|ferma|stop|reset|pulisci|evidenzia|mostra|collega|monta|costruisci|aggiungi)\b/i.test(text)) {
    return route('operational_known', 45, 2, 'naturale, operativo, breve, vivo', ['execute_known_action', 'verify'], true);
  }
  return route('vague', 35, 3, 'naturale, operativo, breve, vivo', ['ask_one_choice_or_start_safe'], true);
}

function componentIdsForError(circuitState?: CircuitState | null): string {
  const ids = new Set<string>();
  const text = [
    circuitState?.text,
    ...(circuitState?.errors || []),
    ...(circuitState?.components || []).map(c => `${c.id} ${c.type} ${c.state || ''}`),
  ].filter(Boolean).join(' ').toLowerCase();

  for (const id of ['led2', 'r2', 'led1', 'r1', 'nano', 'buzzer', 'btn1']) {
    if (text.includes(id)) ids.add(id);
  }
  if (ids.size === 0) {
    const off = (circuitState?.components || []).find(c => /off|spento|error|errore/i.test(String(c.state || '')));
    if (off?.id) ids.add(off.id);
  }
  return Array.from(ids).slice(0, 3).join(',');
}

export function buildDirectOperationalResponse(
  message: string,
  circuitState?: CircuitState | null,
): DirectOperationalResponse | null {
  const text = String(message || '').toLowerCase();
  const hasErrors = (circuitState?.errors?.length ?? 0) > 0;
  const qualityRoute = classifyResponseQualityIntent(message, circuitState);
  const explicitVagueRequest = /\b(fai tu|aiuto|panico|non so|boh|parti tu|decidi tu)\b/i.test(text);

  // Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea test matrix evidence:
  // play/pause/compile/screenshot/highlight comandi semplici NON intercettati
  // pre-LLM. LLM Vertex risponde con diagnosi invece di dispatch action.
  // Pre-LLM detector dispatch INTENT/AZIONE diretto per comandi canonici corti.
  const isPlay = /^(fallo partire|fai partire|vai|via|parti|start|avvia|play|partit?o|partit?e|partiamo|avviamo|inizia(?:mo)?)$|\b(fallo partire|fai partire|premi play|avvia(?:la|lo)?\s|click(?:a)? play|inizia(?:mo)? la simulazione)\b/i.test(text);
  if (isPlay) {
    return {
      source: 'direct-operational-play',
      dataProcessing: 'local-direct',
      response: 'Ragazzi, avvio la simulazione del circuito. [AZIONE:play]',
    };
  }
  const isPause = /^(stop|ferma|pausa|pause|interrompi|spegni)$|\b(ferma(?:te)?\s+la\s+simulazione|metti(?:te)?\s+in\s+pausa|spegni(?:amo|ete)?\s+il\s+circuito)\b/i.test(text);
  if (isPause) {
    return {
      source: 'direct-operational-pause',
      dataProcessing: 'local-direct',
      response: 'Ragazzi, fermo la simulazione. [AZIONE:pause]',
    };
  }
  const isCompile = /^(compila|compile|verifica codice|build)$|\b(compila(?:te|re)?\s+(?:il\s+)?codice|prova(?:te|re)?\s+(?:il\s+)?codice|verifica(?:te|re)?\s+il\s+codice)\b/i.test(text);
  if (isCompile) {
    return {
      source: 'direct-operational-compile',
      dataProcessing: 'local-direct',
      response: 'Ragazzi, compilo il codice e preparo il programma per Arduino. [AZIONE:compile]',
    };
  }
  const isScreenshot = /\b(cattura(?:te|re)?|scatta(?:te)?|fai\s+(?:una\s+)?foto|fotograf(?:a|ate|are)|screenshot|catturate?\s+(?:lo\s+)?schermo)\b.*\b(circuito|schermo|breadboard|lavagna)?\b/i.test(text) && !/\b(cosa|come|spieg)\b/i.test(text);
  if (isScreenshot) {
    return {
      source: 'direct-operational-screenshot',
      dataProcessing: 'local-direct',
      response: 'Ragazzi, scatto una foto del circuito da analizzare. [INTENT:{"tool":"captureScreenshot","args":{}}]',
    };
  }
  // Iter 41 Sprint U Cycle 2 — experiment-name nav detector (precedence over highlight).
  const expNamePatterns: Array<{ re: RegExp; id: string; title: string }> = [
    { re: /\bsemaforo\b/i, id: 'v3-cap6-semaforo', title: 'semaforo' },
    { re: /\bled\s*rgb\b/i, id: 'v1-cap9-esp6', title: 'LED RGB' },
    { re: /\bservo(?:motore)?\b/i, id: 'v3-cap7-servo-sweep', title: 'servomotore' },
    { re: /\blcd\b/i, id: 'v3-cap7-lcd-hello', title: 'LCD' },
    { re: /\bbuzzer\b/i, id: 'v3-cap7-buzzer-melody', title: 'buzzer melodia' },
    { re: /\bblink\b/i, id: 'v3-cap5-blink', title: 'Blink LED' },
    { re: /\bmorse\b/i, id: 'v3-cap6-morse', title: 'codice Morse' },
    { re: /\bsimon\b/i, id: 'v3-cap8-simon', title: 'Simon' },
  ];
  const expNavTrigger = /\b(carica|caricate|caricare|portami|porta(?:te)?ci|mostra(?:te|mi|re)?|apri|aprite|aprire|vai|andiamo|passa|inizia(?:mo)?|giochiamo|facciamo|prova(?:te|re)?|voglio\s+(?:fare|provare|giocare)|vorrei\s+(?:fare|provare)|proviamo|facciamo|fammi\s+fare|partiamo)\b.*\b(esperimento|esercizio|lezione|capitolo|gioco)?\b/i.test(text)
    || /\b(esperimento|gioco)\b/i.test(text);
  if (expNavTrigger || /\bl[''']?\s*esperimento\b/i.test(text)) {
    for (const { re, id, title } of expNamePatterns) {
      if (re.test(text)) {
        return {
          source: 'direct-operational-experiment-nav',
          dataProcessing: 'local-direct',
          response: `Ragazzi, apriamo l'esperimento del ${title} sul kit ELAB. [INTENT:{"tool":"mountExperiment","args":{"id":"${id}"}}]`,
        };
      }
    }
  }

  const isHighlight = (/\b(evidenz(?:ia|iate|iare)|mostr(?:a|ate|ami|are)|illumina(?:te|re)?|sottolinea(?:te|re)?|fammi\s+vedere)\b.*\b(led|resist(?:ore|enza)|breadboard|pulsante|buzzer|nano|arduino|d13|pin\s*\d+|componente|r\d+|btn\d+|bat\d+|led\d+|bb\d+)\b/i.exec(text)
    || /\b(evidenz(?:ia|iate|iare))\b\s+(r\d+|led\d+|btn\d+|bat\d+|bb\d+|nano)\b/i.exec(text))
    && !/\b(esperimento|esercizio|lezione|capitolo)\b/i.test(text);
  if (isHighlight) {
    const componentText = text.match(/\b(led1?|led2|r1|r2|btn1|buzzer|nano|breadboard)\b/i)?.[0]?.toLowerCase() || 'led1';
    const compId = componentText === 'led' ? 'led1' : componentText === 'r' ? 'r1' : componentText;
    return {
      source: 'direct-operational-highlight',
      dataProcessing: 'local-direct',
      response: `Ragazzi, evidenzio ${compId} sulla breadboard. [INTENT:{"tool":"highlightComponent","args":{"ids":["${compId}"]}}]`,
    };
  }

  // Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea test matrix evidence:
  // "imposta la resistenza a 470" → LLM testuale invece di INTENT canonico.
  const resistanceMatch = /\b(imposta(?:te)?|setta(?:te)?|cambia(?:te)?|metti(?:te)?|fai)\b.*\b(resist(?:enza|ore)|R\d+)\b.*?(\d+)\s*(ohm|Ω|k|kΩ|kohm)?\b/i.exec(text);
  if (resistanceMatch) {
    let value = parseInt(resistanceMatch[3], 10);
    const unit = (resistanceMatch[4] || '').toLowerCase();
    if (unit.startsWith('k')) value = value * 1000;
    const rId = (text.match(/\br\d+\b/i)?.[0] || 'r1').toLowerCase();
    return {
      source: 'direct-operational-resistance',
      dataProcessing: 'local-direct',
      response: `Ragazzi, imposto ${rId.toUpperCase()} a ${value}Ω. [INTENT:{"tool":"setComponentValue","args":{"id":"${rId}","field":"resistance","value":${value}}}]`,
    };
  }

  // Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea screenshot evidence:
  // "portami al volume 2" → LLM rispondeva spiegazione invece navigazione.
  // Pre-LLM detector dispatch INTENT mountExperiment con primo esp volume target.
  const volumeNavMatch = /\b(portami|portateci|portateli|portate?ci|vai|andate|andiamo|apri|aprite|aprire|carica|caricate|caricare|mostra|mostrate|mostrami|mostrare|passa|passate|vado|voglio\s+(?:andare|fare|vedere)|vorrei|prendiamo|partiamo)\b.*\bvolume\s*([123])\b/i.exec(text)
    || /\bvolume\s*([123])\b.*\b(grazie|apri|aprite|carica|caricate|adesso|ora|subito|adesso|please|per\s+favore)\b/i.exec(text)
    || /^volume\s*([123])\s*$/i.exec(text);
  if (volumeNavMatch) {
    const volN = (volumeNavMatch[2] || volumeNavMatch[1] || '').match(/[123]/)?.[0];
    if (volN === '1' || volN === '2' || volN === '3') {
      const firstEspByVol: Record<string, string> = {
        '1': 'v1-cap6-esp1',
        '2': 'v2-cap3-esp1',
        '3': 'v3-cap5-esp1',
      };
      const expId = firstEspByVol[volN];
      const volTitleByVol: Record<string, string> = {
        '1': 'Volume 1 — Le Basi',
        '2': 'Volume 2 — Approfondiamo',
        '3': 'Volume 3 — Arduino',
      };
      return {
        source: 'direct-operational-volume-nav',
        dataProcessing: 'local-direct',
        response: `Ragazzi, apriamo il ${volTitleByVol[volN]} sul kit ELAB. Cominciamo dal primo esperimento. [INTENT:{"tool":"mountExperiment","args":{"id":"${expId}"}}]`,
      };
    }
  }

  // Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea screenshot evidence:
  // LLM ricostruiva intero circuito con addcomponent tags invece di
  // modificare LED esistente. Pre-LLM detector dispatch INTENT
  // setComponentValue color quando componente gia presente in circuitState.
  const colorChangeMatch = /\b(metti|cambia|imposta|setta|fai|trasforma|porta|rendi|fammi)\b.*\bled\b.*\b(rosso|verde|blu|giallo|bianco|arancione|viola|red|green|blue|yellow|white|orange|purple)\b/i.exec(text)
    || /\bled\b.*\b(deve\s+(?:essere|diventare)|sia)\s+(rosso|verde|blu|giallo|bianco|arancione|viola)\b/i.exec(text)
    || /\b(rosso|verde|blu|giallo|bianco|arancione|viola)\b\s+(?:per\s+)?(?:il\s+|un\s+|al\s+)?\bled\b/i.exec(text);
  if (colorChangeMatch && (circuitState?.components || []).some(c => /led/i.test(c.type || ''))) {
    const colorMap: Record<string, string> = {
      rosso: 'red', verde: 'green', blu: 'blue', giallo: 'yellow',
      bianco: 'white', arancione: 'orange', viola: 'purple',
      red: 'red', green: 'green', blue: 'blue', yellow: 'yellow',
      white: 'white', orange: 'orange', purple: 'purple',
    };
    const colorIt = colorChangeMatch[2].toLowerCase();
    const colorEn = colorMap[colorIt] || colorIt;
    const ledComp = (circuitState?.components || []).find(c => /led/i.test(c.type || ''));
    const ledId = ledComp?.id || 'led1';
    return {
      source: 'direct-operational-led-color',
      dataProcessing: 'local-direct',
      response: `Ragazzi, cambio il LED a ${colorIt}. [INTENT:{"tool":"setComponentValue","args":{"id":"${ledId}","field":"color","value":"${colorEn}"}}]`,
    };
  }

  if (/\b(report|fumetto|riassunto)\b.*\b(sessione|lezione|quello che abbiamo fatto|oggi)\b|\b(sessione|lezione)\b.*\b(report|fumetto)\b/i.test(text)) {
    return {
      source: 'direct-operational-report-comic',
      dataProcessing: 'local-direct',
      response: [
        'Avvio il report fumetto della sessione e apro l\'anteprima verificabile.',
        'Lo dichiaro pronto solo se il generatore risponde.',
        '[AZIONE:exportfumetto:pdf]',
      ].join(' '),
    };
  }

  if (/\b(scratch|blocchi|blocchett\w*|blockly)\b/i.test(text)) {
    const wantsWorkspace = /\b(carica|crea|prepara|metti|lampegg\w*|blink)\b/i.test(text);
    const tags = [
      '[AZIONE:openeditor]',
      '[AZIONE:switcheditor:scratch]',
      wantsWorkspace ? `[AZIONE:loadblocks:${SCRATCH_BLINK_WORKSPACE}]` : '',
    ].filter(Boolean).join(' ');
    return {
      source: 'direct-operational-scratch',
      dataProcessing: 'local-direct',
      response: [
        'Apro subito l\'editor a blocchi Scratch.',
        wantsWorkspace
          ? 'Carico il blink: pin 13 in uscita, ripeti, accendi, aspetta, spegni, aspetta.'
          : 'Poi montiamo i blocchi di ripetizione e accensione sul pin giusto.',
        tags,
      ].join(' '),
    };
  }

  const wantsCircuitMount = (
    /\b(monta|costruisci|collega|cabla)\b.*\b(circuito|led|resistenz|resistor|d13|pin 13|gnd|nano|arduino)\b/i.test(text)
    || /\b(crea|prepara|aggiungi)\b.*\bcircuito\b.*\b(led|resistenz|resistor|d13|pin 13|gnd|nano|arduino)\b/i.test(text)
  );

  // 2026-05-10 fix: don't short-circuit knowledge queries to direct-operational.
  // Live prod probe P4 "Cosa fa la funzione pinMode in Arduino Vol.3 cap.6?"
  // matched arduino keyword → returned "Passo ad Arduino e preparo Blink sul pin 13"
  // instead of explaining pinMode. Knowledge-style queries (cosa fa, spiegami,
  // descrivi, definisci, come funziona, perche) must fall through to LLM with
  // volume profile so UNLIM can teach the concept.
  // Note: no trailing \b (è is not in \w so \b after è does not match in JS regex without u flag)
  const isKnowledgeQuery = /(?:^|[\s.,;:!?'"])(cosa\s+(?:fa|sono|significa|vuol\s+dire)|spiega(?:mi|te)?|descriv(?:i|ete|imi)|definisc(?:i|imi|e)|come\s+funziona|cos['’]?\s*[eè]|qual\s*['’]?\s*[eè])/i.test(text);
  if (!wantsCircuitMount && !isKnowledgeQuery && /\b(arduino|codice|sketch|blink|lampegg|compila|compilare|carica programma)\b/i.test(text)) {
    const negatesTrafficLight = /\b(senza|non)\s+(?:il\s+)?semaforo\b/i.test(text);
    const wantsTrafficLight = !negatesTrafficLight && /\b(semaforo|rosso|giallo|verde|traffic)\b/i.test(text);
    const wantsCompile = /\b(compila|compilare|carica|prova|esegui|upload|blink|lampegg)\b/i.test(text);
    const code = wantsTrafficLight ? TRAFFIC_LIGHT_CODE : BLINK_CODE;
    const tags = [
      wantsTrafficLight ? '[AZIONE:loadexp:v3-cap6-semaforo]' : '',
      '[AZIONE:openeditor]',
      '[AZIONE:switcheditor:arduino]',
      (wantsTrafficLight || /\b(blink|lampegg\w*|metti|scrivi|prepara|fammi)\b/i.test(text)) ? `[AZIONE:setcode:${code}]` : '',
      wantsCompile ? '[AZIONE:compile]' : '',
    ].filter(Boolean).join(' ');
    return {
      source: 'direct-operational-arduino',
      dataProcessing: 'local-direct',
      response: [
        // iter 23 P1 fix — add Vol/pag canonical inline (iter 22 stress evidence Cat A regression -23.7pp).
        // Arduino default → Vol.3 cap.5 Blink (semaforo Vol.1 cap.8). Plurale "Ragazzi" opener.
        wantsTrafficLight
          ? 'Ragazzi, passo ad Arduino e preparo il semaforo a tre LED (Vol.1 pag.43).'
          : 'Ragazzi, passo ad Arduino e preparo Blink sul pin 13 (Vol.3 pag.23).',
        'Compilo subito; se fallisce, guardiamo la riga esatta sul kit ELAB.',
        tags,
      ].join(' '),
    };
  }

  if (/\b(come mai|perch[eé]|cambiato|cosa.*succed|fa cos[iì]|strano|non va|non funziona|non si accende|aiuto|sbagliato|errore)\b/i.test(text) && hasErrors) {
    const ids = componentIdsForError(circuitState);
    const firstError = circuitState?.errors?.[0] || 'il circuito non ha un percorso chiuso';
    return {
      source: 'direct-operational-diagnosis',
      dataProcessing: 'local-direct',
      response: [
        `Ci sono: ${firstError}.`,
        'La corrente non trova piu una strada chiusa.',
        'Evidenzio i punti sospetti e richiudiamo il giro sul kit ELAB.',
        ids ? `[AZIONE:highlight:${ids}] [AZIONE:diagnose]` : '[AZIONE:diagnose]',
      ].join(' '),
    };
  }

  if (qualityRoute.intent === 'vague' && explicitVagueRequest) {
    return {
      source: 'direct-quality-vague',
      dataProcessing: 'local-direct',
      response: 'Ci sono. Parto dal gesto piu sicuro: guardiamo LED, resistore e alimentazione, poi scegliamo se montare, correggere o spiegare in 30 secondi.',
    };
  }

  if (wantsCircuitMount) {
    return {
      source: 'direct-operational-led-mount',
      dataProcessing: 'local-direct',
      response: [
        'Monto il circuito LED base: D13, resistore, LED e ritorno a GND.',
        'Lo verifico: se un filo non entra davvero, non lo dichiaro fatto.',
        '[AZIONE:loadexp:v1-cap6-esp1] [AZIONE:addwire:nano:D13:r1:pin1] [AZIONE:addwire:r1:pin2:led1:anode] [AZIONE:addwire:led1:cathode:nano:GND] [AZIONE:highlightpin:nano:D13,nano:GND] [AZIONE:diagnose]',
      ].join(' '),
    };
  }

  if (/\b(aggiung|metti|crea|monta).*\bled\b.*\bparallelo\b/i.test(text)) {
    return {
      source: 'direct-operational-parallel-led',
      dataProcessing: 'local-direct',
      response: [
        'Preparo un secondo ramo in parallelo: LED e resistore dedicato.',
        'Evidenzio il punto di lavoro; poi chiudiamo positivo e ritorno sul kit ELAB.',
        '[AZIONE:addcomponent:led:360:150] [AZIONE:addcomponent:resistor:360:210] [AZIONE:highlight:led2,r2]',
      ].join(' '),
    };
  }

  return null;
}
