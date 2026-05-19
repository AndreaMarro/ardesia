/**
 * useGalileoChat — Hook for Galileo AI chat in the Lavagna shell
 * Manages messages, input, loading, send, retry, and action execution.
 * Imports services from existing codebase — ZERO duplication from ElabTutorV4.
 * (c) Andrea Marro — 01/04/2026
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { sendChat, analyzeImage, checkRateLimit } from '../../services/api';
import { validateMessage, sanitizeOutput } from '../../utils/contentFilter';
import { isLessonPrepCommand, getLessonSummary, prepareLesson } from '../../services/lessonPrepService';
import { collectFullContext, getLatestVisualSnapshotImage } from '../../services/unlimContextCollector';
import { logLatency } from '../../services/unlimLatencyLog';
import { executeServerIntents } from './intentsDispatcher';
import { buildDirectOperationalResponse } from '../../../supabase/functions/_shared/operational-response.ts';
import logger from '../../utils/logger';

// ── Welcome message ──
const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: 'Ciao! Sono **UNLIM**, il tuo assistente per l\'elettronica. Cosa costruiamo oggi?',
};

// ── Quick actions (Socratic mode) ──
// Quick actions rimossi — il docente usa il Percorso strutturato + domanda libera
const QUICK_ACTIONS = [];

const QUICK_ACTION_MESSAGES = {
  guide: 'Fammi una domanda guida su questo argomento. Usa parole semplici, una domanda alla volta, adatta a ragazzi 8-14 anni.',
  step: 'Aiutami a risolvere questo esercizio senza dirmi la risposta finale. Guidami passo passo con suggerimenti brevi per studenti 8-14 anni.',
  check: 'Controlla il mio ragionamento: dimmi cosa va bene, cosa migliorare e fammi una domanda di verifica. Tono chiaro per eta 8-14.',
  hint: 'Dammi solo un indizio breve per andare avanti, senza spoiler della soluzione. Linguaggio semplice per 8-14 anni.',
};

const COMPONENT_TYPE_ALIASES = {
  buzzer: 'buzzer-piezo',
  cicalino: 'buzzer-piezo',
  pulsante: 'push-button',
  pushbutton: 'push-button',
  fotoresistenza: 'photo-resistor',
  photoresistor: 'photo-resistor',
  ldr: 'photo-resistor',
  batteria: 'battery9v',
  battery: 'battery9v',
  arduino: 'nano-r4',
  nano: 'nano-r4',
};

function normalizeActionComponentType(type) {
  const raw = String(type || '').trim();
  if (!raw) return '';
  return COMPONENT_TYPE_ALIASES[raw.toLowerCase()] || raw;
}

function normalizeActionWirePins(parts) {
  if (!Array.isArray(parts)) return null;
  const rest = parts.slice(1).map(s => String(s || '').trim()).filter(Boolean);
  if (rest.length >= 4) return [`${rest[0]}:${rest[1]}`, `${rest[2]}:${rest[3]}`];
  if (rest.length >= 2 && rest[0].includes(':') && rest[1].includes(':')) {
    return [rest[0], rest[1]];
  }
  return null;
}

function actionReturnedFailure(result) {
  if (result === false || result === null) return true;
  if (result && typeof result === 'object' && typeof result.then !== 'function') {
    return result.success === false || result.ok === false || result.status === 'error';
  }
  return false;
}

function actionFailureReason(result, fallback = 'tool rejected the action') {
  if (result === false) return fallback;
  if (result === null) return 'tool returned null';
  if (result && typeof result === 'object') {
    if (typeof result.error === 'string') return result.error;
    if (typeof result.reason === 'string') return result.reason;
    if (Array.isArray(result.errors) && result.errors.length > 0) return result.errors.join('; ');
    if (result.success === false) return fallback;
    if (result.ok === false) return fallback;
    if (result.status === 'error') return fallback;
  }
  return fallback;
}

async function settleActionResult(result) {
  try {
    return { value: await result };
  } catch (err) {
    return {
      value: { ok: false, error: err?.message || 'tool threw an error' },
      thrown: err,
    };
  }
}

function makeVerificationRecord(command, label, ok, details = {}) {
  return {
    command,
    label,
    ok: Boolean(ok),
    reason: ok ? null : (details.reason || 'verification failed'),
    observed: details.observed || null,
    expected: details.expected || null,
  };
}

function shouldUseVisualNarrative(message) {
  const text = String(message || '');
  const asksForVisualRead = /\b(guarda|analizza|controlla|vedi|vedere|vederlo|osserva|screenshot|foto|immagine|schermata)\b.*\b(circuito|schema|breadboard|simulatore|lavagna|schermo|mio|questo|errore)\b|\b(circuito|schema|breadboard)\b.*\b(guarda|analizza|controlla|vedi|vedere|vederlo|osserva|errore|giusto|corretto)\b/i.test(text);
  const asksForAction = /\b(avvia|parti|play|stop|ferma|pausa|compila|carica|monta|aggiungi|collega|togli|rimuovi|cancella|pulisci|apri|chiudi|evidenzia|mostra)\b/i.test(text);
  return asksForVisualRead && !asksForAction;
}

function buildVisionUnavailableMessage() {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  let description = '';
  try {
    description = String(api?.getCircuitDescription?.() || '').trim();
  } catch { /* silent */ }
  if (description) {
    return `Riesco a leggere lo stato del simulatore, ma non ho una schermata visiva affidabile adesso. Da qui vedo: ${description.slice(0, 220)}`;
  }
  return 'Non riesco a leggere lo screenshot del circuito in questo momento. Premi il pulsante fotocamera o riprova tra un secondo.';
}

async function readEditorCode(api) {
  if (!api?.getEditorCode) return undefined;
  const settled = await settleActionResult(api.getEditorCode());
  return settled.value;
}

async function executeActionTagsVerified(rawResponse) {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  if (!api) return { executed: [], records: [] };

  const executed = [];
  const records = [];
  const re = /\[azione:([^\]]+)\]/gi;
  let match;
  let pendingEditorCode = null;

  async function recordTool(command, label, toolResult, verifier) {
    const settled = await settleActionResult(toolResult);
    if (actionReturnedFailure(settled.value)) {
      const record = makeVerificationRecord(command, label, false, {
        reason: actionFailureReason(settled.value),
        observed: settled.value,
      });
      records.push(record);
      return record;
    }
    if (verifier) {
      const verified = await verifier(settled.value);
      const record = makeVerificationRecord(command, label, verified.ok, verified);
      records.push(record);
      if (record.ok) executed.push(label);
      return record;
    }
    const record = makeVerificationRecord(command, label, true, { observed: settled.value });
    records.push(record);
    executed.push(label);
    return record;
  }

  function recordUnavailable(command, label) {
    const record = makeVerificationRecord(command, label, false, { reason: 'tool unavailable' });
    records.push(record);
    return record;
  }

  async function callVoidTool(command, label, fn) {
    if (typeof fn !== 'function') return recordUnavailable(command, label);
    return recordTool(command, label, fn());
  }

  while ((match = re.exec(rawResponse)) !== null) {
    const full = match[1].trim();
    const parts = full.split(':').map(s => s.trim());
    const cmd = parts[0].toLowerCase();

    try {
      switch (cmd) {
        case 'play':
          await callVoidTool(cmd, 'play', api.play);
          break;
        case 'pause':
          await callVoidTool(cmd, 'pause', api.pause);
          break;
        case 'reset':
          await callVoidTool(cmd, 'reset', api.reset);
          break;
        case 'loadexp':
          if (parts[1] && api.loadExperiment) {
            await recordTool(cmd, `loadexp:${parts[1]}`, api.loadExperiment(parts[1]));
          }
          break;
        case 'addcomponent': {
          if (parts[1] && api.addComponent) {
            const x = parseInt(parts[2], 10) || 200;
            const y = parseInt(parts[3], 10) || 150;
            const type = normalizeActionComponentType(parts[1]);
            const toolResult = api.addComponent(type, { x, y });
            await recordTool(cmd, `addcomponent:${type}`, toolResult, async (addedId) => {
              if (!addedId) return { ok: false, reason: 'component id missing after add', observed: addedId };
              const layout = api.getLayout ? (await settleActionResult(api.getLayout())).value : null;
              if (layout?.components && !layout.components.some(c => c.id === addedId || c.type === type)) {
                return {
                  ok: false,
                  reason: 'component not visible in layout after add',
                  expected: { type, id: addedId },
                  observed: layout.components,
                };
              }
              return { ok: true, observed: { id: addedId, type } };
            });
          }
          break;
        }
        case 'removecomponent':
          if (parts[1] && api.removeComponent) {
            await recordTool(cmd, `removecomponent:${parts[1]}`, api.removeComponent(parts[1]));
          }
          break;
        case 'addwire': {
          if (api.addWire) {
            const pins = normalizeActionWirePins(parts);
            if (pins) {
              await recordTool(cmd, `addwire:${pins[0]}->${pins[1]}`, api.addWire(pins[0], pins[1]));
            } else {
              records.push(makeVerificationRecord(cmd, 'addwire', false, { reason: 'invalid wire pins', observed: parts }));
            }
          }
          break;
        }
        case 'compile': {
          if (api.compile) {
            const code = pendingEditorCode ?? await readEditorCode(api);
            await recordTool(cmd, 'compile', api.compile(code), async (compileResult) => {
              if (actionReturnedFailure(compileResult)) {
                return { ok: false, reason: actionFailureReason(compileResult), observed: compileResult };
              }
              return { ok: true, observed: compileResult };
            });
          }
          break;
        }
        case 'clearall':
          await callVoidTool(cmd, 'clearall', api.clearAll);
          break;
        case 'undo':
          await callVoidTool(cmd, 'undo', api.undo);
          break;
        case 'redo':
          await callVoidTool(cmd, 'redo', api.redo);
          break;
        case 'setcode': {
          const code = parts.slice(1).join(':');
          if (code && api.setEditorCode) {
            pendingEditorCode = code;
            await recordTool(cmd, 'setcode', api.setEditorCode(code), async () => {
              if (!api.getEditorCode) return { ok: true, observed: 'no editor readback available' };
              const observed = await readEditorCode(api);
              return observed === code
                ? { ok: true, expected: code, observed }
                : { ok: false, reason: 'editor code readback mismatch', expected: code, observed };
            });
          }
          break;
        }
        case 'appendcode': {
          const code = parts.slice(1).join(':');
          if (code && api.appendEditorCode) {
            await recordTool(cmd, 'appendcode', api.appendEditorCode(code));
          }
          break;
        }
        case 'loadblocks': {
          const xml = parts.slice(1).join(':');
          if (xml && api.loadScratchWorkspace) {
            await recordTool(cmd, 'loadblocks', api.loadScratchWorkspace(xml));
          }
          break;
        }
        case 'exportfumetto':
        case 'fumetto':
        case 'report': {
          if (api.unlim?.exportFumetto) {
            const format = parts[1] || 'pdf';
            await recordTool(cmd, 'exportfumetto', api.unlim.exportFumetto({ format, source: 'unlim-action' }));
          }
          break;
        }
        case 'switcheditor':
          if (parts[1] && api.setEditorMode) {
            await recordTool(cmd, `switcheditor:${parts[1]}`, api.setEditorMode(parts[1] === 'scratch' ? 'scratch' : 'arduino'));
          }
          break;
        case 'openeditor':
          await callVoidTool(cmd, 'openeditor', api.showEditor);
          break;
        case 'closeeditor':
          await callVoidTool(cmd, 'closeeditor', api.hideEditor);
          break;
        case 'highlightpin': {
          if (parts[1]) {
            const pinArg = parts.slice(1).join(':');
            const pins = pinArg.split(',').map(s => s.trim());
            await recordTool(cmd, `highlightpin:${pinArg}`, api.highlightPin?.(pins));
            setTimeout(() => api.unlim?.clearHighlights?.(), 4000);
          }
          break;
        }
        default: {
          const syncExecuted = executeActionTags(`[AZIONE:${full}]`);
          for (const label of syncExecuted) {
            records.push(makeVerificationRecord(cmd, label, true, { observed: 'legacy bridge executed' }));
            executed.push(label);
          }
          if (syncExecuted.length === 0) {
            records.push(makeVerificationRecord(cmd, full, false, { reason: 'no executable tool or verifier available' }));
          }
        }
      }
    } catch (err) {
      records.push(makeVerificationRecord(cmd, full, false, { reason: err?.message || 'tool threw an error' }));
      logger.warn('[Lavagna] Verified action error:', cmd, err.message);
    }
  }

  return { executed, records };
}

// ── AZIONE tag parser — handles common simulator commands via __ELAB_API ──
function executeActionTags(rawResponse) {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  if (!api) return [];

  const executed = [];
  const re = /\[azione:([^\]]+)\]/gi;
  let match;
  let pendingEditorCode = null;

  while ((match = re.exec(rawResponse)) !== null) {
    const full = match[1].trim();
    const parts = full.split(':').map(s => s.trim());
    const cmd = parts[0].toLowerCase();

    try {
      switch (cmd) {
        case 'play': api.play?.(); executed.push('play'); break;
        case 'pause': api.pause?.(); executed.push('pause'); break;
        case 'reset': api.reset?.(); executed.push('reset'); break;
        case 'highlight':
          if (parts[1] && api.unlim?.highlightComponent) {
            api.unlim.highlightComponent(parts[1].split(',').map(s => s.trim()));
            setTimeout(() => api.unlim?.clearHighlights?.(), 4000);
            executed.push('highlight:' + parts[1]);
          }
          break;
        case 'loadexp':
          if (parts[1] && api.loadExperiment) {
            const loaded = api.loadExperiment(parts[1]);
            if (!actionReturnedFailure(loaded)) executed.push('loadexp:' + parts[1]);
          }
          break;
        case 'addcomponent':
          if (parts[1] && api.addComponent) {
            const x = parseInt(parts[2], 10) || 200;
            const y = parseInt(parts[3], 10) || 150;
            const type = normalizeActionComponentType(parts[1]);
            const addedId = api.addComponent(type, { x, y });
            if (addedId) executed.push('addcomponent:' + addedId);
          }
          break;
        case 'removecomponent':
          if (parts[1] && api.removeComponent) {
            api.removeComponent(parts[1]);
            executed.push('removecomponent:' + parts[1]);
          }
          break;
        case 'addwire':
          if (api.addWire) {
            const pins = normalizeActionWirePins(parts);
            if (pins) {
              const result = api.addWire(pins[0], pins[1]);
              if (!actionReturnedFailure(result)) executed.push(`addwire:${pins[0]}->${pins[1]}`);
            }
          }
          break;
        case 'compile': {
          if (api.compile) {
            const code = pendingEditorCode ?? api.getEditorCode?.();
            const result = api.compile(code);
            if (!actionReturnedFailure(result)) executed.push('compile');
          }
          break;
        }
        case 'undo': api.undo?.(); executed.push('undo'); break;
        case 'redo': api.redo?.(); executed.push('redo'); break;
        case 'interact':
          if (parts[1] && parts[2] && api.interact) {
            api.interact(parts[1], parts[2], parts[3]);
            executed.push('interact:' + parts[1] + ':' + parts[2]);
          }
          break;
        case 'clearall': api.clearAll?.(); executed.push('clearall'); break;
        case 'setvalue':
          if (parts[1] && parts[2] && parts[3] !== undefined && api.setComponentValue) {
            api.setComponentValue(parts[1], parts[2], parts[3]);
            executed.push('setvalue:' + parts[1] + ':' + parts[2] + ':' + parts[3]);
          }
          break;
        case 'screenshot':
          if (api.captureScreenshot) {
            api.captureScreenshot();
            executed.push('screenshot');
          }
          break;
        case 'exportfumetto':
        case 'fumetto':
        case 'report': {
          if (api.unlim?.exportFumetto) {
            const format = parts[1] || 'pdf';
            const result = api.unlim.exportFumetto({ format, source: 'unlim-action' });
            if (!actionReturnedFailure(result)) executed.push('exportfumetto');
          }
          break;
        }
        case 'describe':
          if (api.getCircuitDescription) {
            const desc = api.getCircuitDescription();
            logger.info('[Lavagna] Circuit description:', desc);
            executed.push('describe');
          }
          break;
        // ── Movement & Wires ──
        case 'movecomponent':
          if (parts[1] && api.moveComponent) {
            api.moveComponent(parts[1], parseInt(parts[2], 10) || 200, parseInt(parts[3], 10) || 150);
            executed.push('movecomponent:' + parts[1]);
          }
          break;
        case 'removewire':
          if (parts[1] !== undefined && api.removeWire) {
            api.removeWire(parseInt(parts[1], 10));
            executed.push('removewire:' + parts[1]);
          }
          break;
        // ── Diagnostics ──
        case 'measure':
          if (parts[1]) {
            logger.info('[Lavagna] Measure requested:', parts[1]);
            executed.push('measure:' + parts[1]);
          }
          break;
        case 'diagnose':
          logger.info('[Lavagna] Diagnose requested');
          executed.push('diagnose');
          break;
        // ── Editor Control ──
        case 'openeditor':
          api.showEditor?.();
          executed.push('openeditor');
          break;
        case 'closeeditor':
          api.hideEditor?.();
          executed.push('closeeditor');
          break;
        case 'switcheditor':
          if (parts[1] && api.setEditorMode) {
            api.setEditorMode(parts[1] === 'scratch' ? 'scratch' : 'arduino');
            executed.push('switcheditor:' + parts[1]);
          }
          break;
        case 'setcode':
          if (parts.slice(1).join(':') && api.setEditorCode) {
            pendingEditorCode = parts.slice(1).join(':');
            api.setEditorCode(pendingEditorCode);
            executed.push('setcode');
          }
          break;
        case 'appendcode':
          if (parts.slice(1).join(':') && api.appendEditorCode) {
            api.appendEditorCode(parts.slice(1).join(':'));
            executed.push('appendcode');
          }
          break;
        case 'getcode':
          if (api.getEditorCode) {
            const code = api.getEditorCode();
            logger.info('[Lavagna] Editor code:', code?.slice(0, 200));
            executed.push('getcode');
          }
          break;
        case 'resetcode':
          api.resetEditorCode?.();
          executed.push('resetcode');
          break;
        case 'loadblocks':
          if (parts.slice(1).join(':') && api.loadScratchWorkspace) {
            const loaded = api.loadScratchWorkspace(parts.slice(1).join(':'));
            if (!actionReturnedFailure(loaded)) executed.push('loadblocks');
          }
          break;
        case 'fullscreenscratch':
          api.showEditor?.();
          api.setEditorMode?.('scratch');
          executed.push('fullscreenscratch');
          break;
        case 'exitscratchfullscreen':
          api.hideEditor?.();
          executed.push('exitscratchfullscreen');
          break;
        // ── Navigation ──
        case 'opentab': {
          const tab = parts[1];
          if (tab) {
            // Emit navigation event for the shell to handle
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab } }));
            executed.push('opentab:' + tab);
          }
          break;
        }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        case 'openvolume': {
          const vol = parseInt(parts[1], 10);
          const pag = parseInt(parts[2], 10) || 1;
          if (vol) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'manuale', volume: vol, page: pag } }));
            executed.push('openvolume:' + vol + ':' + pag);
          }
          break;
        }
        case 'openchat':
          window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'chat' } }));
          executed.push('openchat');
          break;
        case 'closechat':
          window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'simulatore' } }));
          executed.push('closechat');
          break;
        // ── Build Mode (Passo Passo) ──
        case 'setbuildmode':
          if (parts[1] && api.setBuildMode) {
            const modeMap = { montato: 'complete', passopasso: 'guided', libero: 'sandbox' };
            api.setBuildMode(modeMap[parts[1]] || parts[1]);
            executed.push('setbuildmode:' + parts[1]);
          }
          break;
        case 'nextstep':
          api.nextStep?.();
          executed.push('nextstep');
          break;
        case 'prevstep':
          api.prevStep?.();
          executed.push('prevstep');
          break;
        case 'showbom':
          api.showBom?.();
          executed.push('showbom');
          break;
        // ── Info Commands ──
        case 'listcomponents':
          if (api.getCircuitDescription) {
            const desc = api.getCircuitDescription();
            logger.info('[Lavagna] Components:', desc);
            executed.push('listcomponents');
          }
          break;
        case 'getstate':
          if (api.getSimulatorContext) {
            const ctx = api.getSimulatorContext();
            logger.info('[Lavagna] State:', ctx);
            executed.push('getstate');
          }
          break;
        case 'showserial':
          api.showSerialMonitor?.();
          executed.push('showserial');
          break;
        case 'serialwrite':
          if (parts[1] && api.serialWrite) {
            api.serialWrite(parts.slice(1).join(':'));
            executed.push('serialwrite');
          }
          break;
        case 'highlightpin':
          if (parts[1]) {
            const pinArg = parts.slice(1).join(':');
            const pins = pinArg.split(',').map(s => s.trim());
            api.highlightPin?.(pins);
            setTimeout(() => api.unlim?.clearHighlights?.(), 4000);
            executed.push('highlightpin:' + pinArg);
          }
          break;
        // ── Special ──
        case 'quiz':
          if (parts[1]) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'detective', experimentId: parts[1] } }));
            executed.push('quiz:' + parts[1]);
          }
          break;
        case 'youtube':
          if (parts.slice(1).join(' ')) {
            const query = encodeURIComponent(parts.slice(1).join(' '));
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'video', query: parts.slice(1).join(' ') } }));
            executed.push('youtube:' + parts.slice(1).join(' '));
          }
          break;
        case 'createnotebook':
          if (parts.slice(1).join(' ')) {
            window.dispatchEvent(new CustomEvent('elab-navigate', { detail: { tab: 'taccuini', title: parts.slice(1).join(' ') } }));
            executed.push('createnotebook');
          }
          break;
        default:
          logger.debug('[Lavagna] Unknown AZIONE:', cmd);
      }
    } catch (err) {
      logger.warn('[Lavagna] Action error:', cmd, err.message);
    }
  }

  return executed;
}

// ── INTENT tag parser — PlacementEngine for complex intents ──
function extractIntentTags(text) {
  const results = [];
  let idx = 0;
  while (idx < text.length) {
    const start = text.indexOf('[INTENT:{', idx);
    if (start === -1) break;
    const jsonStart = start + 8;
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) { jsonEnd = i + 1; break; }
      }
    }
    if (jsonEnd === -1) break;
    const closeIdx = text.indexOf(']', jsonEnd);
    if (closeIdx === -1) break;
    results.push({
      fullMatch: text.substring(start, closeIdx + 1),
      json: text.substring(jsonStart, jsonEnd),
    });
    idx = closeIdx + 1;
  }
  return results;
}

async function executeIntentTags(rawResponse) {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  if (!api) return [];

  const intentTags = extractIntentTags(rawResponse);
  if (intentTags.length === 0) return [];

  const executed = [];
  try {
    const { resolvePlacement } = await import('../simulator/engine/PlacementEngine');
    const layout = api.getLayout?.() || {};
    const snapshot = {
      components: layout.components || [],
      connections: layout.connections || [],
      layout: layout.layout || {},
      pinAssignments: layout.pinAssignments || {},
    };

    for (const tag of intentTags) {
      try {
        const intent = JSON.parse(tag.json);
        const result = resolvePlacement(intent, snapshot);
        if (result.success) {
          for (const action of result.actions) {
            if (action.type === 'addcomponent') {
              const tagMatch = action.tag.match(/addcomponent:([^:]+):(-?\d+):(-?\d+)/);
              if (tagMatch && api.addComponent) {
                const type = normalizeActionComponentType(tagMatch[1]);
                const addedId = api.addComponent(type, { x: parseInt(tagMatch[2], 10), y: parseInt(tagMatch[3], 10) });
                if (addedId) executed.push('addcomponent:' + addedId);
              }
            }
          }
          if (result.actions.some(a => a.type === 'addwire')) {
            await new Promise(r => setTimeout(r, 50));
          }
          for (const action of result.actions) {
            if (action.type === 'addwire') {
              const inner = action.tag.slice(action.tag.indexOf(':') + 1, -1);
              const parts = inner.split(':').map(s => s.trim());
              const pins = normalizeActionWirePins(parts);
              if (pins && api.addWire) {
                const result = api.addWire(pins[0], pins[1]);
                if (!actionReturnedFailure(result)) executed.push(`addwire:${pins[0]}->${pins[1]}`);
              }
            }
          }
        }
      } catch (err) {
        logger.warn('[Lavagna] INTENT parse error:', err.message);
      }
    }
  } catch (err) {
    logger.warn('[Lavagna] PlacementEngine import error:', err.message);
  }

  return executed;
}

// ── iter 37 Atom B-NEW — server-side intents_parsed dispatcher ──
// `executeServerIntents` lives in `./intentsDispatcher.js` so it can be
// unit-tested without rendering the React hook. Whitelist gate + error
// isolation per intent. See ADR-028 §14 surface-to-browser amend.

// ── Implicit intent detection — fallback when AI doesn't emit [AZIONE:] tags ──
// Scans user message + AI response for Italian patterns like "accendi", "evidenzia il LED", etc.
function detectImplicitActions(userMessage, aiResponse) {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  if (!api) return [];

  // Already has explicit tags? Skip fallback.
  if (/\[azione:/i.test(aiResponse) || /\[INTENT:\{/.test(aiResponse)) return [];

  const combined = (userMessage + ' ' + aiResponse).toLowerCase();
  const executed = [];

  // Play / run simulation
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  if (/\b(accendi|avvia|fai partire|esegui|simula|prova|play)\b/.test(combined) &&
      !/\b(non |senza |prima di )\b.*\b(accend|avvia|esegu)/.test(combined)) {
    api.play?.();
    executed.push('play');
  }

  // Pause / stop
  if (/\b(ferma|pausa|stop|spegni tutto)\b/.test(combined) && !executed.includes('play')) {
    api.pause?.();
    executed.push('pause');
  }

  // Highlight components — match "evidenzia il LED", "mostra il resistore R1"
  const highlightMatch = combined.match(/\b(?:evidenzia|mostra|indica|seleziona)\s+(?:il |la |lo |l'|i |le |gli )?(\w+)/);
  if (highlightMatch && api.unlim?.highlightComponent) {
    const target = highlightMatch[1];
    // Map common Italian names to component type IDs
    const componentMap = { led: 'led', resistore: 'resistor', resistenza: 'resistor', pulsante: 'push-button', buzzer: 'buzzer-piezo', potenziometro: 'potentiometer', batteria: 'battery9v', ldr: 'photo-resistor', fotoresistenza: 'photo-resistor' };
    const type = componentMap[target];
    if (type) {
      // Find all components of that type in the circuit
      const layout = api.getLayout?.();
      if (layout?.components) {
        const ids = layout.components.filter(c => c.type === type).map(c => c.id);
        if (ids.length > 0) {
          api.unlim.highlightComponent(ids);
          setTimeout(() => api.unlim?.clearHighlights?.(), 4000);
          executed.push('highlight:' + ids.join(','));
        }
      }
    }
  }

  // Undo / Redo
  if (/\b(annulla|undo)\b/.test(combined)) { api.undo?.(); executed.push('undo'); }
  if (/\b(ripeti|redo)\b/.test(combined)) { api.redo?.(); executed.push('redo'); }

  // Reset / clear
  if (/\b(pulisci|cancella tutto|reset|ricomincia)\b/.test(combined)) {
    api.clearAll?.();
    executed.push('clearall');
  }

  return executed;
}

// ── Strip action/intent tags from display text ──
function stripTagsForDisplay(text) {
  let stripped = text;
  for (const { fullMatch } of extractIntentTags(text)) {
    stripped = stripped.replace(fullMatch, '');
  }
  return stripped
    .replace(/\[azione:[^\]]+\]/gi, '')
    .replace(/\[AZIONE:[^\]]+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Display text policy ─────────────────────────────────────────────
// Non tronchiamo il testo generato: in sessioni reali il taglio lato client
// può eliminare la citazione Vol./pag. aggiunta dal post-processor o perdere
// un passaggio diagnostico importante. La brevità resta responsabilità del
// prompt/server; la UI mostra la risposta intera e pulita dai tag di controllo.
function prepareDisplayText(text) {
  return String(text || '').trim();
}

// ── Build tutor context for API calls ──
function buildTutorContext() {
  const api = typeof window !== 'undefined' && window.__ELAB_API;
  if (!api) return '';

  const parts = [];
  try {
    const exp = api.getActiveExperiment?.();
    if (exp) {
      parts.push('[Esperimento attivo: ' + (exp.title || exp.id) + ']');
    }
  } catch { /* silent */ }

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx) parts.push(typeof ctx === 'string' ? ctx : JSON.stringify(ctx));
  } catch { /* silent */ }

  // Volume context — injected by LavagnaShell when PDF viewer is open
  try {
    const vol = api._volumeContext;
    if (vol?.volumeNumber && vol?.page) {
      const volNames = { 1: 'Le Basi', 2: 'Approfondiamo', 3: 'Arduino' };
      parts.push(`[Volume aperto: Volume ${vol.volumeNumber} "${volNames[vol.volumeNumber] || ''}" — pagina ${vol.page}. Puoi fare riferimento al contenuto del manuale e suggerire al docente cosa mostrare ai ragazzi.]`);
    }
  } catch { /* silent */ }

  // Concept context — progressive analogies for active experiment
  try {
    const { getNewConcepts, getPrerequisites } = require('../../data/concept-graph');
    const exp = api.getActiveExperiment?.();
    if (exp?.id) {
      const newC = getNewConcepts(exp.id);
      const prereqs = getPrerequisites(exp.id);
      if (newC.length > 0 || prereqs.length > 0) {
        const analogies = [];
        if (prereqs.length > 0) {
          analogies.push('Concetti gia noti: ' + prereqs.map(p => `${p.name} (${p.analogy})`).join('; '));
        }
        if (newC.length > 0) {
          analogies.push('Concetti nuovi di oggi: ' + newC.map(c => `${c.name} — usa questa analogia: "${c.analogy}"`).join('; '));
        }
        parts.push(`[Contesto pedagogico — usa QUESTE analogie nelle risposte, non inventarne di nuove: ${analogies.join(' | ')}. La classe lavora INSIEME alla LIM col docente. Rispondi come se parlassi a tutta la classe.]`);
      }
    }
  } catch { /* silent */ }

  return parts.join('\n');
}

// ══════════════════════════════════════
// Chat persistence — localStorage
// ══════════════════════════════════════
const CHAT_STORAGE_KEY = 'elab-unlim-chat-history-v1';
const CHAT_MAX_MESSAGES = 100;
const THINKING_INDICATOR_DELAY_MS = 0;

function waitForUiFrame() {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise(resolve => {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function normalizeCircuitStateForDirectPath(circuitState) {
  if (!circuitState) return null;
  if (circuitState.structured) return circuitState.structured;
  if (circuitState.raw) return circuitState.raw;
  return circuitState;
}

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [WELCOME_MSG];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME_MSG];
    return parsed.filter(m => !m?.isSlowIndicator).slice(-CHAT_MAX_MESSAGES);
  } catch { return [WELCOME_MSG]; }
}

function saveChatHistory(messages) {
  try {
    const capped = messages.slice(-CHAT_MAX_MESSAGES);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(capped));
  } catch { /* storage full */ }
}

export const __test__ = {
  executeActionTags,
  executeActionTagsVerified,
  normalizeActionWirePins,
  normalizeActionComponentType,
  shouldUseVisualNarrative,
  normalizeCircuitStateForDirectPath,
  THINKING_INDICATOR_DELAY_MS,
};

// ══════════════════════════════════════
// HOOK: useGalileoChat
// ══════════════════════════════════════
export default function useGalileoChat() {
  const [messages, setMessages] = useState(() => loadChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const circuitStateRef = useRef(null);

  // Persist chat history on every change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Auto-reset loading if stuck > 30s
  useEffect(() => {
    if (!isLoading) return;
    const timeout = setTimeout(() => {
      logger.warn('[Lavagna] isLoading stuck 30s — auto-reset');
      setIsLoading(false);
    }, 30000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Listen for circuit state changes via __ELAB_API events
  useEffect(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api?.on) return;
    const handler = (ctx) => { circuitStateRef.current = ctx; };
    api.on('circuitChange', handler);
    return () => api.off?.('circuitChange', handler);
  }, []);

  // ── Send message ──
  const handleSend = useCallback(async (messageOverride) => {
    const userMessage = messageOverride || input;
    if (!userMessage.trim() || isLoading) return;

    const validation = validateMessage(userMessage);
    if (!validation.allowed) {
      setMessages(prev => [...prev,
        { id: Date.now(), role: 'user', content: userMessage },
        { id: Date.now() + 1, role: 'assistant', content: validation.message },
      ]);
      if (!messageOverride) setInput('');
      return;
    }

    const directOperationalCandidate = buildDirectOperationalResponse(
      userMessage,
      normalizeCircuitStateForDirectPath(circuitStateRef.current),
    );

    const rateCheck = checkRateLimit();
    if (!directOperationalCandidate && !rateCheck.allowed) {
      setMessages(prev => [...prev,
        { id: Date.now(), role: 'user', content: userMessage },
        { id: Date.now() + 1, role: 'assistant', content: rateCheck.message, isRateLimit: true },
      ]);
      if (!messageOverride) setInput('');
      return;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }

    const requestStartedAt = Date.now();
    const clearSlowIndicator = () => {
      setMessages(prev => prev.filter(m => !m.isSlowIndicator));
    };
    flushSync(() => {
      if (!messageOverride) setInput('');
      setMessages(prev => [...prev.filter(m => !m.isSlowIndicator), {
        id: requestStartedAt,
        role: 'user',
        content: userMessage,
      }]);
      setIsLoading(true);
    });
    await waitForUiFrame();

    const directOperational = directOperationalCandidate;
    if (directOperational) {
      const aiResponse = sanitizeOutput(directOperational.response);
      const displayText = prepareDisplayText(stripTagsForDisplay(aiResponse));
      const msgId = Date.now() + 1;

      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        content: displayText || aiResponse,
        source: directOperational.source,
        _executedActions: [],
      }]);
      clearSlowIndicator();
      setIsLoading(false);
      logLatency({
        latency_ms: Date.now() - requestStartedAt,
        ok: true,
        query_hash: userMessage.slice(0, 16),
        source: directOperational.source,
      });

      void (async () => {
        await waitForUiFrame();
        const actionVerification = await executeActionTagsVerified(aiResponse);
        const intentResults = await executeIntentTags(aiResponse);
        const allActions = [...actionVerification.executed, ...intentResults];
        if (allActions.length > 0) {
          setMessages(prev => prev.map(m =>
            m.id === msgId
              ? { ...m, _executedActions: allActions, _actionVerification: actionVerification.records }
              : m
          ));
        }
        const failedActions = actionVerification.records.filter(r => !r.ok);
        if (failedActions.length > 0) {
          const failedText = failedActions
            .slice(0, 2)
            .map(r => `${r.command}: ${r.reason}`)
            .join('; ');
          setMessages(prev => [...prev, {
            id: Date.now() + 2,
            role: 'assistant',
            content: `Ho provato l'azione, ma non la dichiaro eseguita: ${failedText}.`,
            isError: true,
            _actionVerification: actionVerification.records,
          }]);
        }
      })();
      return;
    }

    // ── Vision trigger: "guarda il circuito", "analizza", "cosa vedi", "controlla" ──
    if (shouldUseVisualNarrative(userMessage)) {
      try {
        const api = typeof window !== 'undefined' && window.__ELAB_API;
        const latestVisual = getLatestVisualSnapshotImage();
        const dataUrl = latestVisual?.dataUrl || await api?.captureScreenshot?.();
        if (dataUrl) {
          const simulatorContext = collectFullContext();
          const visionResult = await analyzeImage(dataUrl, userMessage, {
            circuitState: circuitStateRef.current,
            simulatorContext,
            preferProvider: 'pixtral',
            aiProfile: 'pixtral_total',
            aiDepth: 'total',
          });
          if (visionResult.success) {
            const cleaned = sanitizeOutput(typeof visionResult.response === 'string' ? visionResult.response : JSON.stringify(visionResult.response));
            setMessages(prev => [...prev, {
              id: Date.now() + 1, role: 'assistant',
              content: prepareDisplayText(stripTagsForDisplay(cleaned)),
              hasVision: true,
            }]);
            logLatency({
              latency_ms: Date.now() - requestStartedAt,
              ok: true,
              query_hash: userMessage.slice(0, 16),
              source: visionResult.source || 'vision',
            });
            clearSlowIndicator();
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        logger.warn('[useGalileoChat] Vision analysis failed:', err);
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: buildVisionUnavailableMessage(),
        hasVision: false,
        isError: true,
        retryMessage: userMessage,
      }]);
      logLatency({
        latency_ms: Date.now() - requestStartedAt,
        ok: false,
        query_hash: userMessage.slice(0, 16),
        source: 'vision-unavailable',
      });
      clearSlowIndicator();
      setIsLoading(false);
      return;
    }

    // ── Lesson preparation command (Principio Zero: Lavagna = interfaccia docente) ──
    if (isLessonPrepCommand(userMessage)) {
      try {
        const api = typeof window !== 'undefined' && window.__ELAB_API;
        const activeExp = api?.getActiveExperiment?.();
        const expId = activeExp?.id || null;

        if (!expId) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1, role: 'assistant',
            content: 'Scegli prima un esperimento, poi ti preparo la lezione! [AZIONE:loadexp:picker]',
          }]);
          clearSlowIndicator();
          setIsLoading(false);
          return;
        }

        // Fast local summary first
        const summary = getLessonSummary(expId);
        if (summary) {
          const introMsg = summary.isFirstTime
            ? `Preparo la lezione "${summary.title}"! Prima volta con questo esperimento.`
            : summary.needsReview
              ? `Riprendiamo "${summary.title}" — e passato un po' dall'ultima volta, faccio un ripasso.`
              : `Preparo "${summary.title}" — continuo da dove eravamo rimasti.`;
          setMessages(prev => [...prev, {
            id: Date.now() + 1, role: 'assistant',
            content: introMsg + `\n\nObiettivo: ${summary.objective}\nDurata: ~${summary.duration} min | Difficolta: ${'★'.repeat(summary.difficulty)}${'☆'.repeat(3 - summary.difficulty)}`,
            isLessonPrep: true,
          }]);
        }

        // Then AI-enhanced preparation
        const plan = await prepareLesson(expId, {
          circuitState: circuitStateRef.current,
          useAI: true,
        });

        if (plan.aiSuggestions) {
          // Strip action tags from lesson prep (no simulator actions during preparation)
          const cleanSuggestions = plan.aiSuggestions
            .replace(/\[azione:[^\]]+\]/gi, '')
            .replace(/\[AZIONE:[^\]]+\]/g, '')
            .replace(/\[INTENT:\{[^}]+\}\]/g, '')
            .trim();
          setMessages(prev => [...prev, {
            id: Date.now() + 2, role: 'assistant',
            content: cleanSuggestions,
            isLessonPrep: true,
            source: 'lesson-prep',
          }]);
        }

        // Show phases overview
        if (plan.phases?.length > 0) {
          const phasesText = plan.phases.map(p =>
            `${p.icon || '•'} **${p.name}** (${p.duration_minutes} min) — ${p.teacher_message?.slice(0, 80)}`
          ).join('\n');
          setMessages(prev => [...prev, {
            id: Date.now() + 3, role: 'assistant',
            content: `Ecco le fasi della lezione:\n\n${phasesText}\n\nDici "inizia" quando sei pronto!`,
            isLessonPrep: true,
          }]);
        }

        clearSlowIndicator();
        setIsLoading(false);
        return;
      } catch (err) {
        logger.warn('[useGalileoChat] Lesson prep failed:', err);
        // Fall through to normal chat
      }
    }

    const experimentContext = buildTutorContext();
    const api = typeof window !== 'undefined' && window.__ELAB_API;

    // UNLIM vede TUTTO: raccolta contesto completo prima di ogni sendChat
    const simulatorContext = collectFullContext();

    const activeExp = api?.getActiveExperiment?.() || api?.getCurrentExperiment?.();
    const result = await sendChat(userMessage, [], {
      socraticMode: true,
      experimentContext: experimentContext || null,
      circuitState: circuitStateRef.current
        ? (circuitStateRef.current.structured
          ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
          : { raw: circuitStateRef.current })
        : null,
      experimentId: activeExp?.id || null,
      simulatorContext,
    });

    if (result.success) {
      logLatency({
        latency_ms: Date.now() - requestStartedAt,
        ok: true,
        query_hash: userMessage.slice(0, 16),
        source: result.source || 'unknown',
      });
      const rawResponse = typeof result.response === 'string'
        ? result.response
        : (result.response ? JSON.stringify(result.response) : 'Errore: risposta non valida.');
      const aiResponse = sanitizeOutput(rawResponse);
      const displayText = prepareDisplayText(stripTagsForDisplay(aiResponse));
      const msgId = Date.now() + 1;

      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        content: displayText || aiResponse,
        source: result.source || null,
        _executedActions: [],
      }]);

      // Execute actions asynchronously — explicit tags first, then implicit fallback.
      // iter 37 Atom B-NEW: also dispatch server-parsed `intents_parsed` from
      // the Edge Function (ADR-028 §14 surface-to-browser pivot). Each entry
      // is whitelisted + dispatched via __ELAB_API with error isolation.
      const actionVerification = await executeActionTagsVerified(aiResponse);
      const actionResults = actionVerification.executed;
      const intentResults = await executeIntentTags(aiResponse);
      const serverIntentResults = await executeServerIntents(result.intentsParsed || []);
      const serverIntentLabels = serverIntentResults
        .filter(r => r.ok && r.action)
        .map(r => `intent:${r.action}`);
      const implicitResults = (actionResults.length === 0 && intentResults.length === 0 && serverIntentLabels.length === 0)
        ? detectImplicitActions(userMessage, aiResponse)
        : [];
      const allActions = [...actionResults, ...intentResults, ...serverIntentLabels, ...implicitResults];

      if (allActions.length > 0 || serverIntentResults.length > 0) {
        setMessages(prev => prev.map(m =>
          m.id === msgId
            ? { ...m, _executedActions: allActions, _intentsExecuted: serverIntentResults }
            : m
        ));
      }
      const failedActions = actionVerification.records.filter(r => !r.ok);
      if (failedActions.length > 0) {
        const failedText = failedActions
          .slice(0, 2)
          .map(r => `${r.command}: ${r.reason}`)
          .join('; ');
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          role: 'assistant',
          content: `Ho provato l'azione, ma non la dichiaro eseguita: ${failedText}.`,
          isError: true,
          _actionVerification: actionVerification.records,
        }]);
      }
    } else {
      logLatency({
        latency_ms: Date.now() - requestStartedAt,
        ok: false,
        query_hash: userMessage.slice(0, 16),
        source: result.source || 'unknown',
      });
      const errorMsg = result.error || result.response || 'Qualcosa non ha funzionato. Riprova tra qualche secondo.';
      let friendly = errorMsg;
      if (errorMsg.includes('Timeout') || errorMsg.includes('timeout')) {
        friendly = 'UNLIM ci sta mettendo un po\'. Riprova tra qualche secondo.';
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        friendly = 'Controlla la connessione internet e riprova.';
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        content: friendly, isError: true, retryMessage: userMessage,
      }]);
    }

    clearSlowIndicator();
    setIsLoading(false);
  }, [input, isLoading]);

  // ── Retry ──
  const handleRetry = useCallback((retryMessage) => {
    handleSend(retryMessage);
  }, [handleSend]);

  // ── Quick actions ──
  const quickActions = QUICK_ACTIONS.map(qa => ({
    text: qa.text,
    action: () => handleSend(QUICK_ACTION_MESSAGES[qa.key]),
  }));

  // ── Vision core: analizza images + aggiorna chat ──
  const processVisionImages = useCallback(async (images, userMessage, displayDataUrl) => {
    if (!Array.isArray(images) || images.length === 0) return;
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'user',
        content: userMessage || 'Analizza questa schermata del simulatore',
        image: displayDataUrl || undefined,
      }]);

      const result = await analyzeImage(
        images,
        userMessage || 'Analizza questa schermata del simulatore e dimmi se vedi qualcosa di sbagliato o se va tutto bene.',
        { circuitState: circuitStateRef.current, simulatorContext: collectFullContext(), preferProvider: 'pixtral', aiProfile: 'pixtral_total', aiDepth: 'total' }
      );

      if (result.success) {
        const cleaned = sanitizeOutput(typeof result.response === 'string' ? result.response : JSON.stringify(result.response));
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant', content: prepareDisplayText(stripTagsForDisplay(cleaned)),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: 'Non sono riuscito ad analizzare la schermata. Riprova!', isError: true,
        }]);
      }
    } catch (err) {
      logger.warn('[Lavagna] Vision error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Screenshot analysis ──
  const handleScreenshot = useCallback(async () => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api?.captureScreenshot) return;
    try {
      const dataUrl = await api.captureScreenshot();
      if (!dataUrl) return;
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      await processVisionImages(
        [{ base64, mimeType: 'image/png' }],
        'Analizza questa schermata del simulatore',
        dataUrl
      );
    } catch (err) {
      logger.warn('[Lavagna] Screenshot error:', err.message);
    }
  }, [processVisionImages]);

  // ── VisionButton bridge: ascolta CustomEvent 'elab-vision-capture' ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event) => {
      const detail = event?.detail || {};
      const { base64, mimeType } = detail;
      if (!base64 || typeof base64 !== 'string') return;
      const safeMime = mimeType || 'image/png';
      const displayDataUrl = `data:${safeMime};base64,${base64}`;
      processVisionImages(
        [{ base64, mimeType: safeMime }],
        'Guarda il mio circuito',
        displayDataUrl
      );
    };
    window.addEventListener('elab-vision-capture', handler);
    return () => window.removeEventListener('elab-vision-capture', handler);
  }, [processVisionImages]);

  // ── External send bridge: ascolta CustomEvent 'elab-unlim-send' ──
  // Used by wake word, percorso panel, error toast, experiment picker.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event) => {
      const text = event?.detail?.text;
      if (typeof text === 'string' && text.trim()) {
        handleSend(text);
      }
    };
    window.addEventListener('elab-unlim-send', handler);
    return () => window.removeEventListener('elab-unlim-send', handler);
  }, [handleSend]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    handleSend,
    handleRetry,
    quickActions,
    handleScreenshot,
    circuitStateRef,
  };
}
