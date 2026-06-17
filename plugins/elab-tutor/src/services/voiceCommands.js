/**
 * Voice Shortcut Commands — Pattern matching locale per comandi vocali frequenti.
 * Intercetta il testo STT PRIMA di inviarlo all'AI per esecuzione istantanea.
 *
 * Flusso: STT text → matchVoiceCommand() → se match → esegui via __ELAB_API → feedback TTS
 *                                         → se no match → invia a AI come prima
 *
 * 36 comandi: simulazione, navigazione, pannelli, compilazione, zoom,
 * montaggio circuito (aggiungi/rimuovi componente, pulisci, monta esperimento),
 * Principio Zero (volume, capitolo, quiz, report, lezione, esperimento successivo)
 */

import { getVolumeChapters } from '../data/chapter-map.js';

/**
 * @typedef {Object} VoiceCommand
 * @property {string} action - Nome azione (per logging/tracking)
 * @property {string[]} patterns - Parole chiave che attivano il comando
 * @property {function} execute - Funzione che esegue il comando via __ELAB_API
 * @property {string} feedback - Testo feedback TTS dopo esecuzione
 */

/** @type {VoiceCommand[]} */
const VOICE_COMMANDS = [
  // ── Simulazione ──
  {
    action: 'play',
    patterns: ['play', 'avvia', 'fai partire', 'start', 'inizia simulazione', 'avvia simulazione'],
    execute: () => window.__ELAB_API?.play?.(),
    feedback: 'Simulazione avviata!',
  },
  {
    action: 'stop',
    patterns: ['stop', 'ferma', 'pausa', 'fermati', 'ferma simulazione', 'stop simulazione'],
    execute: () => window.__ELAB_API?.pause?.(),
    feedback: 'Simulazione fermata.',
  },
  {
    action: 'reset',
    patterns: ['reset', 'ricomincia', 'resetta', 'riavvia'],
    execute: () => {
      window.__ELAB_API?.pause?.();
      window.__ELAB_API?.reset?.();
    },
    feedback: 'Simulazione resettata.',
  },

  // ── Navigazione esperimento ──
  {
    action: 'nextStep',
    patterns: ['prossimo', 'avanti', 'next', 'passo successivo', 'vai avanti'],
    execute: () => window.__ELAB_API?.nextStep?.(),
    feedback: 'Prossimo passo.',
  },
  {
    action: 'prevStep',
    patterns: ['indietro', 'precedente', 'back', 'passo precedente', 'torna indietro'],
    execute: () => window.__ELAB_API?.prevStep?.(),
    feedback: 'Passo precedente.',
  },

  // ── Pannelli ──
  {
    action: 'showEditor',
    patterns: ['mostra codice', 'editor', 'apri editor', 'mostra editor', 'vedi codice'],
    execute: () => window.__ELAB_API?.showEditor?.(),
    feedback: 'Editor aperto.',
  },
  {
    action: 'showSerial',
    patterns: ['mostra seriale', 'serial monitor', 'monitor seriale', 'apri seriale'],
    execute: () => window.__ELAB_API?.showSerialMonitor?.(),
    feedback: 'Monitor seriale aperto.',
  },

  // ── Compilazione ──
  {
    action: 'compile',
    patterns: ['compila', 'compile', 'carica codice', 'carica programma', 'upload'],
    execute: () => {
      const code = window.__ELAB_API?.getEditorCode?.();
      if (code) {
        window.__ELAB_API?.compile?.(code);
      }
    },
    feedback: 'Compilazione in corso...',
  },

  // ── Zoom/Vista ──
  {
    action: 'zoomFit',
    patterns: ['zoom fit', 'adatta vista', 'vedi tutto', 'mostra tutto', 'fit'],
    execute: () => {
      // Dispatch 'F' key event — SimulatorCanvas handles it to reset/fit view
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
    },
    feedback: 'Vista adattata.',
  },

  // ── UNLIM ONNIPOTENTE: Aggiungi componenti ──
  {
    action: 'addLed',
    patterns: ['aggiungi led', 'metti led', 'aggiungi un led', 'metti un led', 'inserisci led'],
    execute: () => window.__ELAB_API?.addComponent?.('led'),
    feedback: 'Ho aggiunto un LED rosso sulla breadboard!',
  },
  {
    action: 'addResistor',
    patterns: ['aggiungi resistore', 'metti resistore', 'aggiungi un resistore', 'metti un resistore', 'inserisci resistore'],
    execute: () => window.__ELAB_API?.addComponent?.('resistor'),
    feedback: 'Ho aggiunto un resistore da 1kΩ sulla breadboard!',
  },
  {
    action: 'addButton',
    patterns: ['aggiungi pulsante', 'metti pulsante', 'aggiungi un pulsante', 'inserisci pulsante', 'aggiungi bottone'],
    execute: () => window.__ELAB_API?.addComponent?.('pushbutton'),
    feedback: 'Ho aggiunto un pulsante sulla breadboard!',
  },
  {
    action: 'addCapacitor',
    patterns: ['aggiungi condensatore', 'metti condensatore', 'inserisci condensatore'],
    execute: () => window.__ELAB_API?.addComponent?.('capacitor'),
    feedback: 'Ho aggiunto un condensatore sulla breadboard!',
  },
  {
    action: 'addBuzzer',
    patterns: ['aggiungi buzzer', 'metti buzzer', 'aggiungi cicalino', 'inserisci buzzer'],
    execute: () => window.__ELAB_API?.addComponent?.('buzzer'),
    feedback: 'Ho aggiunto un cicalino sulla breadboard!',
  },
  {
    action: 'addPotentiometer',
    patterns: ['aggiungi potenziometro', 'metti potenziometro', 'inserisci potenziometro'],
    execute: () => window.__ELAB_API?.addComponent?.('potentiometer'),
    feedback: 'Ho aggiunto un potenziometro sulla breadboard!',
  },

  // ── UNLIM ONNIPOTENTE: Pulisci circuito ──
  {
    action: 'clearCircuit',
    patterns: ['pulisci circuito', 'svuota circuito', 'pulisci tutto', 'cancella tutto', 'rimuovi tutto'],
    execute: () => window.__ELAB_API?.clearCircuit?.(),
    feedback: 'Circuito pulito! La breadboard è vuota.',
  },

  // ── UNLIM ONNIPOTENTE: Descrizione circuito ──
  {
    action: 'describeCircuit',
    patterns: ['che componenti ci sono', 'descrivi circuito', 'cosa c\'e nel circuito', 'elenca componenti', 'quanti componenti'],
    execute: () => {
      // Questo comando non esegue un'azione — restituisce il testo per TTS
      // Il feedback sarà sovrascritto dinamicamente da executeVoiceCommand
    },
    feedback: '__CIRCUIT_DESCRIPTION__', // token speciale — sostituito in executeVoiceCommand
  },

  // ── UNLIM ONNIPOTENTE: Undo/Redo ──
  {
    action: 'undo',
    patterns: ['annulla', 'undo', 'cancella ultimo', 'disfa'],
    execute: () => window.__ELAB_API?.undo?.(),
    feedback: 'Azione annullata.',
  },
  {
    action: 'redo',
    patterns: ['ripeti', 'redo', 'rifai'],
    execute: () => window.__ELAB_API?.redo?.(),
    feedback: 'Azione ripetuta.',
  },

  // ── UNLIM ONNIPOTENTE: Monta esperimento per numero ──
  {
    action: 'mountExp1',
    patterns: ['monta esperimento uno', 'monta esperimento 1', 'carica esperimento uno', 'carica esperimento 1', 'primo esperimento'],
    execute: () => {
      const list = window.__ELAB_API?.getExperimentList?.();
      const first = list?.vol1?.[0];
      if (first) window.__ELAB_API?.mountExperiment?.(first.id);
    },
    feedback: 'Sto montando il primo esperimento!',
  },
  {
    action: 'mountExpLed',
    patterns: ['monta circuito led', 'monta il led', 'circuito del led', 'monta led'],
    execute: () => {
      // Cerca esperimento con LED nel titolo
      const all = window.__ELAB_API?.getExperimentList?.();
      const exps = [...(all?.vol1 || []), ...(all?.vol2 || []), ...(all?.vol3 || [])];
      const match = exps.find(e => e.title?.toLowerCase().includes('led') || e.id?.includes('led'));
      if (match) window.__ELAB_API?.mountExperiment?.(match.id);
    },
    feedback: 'Sto montando il circuito con il LED!',
  },
  {
    action: 'mountExpSemafor',
    patterns: ['monta semaforo', 'circuito semaforo', 'esperimento semaforo'],
    execute: () => {
      const all = window.__ELAB_API?.getExperimentList?.();
      const exps = [...(all?.vol1 || []), ...(all?.vol2 || []), ...(all?.vol3 || [])];
      const match = exps.find(e => e.title?.toLowerCase().includes('semafor'));
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      if (match) window.__ELAB_API?.mountExperiment?.(match.id);
    },
    feedback: 'Sto montando il semaforo!',
  },

  // ── UNLIM ONNIPOTENTE: Modalità costruzione ──
  {
    action: 'setBuildSandbox',
    patterns: ['modalita libera', 'sandbox', 'modo sandbox', 'costruisci libero'],
    execute: () => window.__ELAB_API?.setBuildMode?.('sandbox'),
    feedback: 'Modalità libera attivata — puoi costruire come vuoi!',
  },
  {
    action: 'setBuildGuided',
    patterns: ['modalita guidata', 'passo passo', 'modo guidato', 'guida passo'],
    execute: () => window.__ELAB_API?.setBuildMode?.('guided'),
    feedback: 'Modalità passo passo attivata!',
  },

  // ── Principio Zero: Monta il circuito ──
  {
    action: 'mountCircuit',
    patterns: ['monta il circuito', 'monta circuito', 'costruisci il circuito', 'costruisci circuito'],
    execute: () => {
      const exp = window.__ELAB_API?.getCurrentExperiment?.();
      if (exp?.id) {
        window.__ELAB_API?.setBuildMode?.('complete');
        window.__ELAB_API?.mountExperiment?.(exp.id);
      }
    },
    feedback: 'Monto il circuito!',
  },
  {
    action: 'mountStepByStep',
    patterns: ['monta passo passo', 'monta passo a passo', 'costruisci passo passo'],
    execute: () => {
      const exp = window.__ELAB_API?.getCurrentExperiment?.();
      if (exp?.id) {
        window.__ELAB_API?.setBuildMode?.('guided');
        window.__ELAB_API?.mountExperiment?.(exp.id);
      }
    },
    feedback: 'Montiamo il circuito passo passo!',
  },

  // ── Principio Zero: Prossimo / precedente esperimento ──
  {
    action: 'nextExperiment',
    patterns: ['prossimo esperimento', 'esperimento successivo', 'next experiment'],
    execute: () => {
      const api = window.__ELAB_API;
      const current = api?.getCurrentExperiment?.();
      if (!current?.id) return;
      const all = api?.getExperimentList?.();
      const flat = [...(all?.vol1 || []), ...(all?.vol2 || []), ...(all?.vol3 || [])];
      const idx = flat.findIndex(e => e.id === current.id);
      if (idx >= 0 && idx < flat.length - 1) {
        api?.mountExperiment?.(flat[idx + 1].id);
      }
    },
    feedback: 'Prossimo esperimento!',
  },
  {
    action: 'prevExperiment',
    patterns: ['esperimento precedente', 'torna all esperimento precedente', 'previous experiment'],
    execute: () => {
      const api = window.__ELAB_API;
      const current = api?.getCurrentExperiment?.();
      if (!current?.id) return;
      const all = api?.getExperimentList?.();
      const flat = [...(all?.vol1 || []), ...(all?.vol2 || []), ...(all?.vol3 || [])];
      const idx = flat.findIndex(e => e.id === current.id);
      if (idx > 0) {
        api?.mountExperiment?.(flat[idx - 1].id);
      }
    },
    feedback: 'Esperimento precedente.',
  },

  // ── Principio Zero: Prepara la lezione ──
  {
    action: 'prepareLesson',
    patterns: ['prepara la lezione', 'prepara lezione', 'prepara la classe', 'inizia la lezione'],
    execute: () => {
      // Dispatch a custom event that UNLIM/Lavagna can listen to
      window.dispatchEvent(new CustomEvent('elab-voice-command', {
        detail: { action: 'prepareLesson' },
      }));
    },
    feedback: 'Preparo la lezione!',
  },

  // ── Principio Zero: Compila il codice (alias espliciti) ──
  {
    action: 'compileCode',
    patterns: ['compila il codice', 'compila codice', 'compila il programma', 'compila programma'],
    execute: () => {
      const code = window.__ELAB_API?.getEditorCode?.();
      if (code) {
        window.__ELAB_API?.compile?.(code);
      }
    },
    feedback: 'Compilazione in corso...',
  },

  // ── Principio Zero: Mostra / Nascondi codice ──
  {
    action: 'hideEditor',
    patterns: ['nascondi il codice', 'nascondi codice', 'chiudi editor', 'chiudi codice', 'nascondi editor'],
    execute: () => window.__ELAB_API?.hideEditor?.(),
    feedback: 'Editor nascosto.',
  },

  // ── Principio Zero: Quiz ──
  {
    action: 'startQuiz',
    patterns: ['fai il quiz', 'inizia il quiz', 'apri il quiz', 'quiz', 'avvia quiz', 'fai quiz'],
    execute: () => {
      window.dispatchEvent(new CustomEvent('elab-voice-command', {
        detail: { action: 'startQuiz' },
      }));
    },
    feedback: 'Apro il quiz!',
  },

  // ── Principio Zero: Report ──
  {
    action: 'createReport',
    patterns: ['crea il report', 'crea report', 'mostra report', 'genera report', 'report fumetto', 'apri report', 'leggi rapporto', 'leggi il rapporto', 'mostra fumetto', 'apri fumetto', 'mostra il fumetto'],
    execute: () => {
      window.dispatchEvent(new CustomEvent('elab-voice-command', {
        detail: { action: 'createReport' },
      }));
    },
    feedback: 'Genero il report!',
  },

  // ── Principio Zero: Volume 1 / 2 / 3 ──
  {
    action: 'selectVolume1',
    patterns: ['volume 1', 'volume uno', 'apri volume 1', 'apri volume uno', 'vai al volume 1'],
    execute: () => {
      const all = window.__ELAB_API?.getExperimentList?.();
      const first = all?.vol1?.[0];
      if (first) window.__ELAB_API?.mountExperiment?.(first.id);
    },
    feedback: 'Volume 1 — Le Basi!',
  },
  {
    action: 'selectVolume2',
    patterns: ['volume 2', 'volume due', 'apri volume 2', 'apri volume due', 'vai al volume 2'],
    execute: () => {
      const all = window.__ELAB_API?.getExperimentList?.();
      const first = all?.vol2?.[0];
      if (first) window.__ELAB_API?.mountExperiment?.(first.id);
    },
    feedback: 'Volume 2 — Approfondiamo!',
  },
  {
    action: 'selectVolume3',
    patterns: ['volume 3', 'volume tre', 'apri volume 3', 'apri volume tre', 'vai al volume 3'],
    execute: () => {
      const all = window.__ELAB_API?.getExperimentList?.();
      const first = all?.vol3?.[0];
      if (first) window.__ELAB_API?.mountExperiment?.(first.id);
    },
    feedback: 'Volume 3 — Arduino!',
  },

  // ── Principio Zero: Capitolo X (usa chapter-map.js) ──
  {
    action: 'selectChapter',
    patterns: [
      'capitolo 1', 'capitolo uno',
      'capitolo 2', 'capitolo due',
      'capitolo 3', 'capitolo tre',
      'capitolo 4', 'capitolo quattro',
      'capitolo 5', 'capitolo cinque',
      'capitolo 6', 'capitolo sei',
      'capitolo 7', 'capitolo sette',
      'capitolo 8', 'capitolo otto',
      'capitolo 9', 'capitolo nove',
      'capitolo 10', 'capitolo dieci',
    ],
    execute: (_matchedPattern) => {
      // Extract chapter number from matched pattern stored by executeVoiceCommand
      const num = _extractChapterNumber(_matchedPattern);
      if (!num) return;

      // Determine current volume from loaded experiment
      const current = window.__ELAB_API?.getCurrentExperiment?.();
      let volume = 1;
      if (current?.id?.startsWith('v2')) volume = 2;
      else if (current?.id?.startsWith('v3')) volume = 3;

      // Find chapter in the chapter-map
      const chapters = getVolumeChapters(volume);
      const chapter = chapters.find(c => c.displayChapter === num);
      if (!chapter) return;

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      // Find first experiment matching this chapter key
      const all = window.__ELAB_API?.getExperimentList?.();
      const volKey = `vol${volume}`;
      const exps = all?.[volKey] || [];
      const match = exps.find(e => e.id.startsWith(chapter.key));
      if (match) window.__ELAB_API?.mountExperiment?.(match.id);
    },
    feedback: '__CHAPTER_FEEDBACK__',
  },
];

/** Map Italian number words to digits */
const ITALIAN_NUMBERS = {
  uno: 1, due: 2, tre: 3, quattro: 4, cinque: 5,
  sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10,
};

/**
 * Extract chapter number from a matched pattern like "capitolo 3" or "capitolo tre".
 * @param {string} pattern
 * @returns {number|null}
 */
function _extractChapterNumber(pattern) {
  if (!pattern) return null;
  const parts = pattern.split(/\s+/);
  const last = parts[parts.length - 1];
  const digit = parseInt(last, 10);
  if (!isNaN(digit) && digit >= 1 && digit <= 10) return digit;
  return ITALIAN_NUMBERS[last] || null;
}

/**
 * Normalizza il testo per il matching: lowercase, trim, rimuove punteggiatura, accenti.
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .trim()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Cerca un match tra il testo STT e i comandi vocali.
 * Preferisce il pattern piu' lungo per evitare ambiguita'
 * (es. "prossimo esperimento" non viene catturato da "prossimo").
 * @param {string} text - Testo riconosciuto da STT
 * @returns {{ command: VoiceCommand, matched: string } | null}
 */
export function matchVoiceCommand(text) {
  if (!text || text.length < 2) return null;

  const normalized = normalize(text);

  // Collect all matches, then pick the longest pattern
  let bestMatch = null;
  let bestLen = 0;

  for (const cmd of VOICE_COMMANDS) {
    for (const pattern of cmd.patterns) {
      // Normalize pattern the same way as input text (fixes apostrophe/accent mismatches)
      const normPattern = normalize(pattern);
      if (normalized === normPattern || (() => {
        const re = new RegExp(`\\b${normPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        return re.test(normalized);
      })()) {
        if (pattern.length > bestLen) {
          bestLen = pattern.length;
          bestMatch = { command: cmd, matched: pattern };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Esegui un comando vocale e ritorna il feedback.
 * Gestisce i token speciali __CIRCUIT_DESCRIPTION__ e __CHAPTER_FEEDBACK__.
 * @param {VoiceCommand} command
 * @param {string} [matchedPattern] - Il pattern che ha fatto match (per comandi parametrici)
 * @returns {string} feedback text
 */
export function executeVoiceCommand(command, matchedPattern) {
  try {
    command.execute(matchedPattern);

    // Token speciale: sostituisci con la descrizione reale del circuito
    if (command.feedback === '__CIRCUIT_DESCRIPTION__') {
      return window.__ELAB_API?.getCircuitDescription?.() || 'Circuito vuoto.';
    }

    // Token speciale: feedback dinamico per capitolo
    if (command.feedback === '__CHAPTER_FEEDBACK__') {
      const num = _extractChapterNumber(matchedPattern);
      return num ? `Capitolo ${num}!` : 'Capitolo selezionato!';
    }

    return command.feedback;
  } catch (_err) {
    return 'Comando non riuscito.';
  }
}

/**
 * Lista comandi disponibili (per help/debug).
 * @returns {Array<{action: string, patterns: string[], feedback: string}>}
 */
export function getAvailableCommands() {
  return VOICE_COMMANDS.map(({ action, patterns, feedback }) => ({
    action,
    patterns,
    feedback: feedback === '__CIRCUIT_DESCRIPTION__' ? '(descrizione circuito dinamica)'
      : feedback === '__CHAPTER_FEEDBACK__' ? '(capitolo dinamico)'
      : feedback,
  }));
}
