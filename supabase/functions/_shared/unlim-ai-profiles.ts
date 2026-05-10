import type { CircuitState, SimulatorContext } from './types.ts';

export type UnlimMode =
  | 'percorso'
  | 'passopasso'
  | 'montato'
  | 'libero'
  | 'controllo'
  | 'generale'
  | 'vision'
  | 'volume1'
  | 'volume2'
  | 'volume3';

export type UnlimProfileDepth = 'total' | 'compact';

export type UnlimAiProfileId =
  | 'knowledge_total'
  | 'general_purpose_compact'
  | 'control_total'
  | 'control_compact'
  | 'pixtral_total'
  | 'pixtral_essential'
  | 'volume1_fast'
  | 'volume1_deep'
  | 'volume2_fast'
  | 'volume2_deep'
  | 'volume3_fast'
  | 'volume3_deep'
  | `${UnlimMode}_total`
  | `${UnlimMode}_compact`;

export type UnlimAiProfile = {
  id: UnlimAiProfileId;
  mode: UnlimMode;
  depth: UnlimProfileDepth;
  role: string;
  contextBudget: 'full' | 'compressed';
  visionProvider: 'auto' | 'pixtral';
  canCaptureScreenshot: boolean;
  maxVisibleWords: number;
  promptBlock: string;
  volume?: 1 | 2 | 3 | null;
};

export type SelectUnlimAiProfileOptions = {
  hasImages?: boolean;
  requestedProfile?: string | null;
  requestedDepth?: UnlimProfileDepth | null;
  experimentId?: string | null;
  simulatorContext?: SimulatorContext | Record<string, unknown> | null;
  circuitState?: CircuitState | null;
};

const ELAB_STYLE_BLOCK = [
  'LINGUAGGIO ELAB:',
  '- Italiano naturale da tutor vivo in classe, non da chatbot.',
  '- Risposte brevi: 1-4 frasi, operative, con parole concrete.',
  '- Analogie o metafore solo quando accendono davvero il concetto: corrente=acqua, resistore=strettoia, LED=porta a senso unico, Arduino=regista.',
  '- Niente "ottima domanda", "certamente", "in base al contesto fornito".',
  '- Niente citazioni automatiche: Vol./pag. solo come micro-ancora utile o se richiesta.',
].join('\n');

export const UNLIM_SOFTWARE_KNOWLEDGE_PACK = [
  'CONOSCENZA SOFTWARE ELAB:',
  '- Lavagna: ambiente principale LIM con chat UNLIM, simulatore, manuale, video, taccuini, modalita percorso/passopasso/gia montato/libero.',
  '- Percorso: guida narrativa del capitolo; deve mantenere continuita esperimento precedente -> esperimento attivo -> prossimo gesto.',
  '- Passo Passo: lo studente/docente vede step, BOM e circuito guidato; UNLIM deve dire il prossimo gesto, non fare teoria lunga.',
  '- Gia Montato: il circuito e pronto; UNLIM deve far osservare, variare, misurare, diagnosticare e verificare.',
  '- Libero: sandbox operativa; UNLIM puo montare, collegare, evidenziare, aprire editor, compilare, usare Scratch/Arduino.',
  '- Simulatore: componenti, fili, stato running/stopped, errori, pin, descrizione circuito, highlight, screenshot.',
  '- Editor Arduino: openeditor, switcheditor:arduino, setcode, compile, lettura errore; non aspettare LLM per blink/semaforo noti.',
  '- Editor Scratch: switcheditor:scratch, loadblocks XML, blocchi per pin 13, forever, digital write, delay.',
  '- Visione: se l utente dice guarda/controlla/screenshot/schermo/lavagna/circuito, cattura screenshot e usa Pixtral quando serve leggere lo schermo.',
  '- Verifica azioni: se il tool non conferma, non dire fatto; messaggio breve e onesto.',
].join('\n');

export const UNLIM_VOLUME_1_KNOWLEDGE_PACK = [
  'VOL1 - ESPERTO VOLUME 1 - BASI E COMPONENTI REALI:',
  '- Missione: far capire circuiti fisici con batteria, breadboard, fili, resistore, LED e primi sensori senza teoria pesante.',
  '- Cap.6 LED: primo circuito, polarita anodo/catodo, resistore in serie, LED bruciato se manca protezione, luminosita legata alla resistenza.',
  '- Cap.7 LED RGB: tre LED interni rosso/verde/blu, mescolanza colori, comune, resistori per bilanciare luminosita.',
  '- Cap.8 pulsante: chiude il circuito quando premuto, controllo LED/RGB, differenza tra circuito aperto e chiuso.',
  '- Cap.9 potenziometro: resistore variabile, verso invertibile scambiando pin laterali, dimmer e controllo colore.',
  '- Cap.10 fotoresistore: luce -> resistenza cambia, partitore, lampada automatica, soglia luce/ombra.',
  '- Cap.11 cicalino: polarita, suono base, pulsante che abilita il suono.',
  '- Cap.12 reed magnetico: interruttore senza contatto, allarmi porta e attivazioni magnetiche.',
  '- Cap.13 elettropongo: circuiti creativi conduttivi, LED e arte.',
  '- Cap.14 robot base: progetto finale con breadboard, resistenze e LED.',
].join('\n');

// 2026-05-10 — capitoli numerati per allineamento con V1 pack (TRES JOLIE audit fix).
// Nota: "Rele" precedente NON è capitolo autonomo nel PDF Vol2 (rimosso).
// Ordine PDF Vol2 cartaceo: Cap.3 Multimetro -> Cap.4 Resistenze -> Cap.5 Batterie ->
// Cap.6 LED avanzati -> Cap.7 Condensatore -> Cap.8 Transistor -> Cap.9 Rele
// (NB: rele è cap.9 effettivo, non capitolo "autonomo") -> Cap.10 Motori ->
// Cap.11 Diodi -> Cap.12 Robot marciante (segui luce).
export const UNLIM_VOLUME_2_KNOWLEDGE_PACK = [
  'VOL2 - ESPERTO VOLUME 2 - MISURE, ENERGIA E COMPONENTI INTERMEDI:',
  '- Missione: collegare cio che si vede sul circuito con misure reali, corrente, tensione, resistenza equivalente e comportamento dinamico.',
  '- Cap.3 Multimetro: tensione in parallelo, corrente in serie nel percorso, resistenza a circuito scollegato, puntali corretti.',
  '- Cap.4 Resistenze: serie somma, parallelo riduce, cadute di tensione, luminosita LED e corrente.',
  '- Cap.5 Batterie: serie aumenta tensione, polarita sbagliata non somma e puo creare problemi.',
  '- Cap.6 LED avanzati: serie/parallelo, resistore di protezione, luminosita e corrente reale.',
  '- Cap.7 Condensatore: carica/scarica, memoria temporanea, LED che si spegne gradualmente, tempo dipende da R e C.',
  '- Cap.8 Transistor/MOSFET: interruttore elettronico comandato da piccolo segnale, gate/base come controllo.',
  '- Cap.9 Rele: comando separato dal circuito di potenza.',
  '- Cap.10 Motori DC: alimentazione, verso, velocita, protezione e controllo con transistor/rele.',
  '- Cap.11 Diodi (p.103): senso unico corrente, protezione, polarita, diodo di ricircolo per motori.',
  '- Cap.12 Robot marciante segui-luce (p.109): fototransistor + MOSFET + diodi + motori, progetto finale Vol2.',
].join('\n');

// 2026-05-10 — capitoli numerati Vol3 (TRES JOLIE audit fix). NB: PDF Vol3 manca,
// solo ODT. Cap.5 titolo corretto "Il nostro primo programma (Blink)" — NON
// "Come è fatto un programma Arduino" come errato in versioni precedenti.
export const UNLIM_VOLUME_3_KNOWLEDGE_PACK = [
  'VOL3 - ESPERTO VOLUME 3 - ARDUINO, SCRATCH E CONTROLLO:',
  '- Missione: trasformare circuiti in sistemi controllati da codice o blocchi, con verifica tramite compilazione/stato reale.',
  '- Cap.5 Il nostro primo programma (Blink) (p.47): void setup(), void loop(), pinMode, digitalWrite HIGH/LOW, delay, LED integrato D13, primo upload.',
  '- Cap.6 I Pin Digitali (p.53): output digitali, LED esterno + resistore 470Ω, sequenze, semaforo, morse, delay come tempo.',
  '- Cap.7 Input digitali (p.~70): pulsante, digitalRead, pull-up/pull-down, debounce semplice, lettura stato.',
  '- Cap.8 Analogico/Seriale (p.~80): analogRead 0-1023, potenziometro/LDR, soglie, map/constrain, Serial Monitor, valori live.',
  '- Cap.9 Servo/movimento: angolo 0-180, alimentazione stabile, attenzione allo sforzo meccanico.',
  '- Cap.10 Buzzer/suono: tone/noTone, melodie, pause, pattern sonori.',
  '- Cap.11 Comunicazione seriale: stampare valori, leggere comandi, debug pratico.',
  '- Cap.12 Robot/seguiluce Arduino: integra LDR, motori/servo, logica di confronto e movimento.',
  '- PWM (in Cap.6+): analogWrite 0-255, fade LED, intensita percepita, NON vera uscita analogica.',
  '- Scratch/blocchi: forever, wait/delay, set pin high/low, if, sensori, blocchi leggibili per principianti.',
  '- Debug: leggi riga errore, parentesi/semicolon, pin non disponibile, GND comune, compilare prima di dire che funziona.',
].join('\n');

export const UNLIM_ALL_VOLUMES_KNOWLEDGE_PACK = [
  'CONOSCENZA COMPLETA DEI TRE VOLUMI:',
  UNLIM_VOLUME_1_KNOWLEDGE_PACK,
  UNLIM_VOLUME_2_KNOWLEDGE_PACK,
  UNLIM_VOLUME_3_KNOWLEDGE_PACK,
].join('\n\n');

function profile(
  id: UnlimAiProfileId,
  mode: UnlimMode,
  depth: UnlimProfileDepth,
  role: string,
  promptBlock: string,
  opts: Partial<Pick<UnlimAiProfile, 'visionProvider' | 'canCaptureScreenshot' | 'maxVisibleWords' | 'volume'>> = {},
): UnlimAiProfile {
  return {
    id,
    mode,
    depth,
    role,
    contextBudget: depth === 'total' ? 'full' : 'compressed',
    visionProvider: opts.visionProvider || 'auto',
    canCaptureScreenshot: opts.canCaptureScreenshot ?? mode === 'vision',
    maxVisibleWords: opts.maxVisibleWords || (depth === 'total' ? 90 : 55),
    promptBlock,
    volume: opts.volume ?? null,
  };
}

export const UNLIM_AI_PROFILES: Record<string, UnlimAiProfile> = {
  knowledge_total: profile(
    'knowledge_total',
    'generale',
    'total',
    'conoscitore totale software+volumi',
    [
      'PROFILO ATTIVO: CONOSCITORE TOTALE.',
      'Usa tutta la memoria software ELAB, il pack volumi e il contesto vivo. Puoi andare oltre il testo se serve, ma devi restare utile alla lezione e non inventare stato non visto.',
      'Se la domanda e operativa, fai o prepara l azione prima della spiegazione.',
    ].join('\n'),
    { maxVisibleWords: 90 },
  ),
  general_purpose_compact: profile(
    'general_purpose_compact',
    'generale',
    'compact',
    'general purpose rapido',
    [
      'PROFILO ATTIVO: GENERAL PURPOSE COMPRESSO.',
      'Rispondi con il minimo contesto utile. Se emerge bisogno di software, circuito o volume, passa mentalmente al profilo piu specifico e dai solo il prossimo gesto.',
    ].join('\n'),
    { maxVisibleWords: 50 },
  ),
  control_total: profile(
    'control_total',
    'controllo',
    'total',
    'controllo qualita, sicurezza e azioni',
    [
      'PROFILO ATTIVO: CONTROLLO TOTALE.',
      'Controlla se la risposta e breve, naturale, verificabile, senza citazioni inutili e senza dichiarare azioni non confermate. Se serve, correggi rotta: una frase e un tool.',
    ].join('\n'),
    { maxVisibleWords: 65 },
  ),
  control_compact: profile(
    'control_compact',
    'controllo',
    'compact',
    'controllo rapido',
    [
      'PROFILO ATTIVO: CONTROLLO COMPRESSO.',
      'Usa check rapidi: lunghezza, concretezza, azione/verifica, niente linguaggio da chatbot.',
    ].join('\n'),
    { maxVisibleWords: 45 },
  ),
  pixtral_total: profile(
    'pixtral_total',
    'vision',
    'total',
    'Pixtral conoscitore totale',
    [
      'PROFILO ATTIVO: PIXTRAL TOTALE.',
      'Leggi screenshot/foto come parte del software ELAB: lavagna, circuito, editor, errori, modalita, volume aperto. Integra software+volumi+stato visuale, poi dai una diagnosi breve e concreta.',
    ].join('\n'),
    { visionProvider: 'pixtral', canCaptureScreenshot: true, maxVisibleWords: 80 },
  ),
  pixtral_essential: profile(
    'pixtral_essential',
    'vision',
    'compact',
    'Pixtral essenziale',
    [
      'PROFILO ATTIVO: PIXTRAL ESSENZIALE.',
      'Guarda solo cio che serve per rispondere: errore visibile, componente, editor, stato UI. Una diagnosi o una domanda mirata, massimo due frasi.',
    ].join('\n'),
    { visionProvider: 'pixtral', canCaptureScreenshot: true, maxVisibleWords: 40 },
  ),
  volume1_fast: profile(
    'volume1_fast',
    'volume1',
    'compact',
    'esperto Volume 1 veloce',
    [
      'PROFILO ATTIVO: ESPERTO VOLUME 1 VELOCE.',
      'Usa le basi reali: breadboard, LED, resistori, pulsanti, potenziometro, LDR, buzzer, reed. Dai il prossimo gesto o una spiegazione da LIM in poche parole.',
    ].join('\n'),
    { maxVisibleWords: 45, volume: 1 },
  ),
  volume1_deep: profile(
    'volume1_deep',
    'volume1',
    'total',
    'esperto Volume 1 profondo',
    [
      'PROFILO ATTIVO: ESPERTO VOLUME 1 PROFONDO.',
      'Ragiona sulle basi fisiche del circuito e sugli esperimenti del Vol.1. Se diagnostichi, parti da polarita, resistore, alimentazione, breadboard e circuito aperto/chiuso.',
    ].join('\n'),
    { maxVisibleWords: 75, volume: 1 },
  ),
  volume2_fast: profile(
    'volume2_fast',
    'volume2',
    'compact',
    'esperto Volume 2 veloce',
    [
      'PROFILO ATTIVO: ESPERTO VOLUME 2 VELOCE.',
      'Usa misure e componenti intermedi senza lezione lunga: multimetro, serie/parallelo, condensatore, diodo, MOSFET, rele, motore.',
    ].join('\n'),
    { maxVisibleWords: 45, volume: 2 },
  ),
  volume2_deep: profile(
    'volume2_deep',
    'volume2',
    'total',
    'esperto Volume 2 profondo',
    [
      'PROFILO ATTIVO: ESPERTO VOLUME 2 PROFONDO.',
      'Integra misure, energia e comportamento dinamico. Se serve, confronta valore atteso e valore reale; non stimare quando puoi chiedere misura/stato.',
    ].join('\n'),
    { maxVisibleWords: 75, volume: 2 },
  ),
  volume3_fast: profile(
    'volume3_fast',
    'volume3',
    'compact',
    'esperto Volume 3 veloce',
    [
      'PROFILO ATTIVO: ESPERTO VOLUME 3 VELOCE.',
      'Vai dritto su Arduino/Scratch: pin, codice, blocchi, compile, Serial Monitor. Per azioni note prepara tag o risposta locale.',
    ].join('\n'),
    { maxVisibleWords: 45, volume: 3 },
  ),
  volume3_deep: profile(
    'volume3_deep',
    'volume3',
    'total',
    'esperto Volume 3 profondo',
    [
      'PROFILO ATTIVO: ESPERTO VOLUME 3 PROFONDO.',
      'Analizza codice, blocchi, pin e circuito insieme. Prima correggi o prepara l azione, poi spiega solo la causa utile.',
    ].join('\n'),
    { maxVisibleWords: 75, volume: 3 },
  ),
};

const MODE_LABELS: Array<[UnlimMode, string]> = [
  ['percorso', 'percorso|capitolo|lezione|volume|esperimento guidato'],
  ['passopasso', 'passo passo|step|prossimo passo|bom'],
  ['montato', 'gia montato|già montato|circuito pronto|osserva'],
  ['libero', 'libero|sandbox|fai tu|monta|costruisci|collega|arduino|scratch'],
  ['controllo', 'controlla|verifica|audit|qualita|sicurezza|non dichiarare'],
  ['vision', 'guarda|screenshot|schermo|lavagna|foto|immagine|vedi|osserva'],
];

for (const mode of ['percorso', 'passopasso', 'montato', 'libero'] as const) {
  UNLIM_AI_PROFILES[`${mode}_total`] = profile(
    `${mode}_total`,
    mode,
    'total',
    `${mode} software+volumi totale`,
    [
      `PROFILO ATTIVO: ${mode.toUpperCase()} TOTALE.`,
      'Usa piena conoscenza del software ELAB, dei volumi e del contesto vivo. Mantieni la lezione fluida: stato reale, concetto, gesto operativo.',
    ].join('\n'),
    { maxVisibleWords: 80 },
  );
  UNLIM_AI_PROFILES[`${mode}_compact`] = profile(
    `${mode}_compact`,
    mode,
    'compact',
    `${mode} contesto compresso`,
    [
      `PROFILO ATTIVO: ${mode.toUpperCase()} COMPRESSO.`,
      'Usa solo il contesto indispensabile. Dai una risposta corta, naturale e subito usabile alla LIM.',
    ].join('\n'),
    { maxVisibleWords: 45 },
  );
}

function normalizeDepth(value?: string | null): UnlimProfileDepth | null {
  if (value === 'total' || value === 'full' || value === 'deep' || value === 'profondo') return 'total';
  if (value === 'compact' || value === 'essential' || value === 'fast' || value === 'compresso') return 'compact';
  return null;
}

function detectVolumeFromText(message: string, experimentId?: string | null, simulatorContext?: Record<string, unknown> | null): 1 | 2 | 3 | null {
  const joined = [
    message,
    experimentId || '',
    String(simulatorContext?.experimentId || ''),
    String((simulatorContext?.experiment as Record<string, unknown> | undefined)?.id || ''),
    String((simulatorContext?.currentExperiment as Record<string, unknown> | undefined)?.id || ''),
    String(simulatorContext?.chapter || ''),
    String(simulatorContext?.volume || ''),
  ].join(' ').toLowerCase();

  if (/\bv1-|volume\s*1|vol\.?\s*1|vol1|primo circuito|rgb|potenziometro|fotoresistore|cicalino|reed|elettropongo\b/.test(joined)) return 1;
  if (/\bv2-|volume\s*2|vol\.?\s*2|vol2|multimetro|condensatore|mosfet|rele|rel[eè]|motore dc|fototransistor\b/.test(joined)) return 2;
  if (/\bv3-|volume\s*3|vol\.?\s*3|vol3|arduino|scratch|blocchi|blink|digitalwrite|digitalread|analogread|analogwrite|serial monitor|servo\b/.test(joined)) return 3;
  return null;
}

function wantsDeepReasoning(message: string, requestedDepth?: UnlimProfileDepth | null): boolean {
  const normalized = normalizeDepth(requestedDepth || null);
  if (normalized === 'total') return true;
  if (normalized === 'compact') return false;
  return /tutto|totale|profond|perche|perché|diagnosi|analizza|ragiona|confronta|debug|errore|non funziona|spiegami bene|capire davvero/i.test(message);
}

function detectMode(message: string, hasImages: boolean, simulatorContext?: Record<string, unknown> | null): UnlimMode {
  if (hasImages) return 'vision';
  const text = String(message || '').toLowerCase();
  for (const [mode, pattern] of MODE_LABELS) {
    if (new RegExp(`\\b(${pattern})\\b`, 'i').test(text)) return mode;
  }
  const rawMode = String(
    simulatorContext?.modalita
    || simulatorContext?.mode
    || simulatorContext?.buildMode
    || '',
  ).toLowerCase();
  if (/passo/.test(rawMode)) return 'passopasso';
  if (/montato|complete/.test(rawMode)) return 'montato';
  if (/libero|sandbox/.test(rawMode)) return 'libero';
  if (/percorso|path/.test(rawMode)) return 'percorso';
  return 'generale';
}

export function selectUnlimAiProfile(
  message: string,
  options: SelectUnlimAiProfileOptions = {},
): UnlimAiProfile {
  const requested = options.requestedProfile ? UNLIM_AI_PROFILES[options.requestedProfile] : null;
  if (requested) return requested;

  const hasImages = Boolean(options.hasImages);
  const sim = options.simulatorContext as Record<string, unknown> | null;
  const mode = detectMode(message, hasImages, sim);
  const depth = normalizeDepth(options.requestedDepth || null)
    || (mode === 'vision'
      ? (/\b(essenziale|rapido|veloce|breve|solo)\b/i.test(message) ? 'compact' : 'total')
      : (/tutto|totale|profond|volume|software|perche|perché|diagnosi|controlla|verifica/i.test(message) ? 'total' : 'compact'));

  // 2026-05-10 fix: gate Pixtral activation on actual images presence.
  // Live prod probe P3 with `images: []` empty array + message "Guarda il circuito"
  // selected `pixtral_total` and Pixtral hallucinated "Vedo un LED rosso..." without
  // any image input. Vision keyword in message + no images = fall through to general
  // routing (frontend should capture screenshot in a follow-up request).
  if (mode === 'vision' && hasImages) {
    return depth === 'total' ? UNLIM_AI_PROFILES.pixtral_total : UNLIM_AI_PROFILES.pixtral_essential;
  }
  if (mode === 'controllo') {
    return depth === 'total' ? UNLIM_AI_PROFILES.control_total : UNLIM_AI_PROFILES.control_compact;
  }

  const volume = detectVolumeFromText(message, options.experimentId || null, sim);
  if (volume) {
    return UNLIM_AI_PROFILES[`volume${volume}_${wantsDeepReasoning(message, options.requestedDepth) ? 'deep' : 'fast'}`]
      || UNLIM_AI_PROFILES.general_purpose_compact;
  }

  if (mode === 'generale') {
    return depth === 'total' ? UNLIM_AI_PROFILES.knowledge_total : UNLIM_AI_PROFILES.general_purpose_compact;
  }
  return UNLIM_AI_PROFILES[`${mode}_${depth}`] || UNLIM_AI_PROFILES.general_purpose_compact;
}

function getVolumeKnowledgePack(volume?: 1 | 2 | 3 | null): string {
  if (volume === 1) return UNLIM_VOLUME_1_KNOWLEDGE_PACK;
  if (volume === 2) return UNLIM_VOLUME_2_KNOWLEDGE_PACK;
  if (volume === 3) return UNLIM_VOLUME_3_KNOWLEDGE_PACK;
  return UNLIM_ALL_VOLUMES_KNOWLEDGE_PACK;
}

export function buildUnlimAiProfilePrompt(profile: UnlimAiProfile): string {
  return [
    '[REGIA MULTI-AI UNLIM]',
    'REGIA PARALLELA 3x2: Vol1 fast/deep, Vol2 fast/deep, Vol3 fast/deep. Scegli mentalmente la corsia giusta; non mostrare la regia all utente.',
    `Profilo: ${profile.id}`,
    `Ruolo: ${profile.role}`,
    `Modalita: ${profile.mode}`,
    `Contesto: ${profile.contextBudget}`,
    `Budget parole visibili: ${profile.maxVisibleWords}`,
    `Screenshot: ${profile.canCaptureScreenshot ? 'puo/deve catturare quando serve capire lo schermo' : 'usa solo se richiesto dal profilo vision'}`,
    profile.promptBlock,
    ELAB_STYLE_BLOCK,
    profile.depth === 'total' ? UNLIM_SOFTWARE_KNOWLEDGE_PACK : 'CONTESTO SOFTWARE COMPRESSO: usa solo modalita corrente, stato circuito/editor e prossimo gesto utile.',
    getVolumeKnowledgePack(profile.volume),
    UNLIM_ALL_VOLUMES_KNOWLEDGE_PACK,
  ].join('\n');
}
