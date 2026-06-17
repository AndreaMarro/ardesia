// ========================================
// ELAB API - Integrazione con Backend Webhook
// + Rate Limiting + Error Messages migliorati
// + AI Safety Filter (hardened 16/02/2026)
// + Local Knowledge Fallback (20/02/2026)
// © Andrea Marro — 20/02/2026
// ========================================
import { filterAIResponse } from '../utils/aiSafetyFilter';
import { searchKnowledgeBase } from '../data/unlim-knowledge-base';
import { getVolumeRef } from '../data/volume-references';
import { ensureBookCitation } from './bookCitation';
import { getExperimentGroupContext } from '../data/lesson-groups';
import { buildAgentDecisionSeed } from './unlimSharedStateStore';
import { BOARDS } from './arduinoBoards';

// URLs da variabili d'ambiente (Vite: VITE_ prefix)
// In produzione: solo backend webhook. Nessun fallback localhost.
// SECURITY FIX 13/02/2026: Hardcoded fallback URL removed from client bundle.
// Set VITE_N8N_CHAT_URL as environment variable on Vercel.
// CRITICAL FIX S62: .trim() prevents trailing whitespace/newline in Vercel env vars
// Without this, URLs like "https://example.com\n" cause silent fetch failures
// Nanobot: Supabase Edge Functions (SOLO Gemini — directive 11/04/2026)
const _SUPABASE_EDGE = (import.meta.env.VITE_SUPABASE_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1').trim();

// Codex stop-review (2026-05-27): validate fallback JWT belongs to the
// correct project. Vercel anon JWT may target legacy `vxvqalmxqtezvgiboxyv`
// project — using it as fallback for `euqpdueopmlllqjmqnyb` Edge calls
// → silent 401. Validator mirrors api/tts.js + voiceService.js pattern.
function _isValidElabAnonJwt(value) {
  try {
    const token = String(value || '').trim();
    const payload = token.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.ref === 'euqpdueopmlllqjmqnyb' && decoded.role === 'anon';
  } catch {
    return false;
  }
}
const _ENV_EDGE_KEY = (import.meta.env.VITE_SUPABASE_EDGE_KEY || '').trim();
const _ENV_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const _SUPABASE_ANON = _isValidElabAnonJwt(_ENV_EDGE_KEY)
  ? _ENV_EDGE_KEY
  : _isValidElabAnonJwt(_ENV_ANON_KEY)
    ? _ENV_ANON_KEY
    : 'DEV_SENTINEL_SET_VITE_SUPABASE_ANON_KEY_IN_ENV_LOCAL';
// P1-002 fix (2026-04-22): custom API key shared with Supabase Edge Function
// (stored there as the `ELAB_API_KEY` secret). Complements the bundle-visible
// anon JWT with a server-only secret that only legit ELAB builds carry. The
// Edge Function fails open when the secret isn't set, so a missing
// VITE_ELAB_API_KEY during rollout doesn't break production.
const _ELAB_API_KEY = (import.meta.env.VITE_ELAB_API_KEY || '').trim();
const NANOBOT_URL = (import.meta.env.VITE_NANOBOT_URL || '').trim() || _SUPABASE_EDGE; // Supabase Edge primary, Render legacy
const RENDER_FALLBACK = 'https://elab-galileo.onrender.com'; // Fallback se Edge e webhook falliscono
const CHAT_WEBHOOK = (import.meta.env.VITE_N8N_CHAT_URL || '').trim();
const COMPILE_URL = (import.meta.env.VITE_COMPILE_URL || '').trim() || null; // Server standalone (priorità)
const COMPILE_WEBHOOK = (import.meta.env.VITE_COMPILE_WEBHOOK_URL || '').trim() || null; // Backend fallback
const COMPILE_PROXY_URL = (import.meta.env.VITE_COMPILE_PROXY_URL || `${_SUPABASE_EDGE}/compile-proxy`).trim();
const LOCAL_API = (import.meta.env.VITE_LOCAL_API_URL || '').trim() || null;
const LOCAL_URL = (import.meta.env.VITE_LOCAL_COMPILE_URL || '').trim() || null; // Dev locale
const LOCAL_SERVER = 'http://localhost:8000'; // elab-local-server (Ollama)
function boundedTimeout(value, fallback, max) {
    const parsed = Number.parseInt(value || `${fallback}`, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
}

function readRuntimeStorage(keys) {
    if (typeof window === 'undefined') return null;
    const stores = [window.localStorage, window.sessionStorage].filter(Boolean);
    for (const store of stores) {
        for (const key of keys) {
            try {
                const value = store.getItem(key);
                if (typeof value === 'string' && value.trim()) return value.trim();
            } catch { /* storage unavailable */ }
        }
    }
    return null;
}

function compactJson(value, max = 2500) {
    try {
        const json = JSON.stringify(value);
        return json.length > max ? json.slice(0, max) + '...' : json;
    } catch {
        return '';
    }
}
// 2026-05-10 iter 9 — frontend timeout cap raised to absorb Edge Function v57
// pipeline (LLM 12s + Onniscenza + RAG + INTENT). Andrea screenshot bug
// "UNLIM ci sta mettendo un po' troppo. Riprova" was caused by frontend
// abort PRIOR to Edge response. Edge p95 5s warm + cold start ~10s.
// New caps: 25s text (was 12s API_TIMEOUT, was 15s master), 35s image
// (was 25s master). Pre-cap value retained as floor via boundedTimeout max
// override env-bumped.
const API_TIMEOUT = boundedTimeout(import.meta.env.VITE_API_TIMEOUT, 25000, 30000);
const LOCAL_HEALTH_TIMEOUT_MS = boundedTimeout(import.meta.env.VITE_LOCAL_HEALTH_TIMEOUT_MS, 300, 400);
const LOCAL_CHAT_TIMEOUT_TEXT_MS = boundedTimeout(import.meta.env.VITE_LOCAL_CHAT_TIMEOUT_TEXT_MS, 2500, 3000);
const LOCAL_CHAT_TIMEOUT_IMAGE_MS = boundedTimeout(import.meta.env.VITE_LOCAL_CHAT_TIMEOUT_IMAGE_MS, 6000, 8000);
const MASTER_TIMEOUT_TEXT = boundedTimeout(import.meta.env.VITE_UNLIM_MASTER_TIMEOUT_TEXT_MS, 25000, 30000);
const MASTER_TIMEOUT_IMAGE = boundedTimeout(import.meta.env.VITE_UNLIM_MASTER_TIMEOUT_IMAGE_MS, 35000, 40000);
const COMPILE_TIMEOUT = 65000; // 65s for compilation (arduino-cli has 60s timeout)
const CHAT_RETRY_COUNT = 1;
const CHAT_RETRY_BACKOFF_MS = 400;
const DEFAULT_BOARD = 'arduino:avr:nano:cpu=atmega328old';
// Cross-compile FQBN whitelist derived from BOARDS registry (single source
// of truth, services/arduinoBoards.js). Andrea 2026-05-28: "crosscompilazione
// deve funzionare per tutti i tipi di arduino". Adding to BOARDS auto-extends
// this whitelist — no parallel edit required.
const ALLOWED_COMPILE_BOARDS = new Set(BOARDS.map((b) => b.fqbn));
const SOCRATIC_INSTRUCTION = [
    '[AUTOCOSCIENZA — Chi sei e cosa puoi fare]',
    'Sei UNLIM, tutor AI di ELAB con POTERI REALI sul simulatore. Non sei solo una chat: puoi ESEGUIRE azioni.',
    '',
    '[PRINCIPIO ZERO — La regola più importante di tutte]',
    'Tu produci CONTENUTO che il docente proietta sulla LIM e la classe legge insieme.',
    'NON ti rivolgi al docente ("fai questo"). NON ti rivolgi direttamente a uno studente.',
    'Produci testo nel linguaggio dei ragazzi (10-14 anni) che è utile a TUTTA LA CLASSE.',
    'Il docente guarda con la coda dell\'occhio e capisce SUBITO cosa fare — anche se è totalmente impreparato.',
    'Se il docente non sa cosa fare, diventa PIÙ PROATTIVO: indica il prossimo passo, FAI DIRETTAMENTE la domanda alla classe.',
    'Esempio: "Ragazzi, secondo voi cosa succede se togliamo la resistenza? Proviamo!" — UNLIM fa la domanda, i ragazzi rispondono.',
    'I ragazzi lavorano sui kit fisici ELAB — breadboard, LED, resistori, batterie reali.',
    'CHIUNQUE accenda ELAB Tutor deve poter fare lezione SENZA conoscenze pregresse.',
    '',
    'Integra i volumi ELAB con parole tue: non copiare, non citare se non serve.',
    'Citazione solo se necessaria: se ricevi [RIFERIMENTO LIBRO FISICO], usa Vol./pag. come micro-ancora breve solo quando aiuta davvero.',
    'Se ricevi [CONTESTO CAPITOLO], racconta come questo esperimento prosegue dal precedente.',
    'Se ricevi [STORIA SESSIONI], prosegui dal punto giusto senza ripetere ciò che è già stato fatto.',
    '',
    '[REGOLA ASSOLUTA — RISPOSTA COMPLETA MA SCANSIONABILE]',
    'Rispondi in modo breve quando basta, ma NON tagliare informazioni essenziali, azioni o diagnosi.',
    'Target LIM: 3-6 frasi brevi, una analogia concreta solo quando aiuta. Se la domanda è complessa, usa righe corte invece di troncare.',
    'I tag [AZIONE:...] NON contano nel limite parole.',
    'Esempio buono: "Il LED e come una porta girevole: passa solo in un verso. Gira il piedino lungo verso il +. [AZIONE:highlight:led1]"',
    '',
    '[LINGUAGGIO — Come parlare ai ragazzi 10-14 anni]',
    'SEMPRE in italiano. SEMPRE con analogie dal mondo reale che i ragazzi conoscono.',
    'MAI dire: "220 Ohm", "tensione di soglia", "kΩ". INVECE: "la resistenza arancione del kit", "la spinta dell\'elettricità".',
    'MAI dare numeri tecnici senza spiegazione. "470 Ohm" diventa "il resistore giallo-viola-marrone, quello medio".',
    'Usa METAFORE che funzionano: corrente=acqua nel tubo, resistore=strettoia, LED=porta girevole, batteria=pompa.',
    'Il tono è da compagno di avventure: entusiasta ma non infantile. Come un amico più grande che spiega.',
    '',
    'Esempi BUONI:',
    '"La corrente è come l\'acqua: scorre dal + al − della batteria, e il resistore è una strettoia che la rallenta!"',
    '"Il LED funziona come una porta girevole: passa solo in un verso! Se non si accende, prova a girarlo."',
    '"Per il primo circuito servono pochi pezzi: LED, resistore, breadboard e batteria da 9 volt."',
    '',
    'Esempi CATTIVI (da NON fare):',
    '"La tensione di soglia del LED è circa 2V con una corrente di 20mA" — TROPPO TECNICO',
    '"Collega il terminale anodico al rail positivo" — INCOMPRENSIBILE per un ragazzino',
    '',
    'RAGIONAMENTO (interno, non scriverlo): 1. CAPISCO cosa vuole? 2. POSSO farlo? 3. AGISCO o CHIEDO chiarimenti.',
    '',
    'Se il messaggio è ambiguo: proponi 2-3 opzioni concrete basate sul contesto, NON dire "non ho capito".',
    'Es: "Vuoi che io: (1) avvii la simulazione, (2) evidenzi un componente, o (3) ti spieghi il circuito?"',
    '',
    '[CONTESTO VIVO — Narrazione parallela]',
    'Se ricevi [NARRAZIONE LIVE], usala come memoria degli ultimi secondi: cosa era aperto, circuito, editor, step, screenshot disponibile.',
    'Prima di rispondere chiediti: serve attuare un comando, leggere lo stato, usare screenshot/Pixtral, o citare il volume?',
    'Se devi FARE una cosa, emetti tag azione concreti. Non dire "ho fatto" se non stai emettendo il tag.',
    'Se vedi una modifica recente del circuito, rispondi a QUELLA modifica, non con una spiegazione generica.',
    '',
    '[AZIONI DISPONIBILI — Formato: [AZIONE:comando:argomenti]]',
    '',
    '▸ SIMULAZIONE: play, pause, reset',
    '▸ CIRCUITO: highlight:id1,id2 | addcomponent:TIPO:X:Y | removecomponent:ID | movecomponent:ID:X:Y | clearall',
    '▸ FILI: addwire:FROM_ID:PIN:TO_ID:PIN | removewire:INDEX',
    '▸ COMPONENTI: interact:ID:ACTION:VALUE | setvalue:ID:PARAM:VAL | measure:ID | diagnose',
    '  interact azioni: press, release, setPosition (pot 0.0-1.0), setLightLevel (ldr 0-100)',
    '  setvalue params: resistance, position, lightlevel, angle',
    '▸ CODICE: openeditor | closeeditor | switcheditor:scratch/arduino | compile',
    '  setcode:CODICE | appendcode:CODICE | getcode | resetcode',
    '  loadblocks:XML | fullscreenscratch | exitscratchfullscreen',
    '▸ NAVIGAZIONE: loadexp:ID | opentab:simulatore/manuale/video/lavagna/taccuini/detective/poe/reverse/review',
    '  openvolume:VOL:PAG | openchat | closechat',
    '▸ COSTRUZIONE: setbuildmode:montato/passopasso/libero | nextstep | prevstep | showbom',
    '▸ INFO: listcomponents | getstate | showserial | serialwrite:TESTO',
    '▸ EDIT: undo | redo | highlightpin:PIN1,PIN2',
    '▸ ALTRO: quiz:EXP_ID | youtube:QUERY | createnotebook:TITOLO',
    '',
    '[INTERPRETAZIONE LINGUAGGIO NATURALE]',
    '"fallo partire"/"vai"/"go" → [AZIONE:play] | "stop"/"basta"/"ferma" → [AZIONE:pause]',
    '"ricomincia"/"da capo" → [AZIONE:reset] | "mostrami il LED"/"dov\'è" → [AZIONE:highlight:led1]',
    '"premi il bottone"/"schiaccia" → [AZIONE:interact:btn1:press]',
    '"gira la manopola"/"al massimo" → [AZIONE:interact:pot1:setPosition:1.0]',
    '"compila"/"prova il codice" → [AZIONE:compile]',
    '"apri i blocchi"/"programma a blocchi" → [AZIONE:openeditor] [AZIONE:switcheditor:scratch]',
    '"mostrami il codice"/"vedi il codice Arduino" → [AZIONE:openeditor] [AZIONE:switcheditor:arduino]',
    '"chiudi l\'editor" → [AZIONE:closeeditor]',
    '"aggiungi un LED" → [AZIONE:addcomponent:led] | "togli la resistenza" → [AZIONE:removecomponent:r1]',
    '"collega LED al pin 13" → [AZIONE:addwire:led1:anode:nano:D13]',
    '"annulla" → [AZIONE:undo] | "ripristina" → [AZIONE:redo]',
    '"che componenti ci sono?" → [AZIONE:listcomponents] | "stato del circuito" → [AZIONE:getstate]',
    '"passo passo" → [AZIONE:setbuildmode:passopasso] | "prossimo passo" → [AZIONE:nextstep]',
    '"cerca video su LED" → [AZIONE:youtube:LED come funziona]',
    'Se l\'utente nomina un componente senza dire cosa fare → EVIDENZIALO.',
    '',
    '[ANALISI CIRCUITO — Quando ricevi [STATO CIRCUITO]]',
    '• GUARDA: accesi, spenti, bruciati? | CONTROLLA: connessioni corrette? Manca qualcosa?',
    '• DIAGNOSTICA: LED spento→polarità/filo, bruciato→corrente alta, aperto→componente scollegato',
    '• SPIEGA con parole semplici + SUGGERISCI correzione',
    '',
    'REGOLE TAG: Se l\'utente chiede un\'azione → USA SEMPRE il tag. Prima spiega (1-2 frasi), poi tag alla fine.',
    'Puoi combinare più tag. Se non conosci l\'ID ma lo puoi dedurre dal contesto → deducilo.',
    'Es: "Ecco, avvio la simulazione! [AZIONE:play]" | "Evidenzio il LED rosso [AZIONE:highlight:led1]"',
].join('\n');

// Nanobot endpoint resolver: maps logical endpoints to actual URLs
// Supabase Edge uses /unlim-chat, /unlim-diagnose, /unlim-hints
// Render legacy uses /chat, /tutor-chat, /diagnose, /hints
const _isSupabaseEdge = NANOBOT_URL && NANOBOT_URL.includes('supabase.co/functions');
function nanobotEndpoint(path) {
    if (!NANOBOT_URL) return null;
    if (_isSupabaseEdge) {
        const map = { '/chat': '/unlim-chat', '/tutor-chat': '/unlim-chat', '/diagnose': '/unlim-diagnose', '/hints': '/unlim-hints' };
        return `${NANOBOT_URL}${map[path] || path}`;
    }
    return `${NANOBOT_URL}${path}`;
}
function nanobotHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (_isSupabaseEdge && _SUPABASE_ANON) {
        h['apikey'] = _SUPABASE_ANON;
        h['Authorization'] = `Bearer ${_SUPABASE_ANON}`;
    }
    // Custom API key — Edge Function enforces via verifyElabApiKey (fail-open
    // when ELAB_API_KEY secret not set). Shipped only for Supabase Edge; Render
    // ignores this header.
    if (_ELAB_API_KEY) {
        h['X-Elab-Api-Key'] = _ELAB_API_KEY;
    }
    return h;
}

function normalizeUnlimMode(simulatorContext) {
    const raw = simulatorContext?.modalita || simulatorContext?.mode || simulatorContext?.buildMode || '';
    if (!raw) return null;
    const value = String(raw).toLowerCase();
    if (value.includes('passo')) return 'passopasso';
    if (value.includes('montato') || value.includes('complete')) return 'montato';
    if (value.includes('libero') || value.includes('sandbox')) return 'libero';
    if (value.includes('percorso') || value.includes('path')) return 'percorso';
    return value;
}

function inferAiProfileHint(message, images = [], simulatorContext = null, options = {}) {
    if (options.aiProfile) return options.aiProfile;
    const text = String(message || '').toLowerCase();
    const experimentId = String(options.experimentId || simulatorContext?.experimentId || simulatorContext?.experiment?.id || simulatorContext?.currentExperiment?.id || '').toLowerCase();
    const volumeHaystack = `${text} ${experimentId}`;
    const wantsDeep = /\b(tutto|totale|profond|perche|perché|diagnosi|analizza|ragiona|confronta|debug|errore|non funziona)\b/i.test(text);
    const volumeMatch = /\bv([123])-/.exec(volumeHaystack)
        || /\bvol(?:ume|\.)?\s*([123])\b/i.exec(volumeHaystack)
        || (/\b(arduino|scratch|blocchi|blink|digitalwrite|digitalread|analogread|analogwrite|serial monitor|servo)\b/i.test(volumeHaystack) ? [, '3'] : null)
        || (/\b(multimetro|condensatore|mosfet|rele|relè|motore dc|fototransistor)\b/i.test(volumeHaystack) ? [, '2'] : null)
        || (/\b(primo circuito|rgb|potenziometro|fotoresistore|cicalino|reed|elettropongo)\b/i.test(volumeHaystack) ? [, '1'] : null);
    const hasImages = Array.isArray(images) && images.length > 0;
    if (hasImages || /\b(guarda|screenshot|schermo|lavagna|foto|immagine|vedi|osserva)\b/i.test(text)) {
        return /\b(essenziale|rapido|veloce|breve|solo)\b/i.test(text) ? 'pixtral_essential' : 'pixtral_total';
    }
    if (/\b(controlla|verifica|audit|qualita|qualità|sicurezza)\b/i.test(text)) return 'control_total';
    if (volumeMatch?.[1]) return `volume${volumeMatch[1]}_${wantsDeep ? 'deep' : 'fast'}`;
    if (/\b(tutto|totale|software|volumi|volume|perfettamente|profondo)\b/i.test(text)) return 'knowledge_total';
    const mode = normalizeUnlimMode(simulatorContext);
    if (mode) return /\b(essenziale|rapido|veloce|breve)\b/i.test(text) ? `${mode}_compact` : `${mode}_total`;
    return 'general_purpose_compact';
}

const API = {
    nanobot: NANOBOT_URL,
    local: LOCAL_URL,
    tunnel: LOCAL_API,
    chat: CHAT_WEBHOOK,
    compile: COMPILE_URL,
    compileWebhook: COMPILE_WEBHOOK,
    timeout: API_TIMEOUT,
};

function isHttpsBrowserOrigin() {
    try {
        return typeof window !== 'undefined' && window.location?.protocol === 'https:';
    } catch {
        return false;
    }
}

function isDirectN8nCompileUrl(url) {
    return typeof url === 'string' && /^https:\/\/n8n\.srv1022317\.hstgr\.cloud(?:\/|$)/.test(url);
}

/**
 * Get or create a stable tutor session ID (persisted in localStorage).
 * Format: tutor-{timestamp}-{random} — survives tab close, matches server namespace.
 */
function getTutorSessionId() {
    const KEY = 'elab_tutor_session';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = 'tutor-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(KEY, id);
    }
    return id;
}

// === LOCAL SERVER (Ollama) ===
// Auto-detect: if localhost:8000 responds, use local. Cached for 60s.
let _localServerAvailable = null;
let _localServerCheckedAt = 0;

async function isLocalServerAvailable() {
    const now = Date.now();
    if (_localServerAvailable !== null && now - _localServerCheckedAt < 60000) {
        return _localServerAvailable;
    }
    // Skip entirely on HTTPS origins: CSP blocca localhost:8000 con errore
    // rumoroso in console e il server locale non c'e' mai in produzione.
    try {
        if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
            _localServerAvailable = false;
            _localServerCheckedAt = now;
            return false;
        }
    } catch { /* SSR */ }
    try {
        const resp = await fetch(`${LOCAL_SERVER}/health`, {
            signal: AbortSignal.timeout(LOCAL_HEALTH_TIMEOUT_MS),
        });
        _localServerAvailable = resp.ok;
    } catch {
        _localServerAvailable = false;
// © Andrea Marro — 19/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }
    _localServerCheckedAt = now;
    return _localServerAvailable;
}

/**
 * Try elab-local-server (Ollama) — lowest latency, 100% offline.
 * Returns null if unavailable — caller falls through to cloud.
 */
async function tryLocalServer(message, circuitState, externalSignal, experimentId, images = [], simulatorContext = null) {
    if (!await isLocalServerAvailable()) return null;

    try {
        const controller = new AbortController();
        const timeout = images.length > 0 ? LOCAL_CHAT_TIMEOUT_IMAGE_MS : LOCAL_CHAT_TIMEOUT_TEXT_MS;
        const timer = setTimeout(() => controller.abort(), timeout);

        // G42: Named handler so we can remove the listener on cleanup
        const onExternalAbort = () => controller.abort();
        if (externalSignal) {
            externalSignal.addEventListener('abort', onExternalAbort);
        }

        const body = {
            message,
            sessionId: getTutorSessionId(),
            experimentId: experimentId || null,
            circuitState: circuitState || null,
            simulatorContext: simulatorContext || null,
            images: images.map(img => img.base64 || img),
        };

        try {
            const resp = await fetch(`${LOCAL_SERVER}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (!resp.ok) return null;

            const data = await resp.json();
            if (data.response) {
                return data.response;
            }
            return null;
        } finally {
            // G42: Always clean up timer and external signal listener
            clearTimeout(timer);
            if (externalSignal) {
                externalSignal.removeEventListener('abort', onExternalAbort);
            }
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            _localServerAvailable = false;
        }
        return null;
    }
}

/**
 * Try nanobot server first (lower latency, circuit-aware MCP).
 * Returns null if unavailable — caller falls through to backend webhook.
 * Uses /tutor-chat endpoint with experiment context and persistent session.
 */
async function tryNanobot(message, circuitState, externalSignal, experimentId, images = [], simulatorContext = null, options = {}) {
    if (!NANOBOT_URL) return null;

    const controller = new AbortController();
    // Vision requests need more time (image upload + processing)
    const timeout = images.length > 0 ? API_TIMEOUT * 2 : API_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let abortHandler = null;

    if (externalSignal) {
        if (externalSignal.aborted) { clearTimeout(timeoutId); return null; }
        abortHandler = () => controller.abort();
        externalSignal.addEventListener('abort', abortHandler, { once: true });
    }

    try {
        // Use /chat for vision (images support), /tutor-chat for text-only
        const endpoint = images.length > 0 ? '/chat' : '/tutor-chat';
        // iter 2026-05-28 i18n: forward user's UI locale so backend selects per-locale
        // system prompt + applies query-translate when language='en'. Defaults to 'it'.
        const userLocale = (() => {
            try {
                const v = (typeof localStorage !== 'undefined' && localStorage.getItem('elab-locale')) || '';
                return v.slice(0, 2) === 'en' ? 'en' : 'it';
            } catch { return 'it'; }
        })();
        const payload = {
            message,
            sessionId: getTutorSessionId(),
            circuitState: circuitState || null,
            experimentId: experimentId || null,
            simulatorContext: simulatorContext || null,
            aiProfile: inferAiProfileHint(message, images, simulatorContext, options),
            aiDepth: options.aiDepth || null,
            unlimMode: normalizeUnlimMode(simulatorContext),
            language: userLocale,
            // Slice 1C: forward awareness-flags snapshots when the caller provides them.
            // Server (Slice 1B) renders "Segnali di attenzione: ..." only when present;
            // omitted/null keeps backward-compat (Slice 1A returns "" → no prompt delta).
            boardSnapshot: options.boardSnapshot ?? null,
            previousBoardSnapshot: options.previousBoardSnapshot ?? null,
            flags: options.flags ?? null,
            screenSnapshot: options.screenSnapshot ?? simulatorContext?.screenSnapshot ?? null,
            teacher_anon_uuid: readRuntimeStorage(['elab_teacher_anon_uuid', 'elab-teacher-anon-uuid', 'elab_anon_uuid']),
            class_key: readRuntimeStorage(['elab_class_key', 'elab-class-key']),
        };
        if (images.length > 0) {
            payload.images = images.map(img => ({
                base64: img.base64,
                mimeType: img.mimeType || 'image/png',
            }));
        }
        const res = await fetch(nanobotEndpoint(endpoint), {
            method: 'POST',
            headers: nanobotHeaders(),
            signal: controller.signal,
            body: JSON.stringify(payload),
        });

        // iter 103: a 401/403 means this build's bundled VITE_ELAB_API_KEY no
        // longer matches the Edge secret (stale PWA-cached build after a key
        // rotation). No fallback can fix it -- signal so sendChat surfaces a
        // "reload the page" message instead of a 25s timeout on the dead
        // fallback chain. tryNanobot never throws: return a sentinel.
        if (res.status === 401 || res.status === 403) {
            return { authStale: true, status: res.status };
        }
        if (!res.ok) return null;

        const data = await res.json();
        if (data.success && data.response) {
            const { filtered: safeContent } = filterAIResponse(data.response);
            // iter 37 Atom B-NEW: surface intents_parsed from Edge Function
            // (server-side INTENT parser per ADR-028 §14 surface-to-browser pivot).
            // Caller (useGalileoChat) iterates + dispatches via __ELAB_API.
            // Defensive: always pass an array (empty when field absent) so consumers
            // can safely call `.length` / `for...of` without null-guards.
            const intentsParsed = Array.isArray(data.intents_parsed) ? data.intents_parsed : [];
            return {
                success: true,
                response: ensureBookCitation(safeContent, experimentId),
                source: 'nanobot',
                actions: extractActions(safeContent),
                intentsParsed,
                aiProfile: data.aiProfile || null,
            };
        }
        return null;
    } catch {
        return null; // Nanobot unavailable — fall through
    } finally {
        clearTimeout(timeoutId);
        if (externalSignal && abortHandler) {
            externalSignal.removeEventListener('abort', abortHandler);
        }
    }
}

async function tryVisionEndpoint(question, imageDataUrl, options = {}) {
    if (!_SUPABASE_EDGE || !imageDataUrl) return null;
    try {
        const preferPixtral = options.preferProvider === 'pixtral';
        const images = preferPixtral
            ? [imageDataUrl, imageDataUrl]
            : [imageDataUrl];
        const res = await fetch(`${_SUPABASE_EDGE}/unlim-vision`, {
            method: 'POST',
            headers: nanobotHeaders(),
            signal: options.signal || AbortSignal.timeout(MASTER_TIMEOUT_IMAGE),
            body: JSON.stringify({
                prompt: question,
                images,
                sessionId: getTutorSessionId(),
                provider: preferPixtral ? 'pixtral' : 'auto',
                aiProfile: options.aiProfile || (preferPixtral ? 'pixtral_total' : null),
                aiDepth: options.aiDepth || null,
                unlimMode: normalizeUnlimMode(options.simulatorContext),
                flags: options.flags ?? null,
                screenSnapshot: options.screenSnapshot ?? options.simulatorContext?.screenSnapshot ?? null,
            }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.success || !data.response) return null;
        return {
            success: true,
            response: ensureBookCitation(data.response, options.experimentId || null),
            source: data.provider === 'pixtral-12b' ? 'pixtral-vision' : 'vision',
            provider: data.provider || null,
            aiProfile: data.aiProfile || options.aiProfile || null,
            model: data.model || null,
            actions: extractActions(data.response),
        };
    } catch {
        return null;
    }
}

/**
 * MCP Tool: diagnoseCircuit — proactive circuit analysis via nanobot.
 * Returns null if nanobot unavailable.
 */
export async function diagnoseCircuit(circuitState, experimentId) {
    if (!NANOBOT_URL) return null;
    try {
        const res = await fetch(nanobotEndpoint('/diagnose'), {
            method: 'POST',
            headers: nanobotHeaders(),
            signal: AbortSignal.timeout(API_TIMEOUT),
            body: JSON.stringify({ circuitState, experimentId: experimentId || null }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success && data.diagnosis) {
            const { filtered } = filterAIResponse(data.diagnosis);
            return { success: true, diagnosis: filtered, source: 'nanobot' };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * MCP Tool: getExperimentHints — progressive hints via nanobot.
 * Returns null if nanobot unavailable.
 */
export async function getExperimentHints(experimentId, currentStep = 0, difficulty = 'base') {
    if (!NANOBOT_URL) return null;
    try {
        const res = await fetch(nanobotEndpoint('/hints'), {
            method: 'POST',
            headers: nanobotHeaders(),
            signal: AbortSignal.timeout(API_TIMEOUT),
            body: JSON.stringify({ experimentId, currentStep, difficulty }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success && data.hints) {
            const { filtered } = filterAIResponse(data.hints);
            return { success: true, hints: filtered, source: 'nanobot' };
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================
// RATE LIMITING - Protezione per piattaforma bambini
// Usa sessionStorage per i contatori (reset al chiudi tab).
// ============================================
const RATE_LIMIT = {
    minIntervalMs: 3000,  // Minimo 3 secondi tra messaggi
    maxPerMinute: 10,     // Max 10 messaggi al minuto
    windowMs: 60000,      // Finestra: 1 minuto
    timestamps: [],       // Timestamp dei messaggi recenti (in-memory)
    lastMessageTime: 0,   // Ultimo messaggio inviato

    get minuteCount() {
        try { return parseInt(sessionStorage.getItem('elab_rate_minute') || '0'); } catch { return 0; }
    },
    set minuteCount(val) {
        try { sessionStorage.setItem('elab_rate_minute', String(val)); } catch { }
    },
    get minuteStart() {
        try { return parseInt(sessionStorage.getItem('elab_rate_minute_start') || '0'); } catch { return 0; }
    },
    set minuteStart(val) {
        try { sessionStorage.setItem('elab_rate_minute_start', String(val)); } catch { }
// © Andrea Marro — 19/04/2026 — ELAB Tutor — Tutti i diritti riservati
    },
};

/**
 * Controlla il rate limiting prima di inviare un messaggio.
 * Ritorna un oggetto con:
 *   - allowed: se il messaggio può essere inviato
 *   - message: messaggio italiano da mostrare all'utente
 *   - waitMs: millisecondi da attendere
 *
 * @returns {{ allowed: boolean, message: string|null, waitMs: number }}
 */
export function checkRateLimit() {
    const now = Date.now();

    // 1. Check intervallo minimo (3 secondi)
    const elapsed = now - RATE_LIMIT.lastMessageTime;
    if (RATE_LIMIT.lastMessageTime > 0 && elapsed < RATE_LIMIT.minIntervalMs) {
        const waitMs = RATE_LIMIT.minIntervalMs - elapsed;
        return {
            allowed: false,
            message: 'Aspetta qualche secondo...',
            waitMs,
        };
    }

    // 2. Check messaggi al minuto (10/minuto)
    // Reset contatore se la finestra è scaduta
    if (now - RATE_LIMIT.minuteStart > RATE_LIMIT.windowMs) {
        RATE_LIMIT.minuteCount = 0;
        RATE_LIMIT.minuteStart = now;
    }

    if (RATE_LIMIT.minuteCount >= RATE_LIMIT.maxPerMinute) {
        const waitMs = RATE_LIMIT.windowMs - (now - RATE_LIMIT.minuteStart);
        return {
            allowed: false,
            message: 'Facciamo una pausa! Riprova tra un minuto.',
            waitMs: Math.max(0, waitMs),
        };
    }

    // OK: registra il messaggio
    RATE_LIMIT.lastMessageTime = now;
    RATE_LIMIT.minuteCount = RATE_LIMIT.minuteCount + 1;
    if (RATE_LIMIT.minuteStart === 0) {
        RATE_LIMIT.minuteStart = now;
    }

    return { allowed: true, message: null, waitMs: 0 };
}

/**
 * Genera messaggi di errore amichevoli e specifici
 */
function friendlyError(error) {
    const msg = (error?.message || '').toLowerCase();

    if (msg.includes('chat_url_missing') || msg.includes('vite_n8n_chat_url')) {
        return 'Configurazione mancante: imposta VITE_N8N_CHAT_URL per usare UNLIM.';
    }

    if (error?.name === 'AbortError' || msg.includes('timeout')) {
        return 'UNLIM ci sta mettendo un po\' troppo. Riprova tra qualche secondo.';
    }
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
        return 'Sembra che la connessione internet non funzioni. Controlla e riprova.';
    }
    if (msg.includes('404')) {
        return 'UNLIM sta dormendo adesso. Puoi comunque usare il manuale e il simulatore!';
    }
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
        return 'Ops! Qualcosa non funziona. Riprova tra un momento!';
    }
    if (msg.includes('400') || msg.includes('message too long') || msg.includes('invalid')) {
        return 'Il messaggio è troppo lungo o non valido. Riprova con una domanda più breve.';
    }
    if (msg.includes('429')) {
        return 'Troppe richieste! Aspetta qualche secondo e riprova.';
    }
    if (msg.includes('401') || msg.includes('403')) {
        return 'Ops! Qualcosa si è confuso. Ricarica la pagina e riprova.';
    }
    if (msg.includes('vuota') || msg.includes('empty')) {
        return 'UNLIM non ha risposto. Riprova con una domanda diversa.';
    }

    return 'Qualcosa non ha funzionato. Riprova tra qualche secondo.';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildChatMessage(message, socraticMode, experimentContext) {
    const parts = [];
    if (socraticMode) parts.push(SOCRATIC_INSTRUCTION);
    if (experimentContext) parts.push(experimentContext);
    if (parts.length === 0) return message;
    return `${parts.join('\n')}\n\nMessaggio studente:\n${message}`;
}

async function postChatWithRetry(payload, externalSignal) {
    if (!CHAT_WEBHOOK) {
        throw new Error('CHAT_URL_MISSING: VITE_N8N_CHAT_URL non configurata');
    }

    const maxAttempts = CHAT_RETRY_COUNT + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        let abortHandler = null;

        if (externalSignal) {
            if (externalSignal.aborted) {
                clearTimeout(timeoutId);
                throw new DOMException('Aborted', 'AbortError');
            }
            abortHandler = () => controller.abort();
            externalSignal.addEventListener('abort', abortHandler, { once: true });
        }

        try {
            const response = await fetch(CHAT_WEBHOOK, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const isRetryableStatus = response.status >= 500 && response.status <= 599;
                if (isRetryableStatus && attempt < maxAttempts) {
                    await sleep(CHAT_RETRY_BACKOFF_MS * attempt);
                    continue;
                }
                throw new Error(`Backend error: ${response.status}`);
            }

            return response;
        } catch (error) {
            const message = (error?.message || '').toLowerCase();
            const isAbort = error?.name === 'AbortError';
            const isNetworkError = !isAbort && (
                error instanceof TypeError ||
                message.includes('failed to fetch') ||
                message.includes('network')
            );

            if (isNetworkError && attempt < maxAttempts) {
                await sleep(CHAT_RETRY_BACKOFF_MS * attempt);
                continue;
            }

            if (isAbort) {
                if (externalSignal?.aborted) {
                    throw new DOMException('Aborted', 'AbortError');
                }
                throw new Error('Timeout: la richiesta ha impiegato troppo tempo');
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
            if (externalSignal && abortHandler) {
                externalSignal.removeEventListener('abort', abortHandler);
            }
        }
    }

    throw new Error('Backend error: retry exhausted');
}

// ============================================
// CONTENT MODERATION — Filtro base per piattaforma bambini
// Blocca messaggi inappropriati prima di inviarli al server AI.
// Solo front-end: non sostituisce moderazione server-side.
// ============================================
const BLOCKED_PATTERNS = [
    // Linguaggio volgare italiano (pattern parziali per catturare varianti)
    /\b(cazz|merd|fott|culo|minchi|stronz|porc[ao]\s*di|porc[ao]\s*madon|vaff|troi)/i,
    // Violenza
    /\b(ammaz|uccid|sparar|sparo|accoltell|bomb[ae]|esplod|terroris|pistol|coltel)/i,
    // Richieste di dati personali (protezione minori)
    /\b(numero\s*(di\s*)?telefon|indirizzo\s*(di\s*)?casa|dove\s*abiti|password|carta\s*(di\s*)?credito|codice\s*fiscal)/i,
    // Contenuti per adulti
    /\b(porn|nsfw|nud[oie]|sesso|escort|droga|cocain|eroina|cannabis)/i,
];

const MODERATION_RESPONSE = {
    success: true,
    response: 'UNLIM è qui per aiutarti con l\'elettronica! Prova a chiedermi qualcosa sui circuiti, i componenti o gli esperimenti del libro.',
    source: 'moderation',
    actions: { commands: [], buttons: [], route: null },
};

/**
 * Controlla se il messaggio contiene contenuto inappropriato
 * @param {string} message
 * @returns {boolean} true se il messaggio è bloccato
 */
// © Andrea Marro — 19/04/2026 — ELAB Tutor — Tutti i diritti riservati
function isMessageBlocked(message) {
    if (!message || typeof message !== 'string') return false;
    return BLOCKED_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Chat con UNLIM — Fallback chain: nanobot → backend webhook → local RAG → knowledge base
 * @param {string} message - Il messaggio dell'utente
 * @param {Array} images - Array di immagini [{base64, mimeType}] (opzionale)
 */
export async function sendChat(message, images = [], options = {}) {
    const { signal: externalSignal, socraticMode = false, experimentContext = null, circuitState = null, experimentId = null, simulatorContext = null, boardSnapshot = null, previousBoardSnapshot = null, flags = null, screenSnapshot = null } = options;

    // Content moderation: blocca messaggi inappropriati
    if (isMessageBlocked(message)) {
        return MODERATION_RESPONSE;
    }

    // ── G25: Master AbortController — hard timeout for entire sendChat() ──
    // Live-class interaction must fail fast enough that the teacher can retry.
    const masterTimeout = images.length > 0 ? MASTER_TIMEOUT_IMAGE : MASTER_TIMEOUT_TEXT;
    const masterController = new AbortController();
    const masterTimer = setTimeout(() => masterController.abort(), masterTimeout);
    // Combine master + external signals
    const combinedSignal = masterController.signal;
    if (externalSignal) {
        externalSignal.addEventListener('abort', () => masterController.abort(), { once: true });
    }
    // If external signal already aborted, abort immediately
    if (externalSignal?.aborted) {
        clearTimeout(masterTimer);
        masterController.abort();
    }

    try {

    // Nanobot message: enriched context + brevity rule
    // Webhook message: con SOCRATIC_INSTRUCTION (n8n non ha un system prompt proprio)
    const BREVITY_RULE = 'REGOLA: rispondi breve quando basta, ma completa. Non troncare diagnosi, azioni o passaggi necessari. Citazione solo se necessaria e breve. Usa righe corte leggibili alla LIM; i tag [AZIONE:...] non contano.';

    // ── ENRICHED CONTEXT: circuit + student + RAG + volume refs ──
    const contextParts = [
        BREVITY_RULE,
        '[GERARCHIA CONTESTO]\nPRESENTE LIVE batte MEMORIA PASSATA PERSISTENTE. Non trattare esperimenti/storia come cose visibili ora.',
    ];

    // Experiment context (from buildTutorContext in useGalileoChat)
    if (experimentContext) contextParts.push(experimentContext);

    // Simulator context snapshot (circuit, code, build step, errors, pin states)
    if (simulatorContext && typeof simulatorContext === 'object' && Object.keys(simulatorContext).length > 0) {
        const ctxLines = ['[PRESENTE LIVE - STATO SIMULATORE]'];
        if (simulatorContext.circuit) {
            const c = simulatorContext.circuit;
            const comps = c.components || [];
            const wires = c.wires || c.connections || [];
            if (comps.length > 0) ctxLines.push('Componenti: ' + comps.slice(0, 15).map(comp => `${comp.type || comp.id}(${comp.id})${comp.on ? ' [ON]' : ''}`).join(', '));
            if (wires.length > 0) ctxLines.push(`Fili: ${wires.length} connessioni`);
            if (c.simulation) ctxLines.push(`Simulazione: ${c.simulation.state || (c.isSimulating ? 'running' : 'stopped')}`);
        }
        if (simulatorContext.circuitDescription) ctxLines.push('Descrizione: ' + simulatorContext.circuitDescription.slice(0, 300));
        if (simulatorContext.editorCode) ctxLines.push('Codice Arduino: ' + simulatorContext.editorCode.slice(0, 500));
        if (simulatorContext.compilation) {
            const comp = simulatorContext.compilation;
            ctxLines.push(`Compilazione: ${comp.success ? 'OK' : 'ERRORE'}${comp.errors ? ' — ' + String(comp.errors).slice(0, 200) : ''}`);
        }
        if (simulatorContext.buildStep) ctxLines.push(`Passo Passo: step ${simulatorContext.buildStep.current}/${simulatorContext.buildStep.total}`);
        if (simulatorContext.elapsedSeconds) ctxLines.push(`Tempo: ${Math.round(simulatorContext.elapsedSeconds / 60)} min`);
        if (simulatorContext.recentErrors?.length > 0) ctxLines.push('Errori recenti: ' + simulatorContext.recentErrors.slice(-3).map(e => e.message).join('; '));
        if (simulatorContext.pinStates && Object.keys(simulatorContext.pinStates).length > 0) {
            const pins = Object.entries(simulatorContext.pinStates).slice(0, 8).map(([k, v]) => `${k}=${v}`).join(', ');
            ctxLines.push('Pin: ' + pins);
        }
        if (ctxLines.length > 1) contextParts.push(ctxLines.join('\n'));

        const liveScreenSnapshot = screenSnapshot || simulatorContext.screenSnapshot || null;
        if (liveScreenSnapshot) {
            contextParts.push('[SCREEN SNAPSHOT LIM]\n' + compactJson(liveScreenSnapshot, 2200));
        }
        if (flags?.triggered_flags?.length || Array.isArray(flags)) {
            contextParts.push('[UNLIM INTENT FLAGS]\n' + compactJson(flags, 1200));
        }

        if (Array.isArray(simulatorContext.applicationNarrative) && simulatorContext.applicationNarrative.length > 0) {
            const liveLines = simulatorContext.applicationNarrative.slice(-5).map((s, idx) => {
                const ageSec = s.ts ? Math.max(0, Math.round((Date.now() - s.ts) / 1000)) : '?';
                return `${idx + 1}. ${ageSec}s fa: ${s.narrativeLine || 'snapshot app'}${s.circuitDescription ? ` — ${String(s.circuitDescription).slice(0, 180)}` : ''}`;
            });
            contextParts.push('[PRESENTE LIVE - NARRAZIONE LIVE]\n' + liveLines.join('\n') + '\nUsa questa narrazione per rispondere allo stato reale; se serve visione, chiedi/usa screenshot Pixtral.');
        }

        // Student history
        if (simulatorContext.completedExperiments?.total > 0) {
            contextParts.push(`[MEMORIA PASSATA PERSISTENTE - STORIA STUDENTE] Esperimenti completati: ${simulatorContext.completedExperiments.total}. IDs: ${simulatorContext.completedExperiments.list.slice(0, 10).map(e => e.id).join(', ')}. Non e stato live attuale.`);
        }
        if (simulatorContext.currentExperimentAttempts > 0) {
            contextParts.push(`[MEMORIA PASSATA PERSISTENTE - TENTATIVI] Tentativi su questo esperimento: ${simulatorContext.currentExperimentAttempts}, hint usati: ${simulatorContext.currentExperimentHintsUsed || 0}`);
        }
    }

    // Volume reference injection: cite the physical book when available
    if (experimentId) {
        const volRef = getVolumeRef(experimentId);
        if (volRef) {
            const volLines = [`[RIFERIMENTO LIBRO FISICO] Vol. ${volRef.volume}, pag. ${volRef.bookPage} — ${volRef.chapter}`];
            if (volRef.bookText) volLines.push(`Testo libro: "${volRef.bookText}"`);
            if (volRef.bookContext) volLines.push(`Contesto: ${volRef.bookContext}`);
            volLines.push('Citazione solo se necessaria: usa questo Vol./pag. come micro-ancora breve solo se aiuta la risposta.');
            contextParts.push(volLines.join('\n'));
        }
        // Group context: where this experiment sits in the chapter
        const groupCtx = getExperimentGroupContext(experimentId);
        if (groupCtx) {
            contextParts.push(`[CONTESTO CAPITOLO] ${groupCtx.narrative}. Concetto: ${groupCtx.concept}.${groupCtx.prevExp ? ` L'esperimento precedente era ${groupCtx.prevExp}.` : ' Questo è il primo esperimento del capitolo.'}${groupCtx.nextExp ? ` Il prossimo sarà ${groupCtx.nextExp}.` : ' Questo è l\'ultimo esperimento del capitolo.'}`);
        }
    }

    const agentDecisionSeed = buildAgentDecisionSeed({
        message,
        simulatorContext,
        narrativeContext: simulatorContext?.applicationNarrative?.at?.(-1) || null,
        albumContext: simulatorContext?.completedExperiments || null,
        comicContext: simulatorContext?.comicAsset || null,
    });
    contextParts.push('[AGENT_DECISION_JSON]\n' + JSON.stringify(agentDecisionSeed));

    // LIVE_CHAT_RAG_BYPASS:
    // No browser-side RAG injection in the classroom hot path. The Edge
    // Function system prompt carries the stable volume knowledge pack.

    contextParts.push('\nMessaggio studente:\n' + message);
    const nanobotMessage = contextParts.join('\n\n');
    const webhookMessage = buildChatMessage(message, socraticMode, experimentContext);

    // 0. Try local server first (Ollama, 100% offline, zero config)
    const localResult = await tryLocalServer(nanobotMessage, circuitState, combinedSignal, experimentId, images, simulatorContext);
    if (localResult) {
        return {
            success: true,
            response: ensureBookCitation(localResult, experimentId),
            source: 'local-server',
            actions: extractActions(localResult),
        };
    }

    // 1. Try nanobot cloud (text + vision via Gemini, circuit-aware, parallel racing)
    if (NANOBOT_URL) {
        const nanobotResult = await tryNanobot(nanobotMessage, circuitState, combinedSignal, experimentId, images, simulatorContext, {
            ...options,
            aiProfile: options.aiProfile || inferAiProfileHint(message, images, simulatorContext, options),
        });
        // iter 103: stale-build 401/403 — the bundled API key is outdated.
        // Skip the dead Render/n8n fallbacks (would only add a 25s timeout)
        // and tell the user to reload onto the current build.
        if (nanobotResult?.authStale) {
            return {
                success: false,
                response: friendlyError(new Error(`stale build auth ${nanobotResult.status}`)),
                source: 'error',
            };
        }
        if (nanobotResult) return nanobotResult;
    }

    // 1b. Fallback: Try Render Nanobot (5 provider AI, V5 routing) if Edge failed
    if (RENDER_FALLBACK && (!NANOBOT_URL || NANOBOT_URL.includes('supabase.co'))) {
        try {
            const renderResp = await fetch(`${RENDER_FALLBACK}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(25000), // Render cold start ~15s
                body: JSON.stringify({ message: nanobotMessage, sessionId: getTutorSessionId(), experimentId }),
            });
            if (renderResp.ok) {
                const renderData = await renderResp.json();
                if (renderData.success && renderData.response) {
                    // Render fallback success
                    return {
                        success: true,
                        response: ensureBookCitation(renderData.response, experimentId),
                        source: 'render-fallback',
                        actions: extractActions(renderData.response),
                    };
                }
            }
        } catch (renderErr) {
            // Render fallback failed — fall through to webhook
        }
    }

    // 2. Fall through to backend webhook
    try {
        if (!CHAT_WEBHOOK) {
            throw new Error('CHAT_URL_MISSING: VITE_N8N_CHAT_URL non configurata');
        }

        // Se ci sono immagini, invia al backend con l'immagine in base64
        if (images.length > 0) {
            // Image analysis via backend Vision

            // Security: sessionStorage instead of localStorage — session IDs must not
            // persist across browser sessions on shared school computers.
            const sessionId = sessionStorage.getItem('unlim_session') || `s_${crypto.randomUUID()}`;
            sessionStorage.setItem('unlim_session', sessionId);

            try {
                const analyzeResponse = await postChatWithRetry({
                    prompt: webhookMessage || 'Analizza questa immagine dalla lavagna',
                    message: webhookMessage || 'Analizza questa immagine dalla lavagna',
                    sessionId,
                    images: images.map(img => ({
                        base64: img.base64,
                        mimeType: img.mimeType || 'image/png'
                    }))
                }, combinedSignal);


                const responseText = await analyzeResponse.text();

                if (!responseText || responseText.trim() === '') {
                    throw new Error('Risposta vuota dal server');
                }

                let analyzeData;
                try {
                    analyzeData = JSON.parse(responseText);
                } catch (parseError) {
                    // Se non è JSON valido, usa il testo direttamente
                    return {
                        success: true,
                        response: responseText,
                        source: 'backend-vision-text',
                        actions: extractActions(responseText)
                    };
                }

                // Vision response received

// © Andrea Marro — 19/04/2026 — ELAB Tutor — Tutti i diritti riservati
                // Estrai risposta dal formato backend
                let content = '';
                if (Array.isArray(analyzeData) && analyzeData[0]) {
                    content = analyzeData[0].output || analyzeData[0].text || analyzeData[0].response || JSON.stringify(analyzeData[0]);
                } else {
                    content = analyzeData.output || analyzeData.response || analyzeData.text || JSON.stringify(analyzeData);
                }

                const { filtered: safeContent } = filterAIResponse(content);

                return {
                    success: true,
                    response: ensureBookCitation(safeContent, experimentId),
                    source: 'backend-vision',
                    actions: extractActions(safeContent)
                };

            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    throw new Error('Timeout: la richiesta ha impiegato troppo tempo');
                }
                throw fetchError;
            }
        }


        // Nessuna immagine: usa backend webhook per il testo

        // Genera sessionId unico per la memoria
        // Security: sessionStorage instead of localStorage — session IDs must not
        // persist across browser sessions on shared school computers.
        const sessionId = sessionStorage.getItem('unlim_session') || `s_${crypto.randomUUID()}`;
        sessionStorage.setItem('unlim_session', sessionId);

        const response = await postChatWithRetry({ message: webhookMessage, sessionId }, combinedSignal);

        const responseText = await response.text();

        if (!responseText || responseText.trim() === '') {
            throw new Error('Risposta vuota dal server');
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            return {
                success: true,
                response: responseText,
                source: 'backend-text',
                actions: extractActions(responseText)
            };
        }

        // Response parsed

        // Estrai risposta dal formato backend - gestisci tutti i casi
        // Helper: estrai solo valori stringa (evita oggetti vuoti {} che sono truthy)
        const extractString = (val) => (typeof val === 'string' && val.trim()) ? val : null;

        let content = '';
        if (Array.isArray(data) && data.length > 0 && data[0]) {
            const item = data[0];
            content = extractString(item.output) || extractString(item.text) || extractString(item.response) || extractString(item.message) || '';
            if (!content && typeof item === 'object') {
                content = JSON.stringify(item);
            }
        } else if (data && typeof data === 'object') {
            content = extractString(data.output) || extractString(data.text) || extractString(data.response) || extractString(data.message) || '';
            if (!content) {
                content = JSON.stringify(data);
            }
        } else if (typeof data === 'string') {
            content = data;
        }

        // Fallback se content è ancora vuoto o un oggetto serializzato vuoto
        if (!content || content === '{}' || content === '[]' || typeof content !== 'string') {
            content = 'Risposta ricevuta ma contenuto non valido. Riprova.';
        }

        // SAFETY FILTER: filtra output AI prima di mostrare all'utente
        const { filtered: safeContent } = filterAIResponse(content);

        return {
            success: true,
            response: ensureBookCitation(safeContent, experimentId),
            source: 'backend',
            actions: extractActions(safeContent)
        };

    } catch (error) {
        // Fallback a RAG locale (solo per testo, solo se configurato)
        if (images.length === 0 && LOCAL_API) {
            try {
                const searchResponse = await fetch(`${LOCAL_API}/api/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: message, maxResults: 3 })
                });
                const searchData = await searchResponse.json();

                if (searchData.success && searchData.results && searchData.results.length > 0) {
                    const answer = ensureBookCitation(searchData.results[0]?.answer || searchData.results[0]?.text, experimentId);
                    return {
                        success: true,
                        response: answer,
                        source: 'local-rag',
                        actions: extractActions(answer)
                    };
                }
            } catch {
                // RAG fallback non disponibile — prova knowledge base locale
            }
        }

        // Sprint U Cycle 2 iter 41 — Andrea live test 2026-05-12 PM evidence:
        // `searchKnowledgeBase` fallback served stale canned responses ("Il LED
        // è una lucina speciale che funziona come una porta girevole...") that
        // bypassed Edge Function Vertex + linguaggio rewriter + Onniscenza +
        // anti-invenzione. Result: singolare violations ("metti", "se lo metti
        // al contrario", "tranquillo") + RGB memory leak on Vol.1 cap.6 LED.
        // Mitigation: gate behind `VITE_ENABLE_LOCAL_KNOWLEDGE_FALLBACK` env
        // flag (default OFF). When Edge Function unreachable, surface honest
        // failure (`friendlyError`) instead of canned content with violations.
        // Re-enable when knowledge-base entries rewritten Sprint U Cycle 2+ scope.
        const enableLocalKnowledge = (import.meta.env.VITE_ENABLE_LOCAL_KNOWLEDGE_FALLBACK || 'false').toString().toLowerCase() === 'true';
        if (enableLocalKnowledge && images.length === 0) {
            const kbResult = searchKnowledgeBase(message);
            if (kbResult) {
                const actions = extractActions(kbResult.answer, message);
                if (kbResult.relatedExperiment) {
                    actions.buttons.push({
                        type: 'openSimulator',
                        experimentId: kbResult.relatedExperiment,
                        label: 'Esperimento collegato',
                    });
                }
                return {
                    success: true,
                    response: ensureBookCitation(kbResult.answer, experimentId),
                    source: 'local-knowledge',
                    actions,
                };
            }

            // LIVE_CHAT_RAG_BYPASS: no local RAG fallback for chat wording.
            // Better a short honest failure than slow document-style output.
        }

        return {
            success: false,
            response: friendlyError(error),
            source: 'error'
        };
    }

    } finally {
        clearTimeout(masterTimer);
    }
}



/**
 * INTELLIGENT ACTION PARSER - Enhanced
 * Estrae azioni dalla risposta AI per controllare l'editor
 * FILOSOFIA: Solo chat di default. Pulsanti solo se azione è chiara e utile.
 */
function extractActions(text, userMessage = '') {
    if (!text) return { commands: [], buttons: [], route: null };

    const actions = {
        commands: [],  // Azioni eseguite automaticamente
        buttons: [],   // Pulsanti mostrati all'utente (solo se utili!)
        route: null    // Routing suggerito: 'simulator' | 'canvas' | 'manual' | 'page' | null
    };

    const lowerText = text.toLowerCase();
    const lowerUser = userMessage.toLowerCase();

    // ============================================
    // 1. ROUTING AUTOMATICO (basato su contenuto AI)
    // ============================================

    // → SIMULATORE: SE l'AI suggerisce chiaramente di provare/testare
    if (/prova (nel )?simulatore|carica (nel )?simulatore|apri il simulatore|simula questo|testa il circuito/i.test(lowerText)) {
        actions.route = 'simulator';
        actions.commands.push({ type: 'openSimulator', auto: true });
    }

    // → LAVAGNA: SE l'AI suggerisce di disegnare
    if (/disegna (prima )?|prova a disegnare|usa la lavagna|fai uno schizzo/i.test(lowerText)) {
        actions.route = 'canvas';
        actions.commands.push({ type: 'openCanvas', auto: true });
    }

    // ============================================
// © Andrea Marro — 19/04/2026 — ELAB Tutor — Tutti i diritti riservati
    // 2. PAGINE ELAB [V1P45] (SOLO se menzionate esplicitamente)
    // ============================================
    const pageMatches = text.match(/\[V(\d)P(\d+)\]/gi);
    if (pageMatches && pageMatches.length > 0) {
        // Prendi solo la prima pagina se più menzionate (evita button spam)
        const firstMatch = pageMatches[0].match(/\[V(\d)P(\d+)\]/i);
        if (firstMatch) {
            const vol = parseInt(firstMatch[1]);
            const page = parseInt(firstMatch[2]);
            actions.buttons.push({
                type: 'openPage',
                volume: vol,
                page: page,
                label: `Pagina ${page}`
            });
            if (!actions.route) actions.route = 'page';
        }
    }

    // ============================================
    // 3. CODICE SIMULATORE (marcatore speciale :::CODE:::)
    // ============================================
    const codeMarkerMatch = text.match(/:::(?:WOKWI|CODE):::([\s\S]*?):::END:::/);
    if (codeMarkerMatch) {
        const code = codeMarkerMatch[1].trim();
        actions.commands.push({ type: 'loadSimulator', code, auto: true });
        actions.route = 'simulator';
        actions.buttons.push({
            type: 'openSimulator',
            code,
            label: 'Apri nel Simulatore'
        });
    }

    // ============================================
    // 4. CODICE ARDUINO (blocco ``` tradizionale)
    // ============================================
    const codeBlock = text.match(/```(?:cpp|arduino|c\+\+)?\s*([\s\S]*?)```/i);
    if (codeBlock && codeBlock[1]?.trim().length > 20 && !codeMarkerMatch) {
        const code = codeBlock[1].trim();
        actions.commands.push({ type: 'showCode', code });
        actions.buttons.push({
            type: 'openSimulator',
            code,
            label: 'Prova nel Simulatore'
        });
        actions.route = 'simulator';
    }

    // ============================================
    // 4. RISPOSTA A DOMANDE SPECIFICHE DELL'UTENTE
    // ============================================

    // Utente chiede simulatore → suggerisci simulatore
    if (/simula|simulatore|provare|testare|eseguire/i.test(lowerUser) && !actions.route) {
        actions.buttons.push({ type: 'openSimulator', label: 'Simulatore' });
    }

    // Utente chiede di disegnare → suggerisci lavagna
    if (/disegn|lavagna|schizzo|scrivi a mano/i.test(lowerUser) && !actions.route) {
        actions.buttons.push({ type: 'openCanvas', label: 'Lavagna' });
    }

    // Utente chiede dove trovare → cerca pagine nel testo
    if (/dove trovo|quale pagina|che lezione/i.test(lowerUser) && !actions.route) {
        actions.route = 'manual';
    }

    // ============================================
    // 5. LINK ESTERNI (solo se presenti e rilevanti)
    // ============================================
    const urlMatch = text.match(/https?:\/\/[^\s\)]+/);
    if (urlMatch) {
        actions.buttons.push({ type: 'openUrl', url: urlMatch[0], label: 'Apri Link' });
    }

    // ============================================
    // 6. PULIZIA: Rimuovi pulsanti duplicati o inutili
    // ============================================
    // Max 3 pulsanti per non affollare l'UI
    actions.buttons = actions.buttons.slice(0, 3);

    // Se non ci sono azioni significative, tutti i campi sono vuoti → solo chat
    return actions;
}



/**
 * Analizza immagine via MCP (usa sendChat con immagine)
 * @param {string} imageData - Base64 image data (con o senza data: prefix)
 * @param {string} question - Domanda/prompt per l'analisi
 * @param {object} [options] - Opzioni aggiuntive
 * @param {AbortSignal} [options.signal] - AbortSignal per cancellare la richiesta
 */
export async function analyzeImage(imageData, question = "Analizza questa immagine di un circuito elettronico.", options = {}) {
    // Slice 1C H1 fix (code review 2026-05-25): extract boardSnapshot +
    // previousBoardSnapshot from options to forward through internal sendChat
    // fallback. Without this, vision-path turns silently bypass awareness-flags
    // server-side wire (the most context-rich UNLIM use case was the dark hole).
    const { signal, circuitState = null, simulatorContext = null, experimentId = null, preferProvider = null, boardSnapshot = null, previousBoardSnapshot = null, flags = null, screenSnapshot = null } = options;

    // Check if already aborted before starting
    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
    }

    const firstImage = Array.isArray(imageData) ? imageData[0] : imageData;
    const imageString = typeof firstImage === 'string'
        ? firstImage
        : (firstImage?.base64 ? `data:${firstImage.mimeType || 'image/png'};base64,${firstImage.base64}` : '');
    const directVision = await tryVisionEndpoint(question, imageString, {
        signal,
        experimentId,
        preferProvider,
        simulatorContext,
        aiProfile: options.aiProfile,
        aiDepth: options.aiDepth,
        flags,
        screenSnapshot,
    });
    if (directVision) return directVision;

    const base64 = imageString.includes(',') ? imageString.split(',')[1] : imageString;
    const mimeType = imageString.includes('data:')
        ? imageString.split(';')[0].split(':')[1]
        : 'image/png';

    return await sendChat(question, [{ base64, mimeType }], { signal, circuitState, simulatorContext, experimentId, boardSnapshot, previousBoardSnapshot, flags, screenSnapshot });
}

/**
 * Compile — Compila codice Arduino via server standalone o backend webhook
 * Catena di fallback: standalone server → backend webhook → server locale dev
 *
 * @param {string} code — il codice Arduino (.ino)
 * @param {string} board — FQBN board (default: arduino:avr:nano:cpu=atmega328old)
 * @returns {{ success: boolean, hex: string|null, errors: string|null, output: string|null, result: string|null, provider: string, targetFqbn: string }}
 */
export async function compileCode(code, board = 'arduino:avr:nano:cpu=atmega328old') {
    const safeBoard = ALLOWED_COMPILE_BOARDS.has(board) ? board : DEFAULT_BOARD;

    /**
     * Helper: chiama un endpoint di compilazione e ritorna il risultato
     */
    async function tryCompile(url, label, provider) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), COMPILE_TIMEOUT);
        const headers = { 'Content-Type': 'application/json' };
        if (url.includes('supabase.co/functions') && _SUPABASE_ANON) {
            headers.apikey = _SUPABASE_ANON;
            headers.Authorization = `Bearer ${_SUPABASE_ANON}`;
        }
        if (url.includes('supabase.co/functions') && _ELAB_API_KEY) {
            headers['X-Elab-Api-Key'] = _ELAB_API_KEY;
        }
        // iter 98 Atom E — Vercel serverless proxy /api/compile/nanor4 returns
        // the SAME cloud-compile canonical shape {ok, hexBase64, stdout, stderr}
        // as Cloud Render direct. Server-side injects x-elab-api-key (no client
        // key needed — secure proxy Andrea iter 94 mandate). isCloudShape gates
        // body shape + response mapping for the same-origin proxy.
        const isVercelProxy = url === '/api/compile/nanor4' || url.endsWith('/api/compile/nanor4');
        // Local cloud-compile server (infra/cloud-compile/server.js) uses the
        // same OpenAPI 76-D.3 shape — treat it as cloud-canonical when the
        // URL points at the documented localhost:8765 endpoint.
        const isLocalCloudCompile = /localhost:8765\/compile$/.test(url) || /127\.0\.0\.1:8765\/compile$/.test(url);
        const isCloudShape = isVercelProxy || isLocalCloudCompile;

        try {
            // iter 77 STOP-HOOK #2 fix (Codex): Cloud Render expects canonical
            // OpenAPI 76-D.3 body shape `{sketchCode, fqbn}` (per server.js:200
            // + cloud P0.4 boardId+fqbn dual-accept). Legacy n8n + Supabase
            // proxy chain uses `{code, board}` historical shape. Branch body.
            const body = isCloudShape
                ? JSON.stringify({ sketchCode: code, fqbn: safeBoard })
                : JSON.stringify({ code, board: safeBoard });
            const res = await fetch(url, {
                method: 'POST',
                headers,
                signal: controller.signal,
                body,
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`${label} error: ${res.status}`);
            }

            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
                // Backend sometimes wraps in array
                if (Array.isArray(data) && data.length > 0 && data[0]?.success !== undefined) {
                    data = data[0];
                }
            } catch {
                throw new Error('Risposta non valida dal compilatore');
            }

            // iter 77 STOP-HOOK #2 fix (Codex): Cloud Render returns canonical
            // `{ok, jobId, hexFilename, hexSize, hexBase64, stdout, stderr,
            // latencyMs}` (server.js:268-278). Map to legacy contract for
            // downstream consumers (CompilationStatus + simulator HEX consumer).
            if (isCloudShape) {
                return {
                    success: !!data.ok,
                    hex: data.hexBase64 || null,
                    errors: data.stderr || data.error || null,
                    output: data.stdout || null,
                    result: data.ok ? 'success' : 'error',
                    provider,
                    targetFqbn: data.fqbn || safeBoard,
                    artifactSizeBytes: typeof data.hexSize === 'number' ? data.hexSize : null,
                };
            }

            return {
                success: !!data.success,
                hex: data.hex || null,
                errors: data.errors || data.error || null,
                output: data.output || data.stdout || null,
                result: data.result || data.output || data.stdout || data.errors || data.error || null,
                provider,
                targetFqbn: safeBoard,
            };
        } catch {
            clearTimeout(timeoutId);
            return null; // null = try next
        }
    }

    const httpsBrowser = isHttpsBrowserOrigin();

    // PRIORITY: local cloud-compile server (infra/cloud-compile/server.js)
    // when running on localhost. Allows full Renesas R4 cross-compile without
    // any backend deploy. Server expects {sketchCode, fqbn} via isCloudShape.
    // Optional header X-Elab-Api-Key supplied via VITE_LOCAL_CLOUD_COMPILE_KEY
    // for dev parity with Render (empty in dev means server runs in DEV-allow
    // mode per server.js authMiddleware:96).
    if (!httpsBrowser) {
        const result = await tryCompile('http://localhost:8765/compile', 'Local cloud-compile (R4)', 'cloud-renesas-local');
        if (result) return result;
    }

    // iter 98 Atom E — same-origin Vercel serverless proxy /api/compile/nanor4.
    // PRIORITY 0: secure proxy (server-side ELAB_CLOUD_COMPILE_API_KEY injection,
    // NO client key exposure) per Andrea iter 94 PM mandate "/api/compile/nanor4
    // o proxy sicuro". Same-origin → no CORS preflight. Returns honest 503
    // (cloud_compile_not_configured) when Render not yet deployed → tryCompile
    // sees !res.ok → returns null → falls through to legacy chain. ZERO regression
    // until Andrea deploys infra/cloud-compile + sets ELAB_CLOUD_COMPILE_URL.
    // Gated httpsBrowser: in Vite dev (localhost) the serverless route 404s
    // (no Vercel functions) → would just fall through, gate avoids dev noise.
    if (httpsBrowser) {
        const result = await tryCompile('/api/compile/nanor4', 'Vercel cross-compile proxy', 'cloud-renesas');
        if (result) return result;
    }

    // 1. Production/preview HTTPS: same-origin-safe Supabase proxy first.
    // Direct n8n compile endpoints fail browser CORS on www.elabtutor.school.
    if (httpsBrowser && COMPILE_PROXY_URL) {
        const result = await tryCompile(COMPILE_PROXY_URL, 'Supabase compile proxy', 'n8n-avr-legacy');
        if (result) return result;
    }

    // 2. Server standalone (compile-server.js sul VPS). In HTTPS, never call
    // the known n8n compile URL directly from the browser: it creates CORS noise.
    if (COMPILE_URL && !(httpsBrowser && isDirectN8nCompileUrl(COMPILE_URL))) {
        const result = await tryCompile(`${COMPILE_URL}/compile`, 'Standalone server', 'standalone-compile');
        if (result) return result;
    }

    // 3. Fallback: backend webhook, but not direct n8n from HTTPS browser.
    if (COMPILE_WEBHOOK && !(httpsBrowser && isDirectN8nCompileUrl(COMPILE_WEBHOOK))) {
        const result = await tryCompile(COMPILE_WEBHOOK, 'Backend webhook', 'n8n-avr-legacy');
        if (result) return result;
    }

    // 4. Fallback: server locale only in dev/non-HTTPS.
    if (!httpsBrowser && LOCAL_URL) {
        const result = await tryCompile(`${LOCAL_URL}/compile`, 'Local server', 'local-agent');
        if (result) return result;
    }

    return {
        success: false,
        hex: null,
        errors: 'Il traduttore del codice non risponde. Controlla che internet funzioni e riprova.',
        output: null,
        result: 'Compilatore non disponibile',
        provider: 'none',
        targetFqbn: safeBoard,
    };
}


/**
 * Preload — Pre-genera hints per un esperimento in background (fire-and-forget)
 * Chiamata quando lo studente apre un esperimento, per avere risposte istantanee.
 * @param {string} experimentId — ID esperimento (es: v1-cap6-esp1)
 *
 * DISABLED 19/04/2026: endpoint /preload non esiste su backend
 * (euqpdueopmlllqjmqnyb Supabase Edge Functions deployed: unlim-chat,
 * unlim-diagnose, unlim-hints, unlim-tts, unlim-gdpr). Ogni chiamata
 * faceva 404 + CORS error in console produzione. Re-abilitare quando
 * verrà creato supabase/functions/preload/ + deploy.
 */
export function preloadExperiment(experimentId) {
    // No-op: endpoint not deployed. Preserve signature + no network request.
    if (!NANOBOT_URL || !experimentId) return;
    // TODO(2026-04-19): create supabase/functions/preload Edge Function,
    //   remove this early return.
    return;
}

/**
 * Warm up the Render backend to eliminate the 37s cold start.
 * Called once on app load via a lightweight GET request.
 * Fire-and-forget — never blocks the UI.
 *
 * NOTE: HEAD returns 405 on Render's /health route (observed 2026-04-22
 * stress-test P2-005). GET is lightweight enough and the response body is
 * discarded, so the warm-up still only pays TCP + TLS + one TTFB.
 */
export function warmupRender() {
    fetch(`${RENDER_FALLBACK}/health`, {
        method: 'GET',
        mode: 'no-cors',
        signal: AbortSignal.timeout(60000), // 60s max, Render wakes in ~37s
    }).catch(() => { }); // Silently ignore errors (service may be sleeping)
}

export const __test__ = {
    API_TIMEOUT,
    LOCAL_HEALTH_TIMEOUT_MS,
    LOCAL_CHAT_TIMEOUT_TEXT_MS,
    LOCAL_CHAT_TIMEOUT_IMAGE_MS,
    MASTER_TIMEOUT_TEXT,
    MASTER_TIMEOUT_IMAGE,
};

export { API };
