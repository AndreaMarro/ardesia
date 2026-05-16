// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Session Report Service
 * Collects session data and generates PDF report.
 * Copyright (c) Andrea Marro
 */
import { sendChat } from './api';
import logger from '../utils/logger';
import { captureCanvasBase64 } from '../components/simulator/utils/exportPng';

const NANOBOT_TIMEOUT = 8000;

/**
 * Collects all session data from the various sources.
 */
export function collectSessionData({
  messages,
  activeExperiment,
  quizResults,
  codeContent,
  compilationResult,
  sessionStartTime,
  buildStepIndex,
  buildStepsTotal,
  isCircuitComplete,
}) {
  const duration = Math.round((Date.now() - (sessionStartTime || Date.now())) / 60000);
  const chatMessages = (messages || [])
    .filter(m => m.id !== 'welcome')
    .map(m => ({ role: m.role, content: m.content }));

  const volumeNumber = activeExperiment?.id?.startsWith('v1') ? 1
    : activeExperiment?.id?.startsWith('v2') ? 2
    : activeExperiment?.id?.startsWith('v3') ? 3 : 1;

  const volumeColor = volumeNumber === 1 ? '#4A7A25'
    : volumeNumber === 2 ? '#E8941C' : '#E54B3D';

  return {
    sessionDate: new Date().toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    sessionTime: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    duration: Math.max(1, duration),
    experiment: activeExperiment ? {
      id: activeExperiment.id,
      title: activeExperiment.title,
      desc: activeExperiment.desc || activeExperiment.description || '',
      chapter: activeExperiment.chapter || '',
      difficulty: activeExperiment.difficulty || 1,
      simulationMode: activeExperiment.simulationMode || 'circuit',
      components: (activeExperiment.components || []).map(c => ({
        type: c.type, id: c.id, value: c.value, color: c.color
      })),
      quiz: activeExperiment.quiz || [],
      concept: activeExperiment.concept || '',
      code: activeExperiment.code || null,
    } : null,
    volumeNumber,
    volumeColor,
    chatMessages,
    messageCount: chatMessages.length,
    quizResults: quizResults || null,
    codeContent: codeContent || null,
    compilationResult: compilationResult || null,
    buildProgress: buildStepsTotal > 0
      ? { current: Math.max(0, buildStepIndex) + 1, total: buildStepsTotal }
      : null,
    isCircuitComplete: isCircuitComplete || false,
  };
}

/**
 * Captures circuit screenshot as base64.
 */
export async function captureCircuit(canvasContainerRef) {
  if (!canvasContainerRef?.current) return null;
  return captureCanvasBase64(canvasContainerRef.current);
}

/**
 * Fetches AI summary from nanobot with timeout + local fallback.
 */
export async function fetchAISummary(sessionData) {
  const prompt = buildSummaryPrompt(sessionData);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NANOBOT_TIMEOUT);

    const result = await sendChat(prompt, [], { signal: controller.signal });
    clearTimeout(timeout);

    if (result?.success && result.response) {
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.riassunto && Array.isArray(parsed.riassunto)) {
            return parsed;
          }
        } catch { /* JSON parse failed, use plain text */ }
      }
      return {
        riassunto: [result.response.replace(/<[^>]*>/g, '').replace(/\[AZIONE:[^\]]*\]/g, '').slice(0, 500)],
        prossimoPassoSuggerito: '',
        concettiToccati: [],
      };
    }
  } catch (err) {
    logger.warn('[SessionReport] AI summary failed, using local fallback:', err?.message || err);
  }

  return generateLocalSummary(sessionData);
}

function buildSummaryPrompt(data) {
  const exp = data.experiment;
  const quizInfo = data.quizResults
    ? `${data.quizResults.score}/${data.quizResults.total} (${data.quizResults.score === data.quizResults.total ? 'Tutto giusto!' : data.quizResults.score > 0 ? 'Parziale' : 'Da rivedere'})`
    : 'Non fatto';

  return `[SISTEMA] Sei UNLIM. Genera un riassunto per un report PDF della sessione.

REGOLE TASSATIVE:
- Racconta SOLO quello che e' successo. NON inventare.
- Linguaggio narrativo semplice, target 13 anni.
- Analogie quotidiane (acqua, torce, tubi, porte).
- Tono incoraggiante ma onesto.
- Se qualcosa non ha funzionato, trova il valore educativo.

DATI SESSIONE:
- Esperimento: ${exp?.title || 'Nessuno'}
- Circuito completato: ${data.isCircuitComplete ? 'Si' : 'No'}
- Quiz: ${quizInfo}
- Durata: ${data.duration} minuti
- Messaggi scambiati: ${data.messageCount}
- Codice scritto: ${data.codeContent ? 'Si' : 'No'}

Rispondi SOLO con JSON valido, nient'altro:
{"riassunto":["frase1","frase2","frase3"],"prossimoPassoSuggerito":"frase","concettiToccati":["c1","c2"]}`;
}

function generateLocalSummary(data) {
  const exp = data.experiment;
  const riassunto = [];

  riassunto.push(
    `Hai lavorato sull'esperimento "${exp?.title || 'sconosciuto'}" per ${data.duration || '?'} minuti.`
  );

  if (data.isCircuitComplete) {
    riassunto.push('Hai completato il circuito correttamente — ottimo lavoro!');
  } else if (data.buildProgress) {
    riassunto.push(
      `Hai completato ${data.buildProgress.current} passi su ${data.buildProgress.total} nella costruzione del circuito.`
    );
  } else {
    riassunto.push('Il circuito non era ancora completo — ci riproverai la prossima volta!');
  }

  if (data.quizResults) {
    const { score, total } = data.quizResults;
    if (score === total) riassunto.push('Hai risposto correttamente a tutte le domande del quiz!');
    else if (score > 0) riassunto.push(`${score} risposta giusta su ${total} nel quiz — quasi perfetto!`);
    else riassunto.push('Il quiz non e\' andato benissimo — rileggi le spiegazioni!');
  }

  if (data.codeContent) {
    riassunto.push('Hai anche scritto codice Arduino per controllare il circuito.');
  }

  return {
    riassunto,
    prossimoPassoSuggerito: 'Continua con il prossimo esperimento del capitolo!',
    concettiToccati: exp?.concept ? [exp.concept] : [],
  };
}
