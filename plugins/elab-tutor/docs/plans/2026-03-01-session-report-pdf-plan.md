# Session Report PDF — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Un pulsante "Report PDF" nella toolbar del simulatore genera un PDF narrativo (6-8 pagine) che racconta l'avventura didattica della sessione, con screenshot circuito, chat Galileo, quiz, codice e riassunto AI — tutto basato SOLO su dati reali.

**Architecture:** Client-side PDF via `@react-pdf/renderer` (gia' installato). Dati raccolti da React state + localStorage. Summary AI da nanobot `/tutor-chat` con fallback template locale. Screenshot circuito da `exportPng.js` modificato per restituire base64.

**Tech Stack:** React 19, @react-pdf/renderer 4.3.1, nanobot API (sendChat), exportPng.js, Oswald/Open Sans/Fira Code fonts via Google Fonts CDN (registrati con @react-pdf/font).

---

## Task 1: Modify exportPng.js — Add base64 export mode

**Files:**
- Modify: `src/components/simulator/utils/exportPng.js`

**Why:** Currently `exportCanvasPng()` only downloads the PNG. We need a mode that returns the base64 string instead, for embedding in the PDF.

**Step 1: Add `captureCanvasBase64` function**

Add this new exported function AFTER the existing `exportCanvasPng` function (after line ~100):

```javascript
/**
 * Captures the circuit canvas as a base64 PNG data URL.
 * Used by SessionReportPDF to embed circuit screenshot.
 * @param {HTMLElement} canvasContainer - The container with the SVG canvas
 * @returns {Promise<string|null>} base64 data URL or null on error
 */
export async function captureCanvasBase64(canvasContainer) {
  try {
    if (!canvasContainer) return null;
    const svgEl = canvasContainer.querySelector('svg');
    if (!svgEl) return null;

    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgStr = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    return canvas.toDataURL('image/png');
  } catch (err) {
    logger.error('captureCanvasBase64 failed:', err);
    return null;
  }
}
```

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Expected: Build success, 0 errors.

---

## Task 2: Create sessionReportService.js — Data collection & orchestration

**Files:**
- Create: `src/services/sessionReportService.js`

**Why:** Central orchestrator that collects all session data, calls nanobot for AI summary, and triggers PDF generation. Keeps logic out of components.

**Step 1: Create the service file**

```javascript
/**
 * Session Report Service
 * Collects session data and generates PDF report.
 * Copyright (c) Andrea Marro
 */
import { sendChat } from './api';
import { captureCanvasBase64 } from '../components/simulator/utils/exportPng';

const NANOBOT_TIMEOUT = 8000;

/**
 * Collects all session data from the various sources.
 */
export function collectSessionData({
  messages,
  activeExperiment,
  circuitStateRef,
  canvasContainerRef,
  quizResults,
  codeContent,
  compilationResult,
  sessionStartTime,
  buildStepIndex,
  buildStepsTotal,
  isCircuitComplete,
}) {
  const duration = Math.round((Date.now() - sessionStartTime) / 60000); // minutes
  const chatMessages = (messages || [])
    .filter(m => m.id !== 'welcome')
    .map(m => ({ role: m.role, content: m.content }));

  const volumeNumber = activeExperiment?.id?.startsWith('v1') ? 1
    : activeExperiment?.id?.startsWith('v2') ? 2
    : activeExperiment?.id?.startsWith('v3') ? 3 : 1;

  const volumeColor = volumeNumber === 1 ? '#7CB342'
    : volumeNumber === 2 ? '#E8941C' : '#E54B3D';

  return {
    sessionDate: new Date().toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    sessionTime: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    duration,
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
    quizResults: quizResults || null,  // { answers: [0|1|2, ...], score: N, total: N }
    codeContent: codeContent || null,
    compilationResult: compilationResult || null,
    buildProgress: buildStepsTotal > 0
      ? { current: buildStepIndex + 1, total: buildStepsTotal }
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
      // Try to parse JSON from response
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.riassunto && Array.isArray(parsed.riassunto)) {
          return parsed;
        }
      }
      // If not JSON, use as plain text
      return {
        riassunto: [result.response.replace(/<[^>]*>/g, '').slice(0, 500)],
        prossimoPassoSuggerito: '',
        concettiToccati: [],
      };
    }
  } catch {
    // Fallback to local template
  }

  return generateLocalSummary(sessionData);
}

function buildSummaryPrompt(data) {
  const exp = data.experiment;
  const quizInfo = data.quizResults
    ? `${data.quizResults.score}/${data.quizResults.total} (${data.quizResults.score === data.quizResults.total ? 'Tutto giusto!' : data.quizResults.score > 0 ? 'Parziale' : 'Da rivedere'})`
    : 'Non fatto';

  return `[SISTEMA] Sei Galileo. Genera un riassunto per un report PDF della sessione.

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
```

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Expected: Build success, 0 errors.

---

## Task 3: Create SessionReportPDF.jsx — React-PDF document component

**Files:**
- Create: `src/components/report/SessionReportPDF.jsx`

**Why:** The actual PDF document defined with @react-pdf/renderer components. Each page is a section of the story. This is the biggest file — all the visual layout and narrative logic.

**Step 1: Create the PDF component**

This file uses lazy-loaded @react-pdf/renderer (same pattern as ReportService.jsx).
The component receives all collected session data and renders 6-8 pages.

```javascript
/**
 * SessionReportPDF — PDF Report della sessione ELAB
 * Genera un documento PDF narrativo con stile ELAB.
 * Copyright (c) Andrea Marro
 */

let P = null; // Lazy-loaded @react-pdf/renderer

async function loadRenderer() {
  if (!P) {
    P = await import('@react-pdf/renderer');
    // Register fonts
    P.Font.register({
      family: 'Oswald',
      fonts: [
        { src: 'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiYA.ttf', fontWeight: 700 },
        { src: 'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1xNvsUZiYA.ttf', fontWeight: 400 },
      ],
    });
    P.Font.register({
      family: 'OpenSans',
      fonts: [
        { src: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVc.ttf', fontWeight: 700 },
        { src: 'https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWqWtE6F15M.ttf', fontStyle: 'italic' },
      ],
    });
    P.Font.register({
      family: 'FiraCode',
      src: 'https://fonts.gstatic.com/s/firacode/v22/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sJVD7Ng.ttf',
    });
  }
  return P;
}

// ━━━━━ Styles ━━━━━
function createStyles(volumeColor) {
  return P.StyleSheet.create({
    page: {
      fontFamily: 'OpenSans',
      fontSize: 10,
      color: '#333333',
      paddingTop: 40,
      paddingBottom: 60,
      paddingHorizontal: 40,
    },
    // Header bar
    headerBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 8,
      backgroundColor: '#1E4D8C',
    },
    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 40,
      borderTopWidth: 3,
      borderTopColor: volumeColor,
    },
    footerText: {
      fontSize: 8,
      color: '#999999',
      fontFamily: 'OpenSans',
    },
    // Cover
    coverTitle: {
      fontFamily: 'Oswald',
      fontSize: 28,
      fontWeight: 700,
      color: '#1E4D8C',
      marginTop: 80,
      textAlign: 'center',
    },
    coverSubtitle: {
      fontFamily: 'Oswald',
      fontSize: 16,
      fontWeight: 400,
      color: volumeColor,
      textAlign: 'center',
      marginTop: 8,
    },
    coverDate: {
      fontSize: 11,
      color: '#666666',
      textAlign: 'center',
      marginTop: 20,
    },
    coverMascot: {
      width: 120,
      height: 120,
      alignSelf: 'center',
      marginTop: 30,
    },
    // Section title
    sectionTitle: {
      fontFamily: 'Oswald',
      fontSize: 20,
      fontWeight: 700,
      color: '#1E4D8C',
      marginBottom: 12,
    },
    // Narrative text
    narrative: {
      fontSize: 10,
      lineHeight: 1.6,
      color: '#333333',
      marginBottom: 8,
    },
    narrativeItalic: {
      fontSize: 9,
      fontStyle: 'italic',
      color: '#666666',
      marginBottom: 8,
    },
    // Info box (success)
    boxSuccess: {
      backgroundColor: '#E8F5E9',
      borderLeftWidth: 4,
      borderLeftColor: '#4CAF50',
      padding: 10,
      marginVertical: 8,
      borderRadius: 2,
    },
    // Info box (warning / encourage)
    boxEncourage: {
      backgroundColor: '#FFF3E0',
      borderLeftWidth: 4,
      borderLeftColor: '#FF9800',
      padding: 10,
      marginVertical: 8,
      borderRadius: 2,
    },
    boxText: {
      fontSize: 10,
      lineHeight: 1.5,
    },
    // Circuit screenshot
    circuitImage: {
      width: '100%',
      maxHeight: 340,
      objectFit: 'contain',
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 4,
    },
    // Code block
    codeBlock: {
      backgroundColor: '#F5F5F5',
      padding: 10,
      borderRadius: 4,
      marginVertical: 8,
    },
    codeText: {
      fontFamily: 'FiraCode',
      fontSize: 8,
      color: '#333333',
      lineHeight: 1.5,
    },
    // Chat messages
    chatBubbleGalileo: {
      backgroundColor: '#E8EDF4',
      padding: 8,
      borderRadius: 6,
      marginBottom: 6,
      marginRight: 40,
    },
    chatBubbleStudent: {
      backgroundColor: '#F5F5F5',
      padding: 8,
      borderRadius: 6,
      marginBottom: 6,
      marginLeft: 40,
    },
    chatRole: {
      fontFamily: 'Oswald',
      fontSize: 8,
      fontWeight: 700,
      color: '#1E4D8C',
      marginBottom: 2,
    },
    chatRoleStudent: {
      fontFamily: 'Oswald',
      fontSize: 8,
      fontWeight: 700,
      color: '#666666',
      marginBottom: 2,
      textAlign: 'right',
    },
    chatText: {
      fontSize: 9,
      lineHeight: 1.4,
      color: '#333333',
    },
    // Quiz
    quizQuestion: {
      fontFamily: 'OpenSans',
      fontWeight: 700,
      fontSize: 10,
      marginBottom: 6,
      marginTop: 10,
    },
    quizOption: {
      fontSize: 9,
      paddingVertical: 3,
      paddingLeft: 12,
    },
    quizCorrect: {
      color: '#2E7D32',
    },
    quizWrong: {
      color: '#E65100',
    },
    quizExplanation: {
      fontSize: 9,
      fontStyle: 'italic',
      color: '#555555',
      marginTop: 4,
      paddingLeft: 12,
    },
    // Stars
    starsRow: {
      flexDirection: 'row',
      marginVertical: 6,
      justifyContent: 'center',
    },
    starText: {
      fontSize: 18,
      marginHorizontal: 2,
    },
    // Component list
    componentItem: {
      fontSize: 9,
      color: '#444444',
      marginBottom: 2,
      paddingLeft: 8,
    },
    // Summary bullets
    summaryBullet: {
      fontSize: 10,
      lineHeight: 1.6,
      color: '#333333',
      marginBottom: 6,
      paddingLeft: 12,
    },
  });
}

// ━━━━━ Component name mapping ━━━━━
const COMPONENT_NAMES = {
  'battery9v': 'Batteria 9V',
  'breadboard-half': 'Breadboard (mezza)',
  'breadboard-full': 'Breadboard (intera)',
  'led': 'LED',
  'resistor': 'Resistore',
  'capacitor': 'Condensatore',
  'push-button': 'Pulsante',
  'potentiometer': 'Potenziometro',
  'photoResistor': 'Fotoresistore',
  'buzzerPiezo': 'Buzzer Piezoelettrico',
  'motorDC': 'Motore DC',
  'diode': 'Diodo',
  'mosfet-n': 'MOSFET (canale N)',
  'phototransistor': 'Fototransistore',
  'reed-switch': 'Interruttore Reed',
  'servo': 'Servomotore',
  'lcd-16x2': 'Display LCD 16x2',
  'multimeter': 'Multimetro',
  'rgb-led': 'LED RGB',
  'nano-r4': 'Arduino Nano R4',
};

function getComponentName(type, comp) {
  let name = COMPONENT_NAMES[type] || type;
  if (type === 'resistor' && comp.value) name += ` (${comp.value}Ω)`;
  if (type === 'led' && comp.color) name += ` (${comp.color})`;
  if (type === 'capacitor' && comp.value) name += ` (${comp.value}μF)`;
  return name;
}

// ━━━━━ Helper: strip HTML tags from chat messages ━━━━━
function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\[AZIONE:[^\]]*\]/g, '').trim();
}

// ━━━━━ Helper: select most significant chat messages ━━━━━
function selectKeyMessages(messages, max = 15) {
  if (messages.length <= max) return messages;
  const result = [];
  // Always include first message
  if (messages.length > 0) result.push(messages[0]);
  // Include messages with questions (?) or errors
  const middle = messages.slice(1, -1);
  const important = middle.filter(m =>
    m.content?.includes('?') || m.content?.includes('errore') ||
    m.content?.includes('sbagliato') || m.content?.includes('perch')
  );
  for (const m of important.slice(0, max - 2)) {
    if (!result.includes(m)) result.push(m);
  }
  // Fill with evenly spaced messages
  const remaining = max - result.length - 1;
  if (remaining > 0 && middle.length > 0) {
    const step = Math.max(1, Math.floor(middle.length / remaining));
    for (let i = 0; i < middle.length && result.length < max - 1; i += step) {
      if (!result.includes(middle[i])) result.push(middle[i]);
    }
  }
  // Always include last message
  if (messages.length > 1) result.push(messages[messages.length - 1]);
  return result;
}

// ━━━━━ Stars display ━━━━━
function renderStars(score, total) {
  const maxStars = 3;
  const filled = total > 0 ? Math.round((score / total) * maxStars) : 0;
  const stars = [];
  for (let i = 0; i < maxStars; i++) {
    stars.push(i < filled ? '★' : '☆');
  }
  return stars.join(' ');
}

// ━━━━━ Watermark date ━━━━━
function getWatermark() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `Andrea Marro — ${dd}/${mm}/${yyyy}`;
}

// ━━━━━ MAIN: Build and download PDF ━━━━━
export async function generateSessionReportPDF(sessionData, circuitScreenshot, aiSummary) {
  const R = await loadRenderer();
  const st = createStyles(sessionData.volumeColor);
  const watermark = getWatermark();
  const exp = sessionData.experiment;

  // ━━━ Page wrapper with header bar + footer ━━━
  const PageWrap = ({ children, pageNum, totalPages }) => (
    <R.Page size="A4" style={st.page}>
      <R.View style={st.headerBar} fixed />
      {children}
      <R.View style={st.footer} fixed>
        <R.Text style={st.footerText}>{watermark}</R.Text>
        <R.Text style={st.footerText}>Pagina {pageNum} di {totalPages}</R.Text>
      </R.View>
    </R.Page>
  );

  // Count pages
  const hasCode = exp?.simulationMode === 'avr' && sessionData.codeContent;
  const hasChat = sessionData.messageCount > 0;
  const hasQuiz = sessionData.quizResults && exp?.quiz?.length > 0;
  let totalPages = 3; // cover + experiment + circuit
  if (hasCode) totalPages++;
  if (hasChat) totalPages++;
  if (hasQuiz) totalPages++;
  totalPages++; // summary page (always)

  let pageNum = 0;

  // ━━━ PAGE 1: COVER ━━━
  const CoverPage = () => {
    pageNum = 1;
    return (
      <PageWrap pageNum={1} totalPages={totalPages}>
        <R.Text style={st.coverTitle}>
          La tua avventura con
        </R.Text>
        <R.Text style={st.coverSubtitle}>
          {exp?.title || 'ELAB Simulator'}
        </R.Text>
        <R.Text style={st.coverDate}>
          {sessionData.sessionDate} — ore {sessionData.sessionTime}
        </R.Text>
        <R.Text style={st.coverDate}>
          Durata: {sessionData.duration} minuti
        </R.Text>
        {exp?.chapter && (
          <R.Text style={{ ...st.narrativeItalic, textAlign: 'center', marginTop: 12 }}>
            {exp.chapter}
          </R.Text>
        )}
      </PageWrap>
    );
  };

  // ━━━ PAGE 2: THE MISSION ━━━
  const MissionPage = () => {
    pageNum++;
    const components = exp?.components || [];
    const uniqueTypes = [...new Set(components.map(c => c.type))];
    return (
      <PageWrap pageNum={pageNum} totalPages={totalPages}>
        <R.Text style={st.sectionTitle}>La Missione di Oggi</R.Text>
        <R.Text style={st.narrative}>
          {exp?.desc || 'Esplora il mondo dell\'elettronica con ELAB!'}
        </R.Text>
        {uniqueTypes.length > 0 && (
          <R.View style={{ marginTop: 10 }}>
            <R.Text style={{ ...st.narrative, fontWeight: 700 }}>
              I tuoi strumenti:
            </R.Text>
            {uniqueTypes.map((type, i) => {
              const comp = components.find(c => c.type === type);
              return (
                <R.Text key={i} style={st.componentItem}>
                  {'•  '}{getComponentName(type, comp || {})}
                </R.Text>
              );
            })}
          </R.View>
        )}
        {exp?.concept && (
          <R.View style={{ ...st.boxSuccess, marginTop: 16 }}>
            <R.Text style={st.boxText}>
              {exp.concept}
            </R.Text>
          </R.View>
        )}
      </PageWrap>
    );
  };

  // ━━━ PAGE 3: THE CIRCUIT ━━━
  const CircuitPage = () => {
    pageNum++;
    return (
      <PageWrap pageNum={pageNum} totalPages={totalPages}>
        <R.Text style={st.sectionTitle}>Il Tuo Circuito</R.Text>
        {circuitScreenshot ? (
          <R.Image src={circuitScreenshot} style={st.circuitImage} />
        ) : (
          <R.View style={st.boxEncourage}>
            <R.Text style={st.boxText}>
              Screenshot del circuito non disponibile.
            </R.Text>
          </R.View>
        )}
        {sessionData.isCircuitComplete ? (
          <R.View style={st.boxSuccess}>
            <R.Text style={st.boxText}>
              Ce l'hai fatta! Ogni componente al suo posto, ogni filo collegato. Il circuito funziona.
            </R.Text>
          </R.View>
        ) : sessionData.buildProgress ? (
          <R.View style={st.boxEncourage}>
            <R.Text style={st.boxText}>
              Hai completato {sessionData.buildProgress.current} passi su {sessionData.buildProgress.total}. Ogni passo conta — la prossima volta partirai avvantaggiato!
            </R.Text>
          </R.View>
        ) : (
          <R.View style={st.boxEncourage}>
            <R.Text style={st.boxText}>
              Il circuito non era ancora finito — nessun problema! Ogni tentativo e' un passo avanti.
            </R.Text>
          </R.View>
        )}
      </PageWrap>
    );
  };

  // ━━━ PAGE 4 (conditional): THE CODE ━━━
  const CodePage = () => {
    if (!hasCode) return null;
    pageNum++;
    const codeLines = (sessionData.codeContent || '').split('\n').slice(0, 40);
    const truncated = (sessionData.codeContent || '').split('\n').length > 40;
    return (
      <PageWrap pageNum={pageNum} totalPages={totalPages}>
        <R.Text style={st.sectionTitle}>Il Tuo Codice</R.Text>
        <R.Text style={st.narrative}>
          Hai scritto {(sessionData.codeContent || '').split('\n').length} righe di codice Arduino per controllare il circuito.
        </R.Text>
        <R.View style={st.codeBlock}>
          <R.Text style={st.codeText}>
            {codeLines.join('\n')}
            {truncated ? '\n// ... (codice troncato)' : ''}
          </R.Text>
        </R.View>
        {sessionData.compilationResult?.success ? (
          <R.View style={st.boxSuccess}>
            <R.Text style={st.boxText}>
              Compilazione riuscita! Il compilatore ha detto: tutto a posto.
            </R.Text>
          </R.View>
        ) : sessionData.compilationResult?.errors ? (
          <R.View style={st.boxEncourage}>
            <R.Text style={st.boxText}>
              Il compilatore ha trovato qualche errore — non preoccuparti, anche i programmatori esperti ne fanno. L'importante e' capire perche'.
            </R.Text>
          </R.View>
        ) : null}
      </PageWrap>
    );
  };

  // ━━━ PAGE 5 (conditional): CHAT WITH GALILEO ━━━
  const ChatPage = () => {
    if (!hasChat) return null;
    pageNum++;
    const keyMessages = selectKeyMessages(sessionData.chatMessages);
    return (
      <PageWrap pageNum={pageNum} totalPages={totalPages}>
        <R.Text style={st.sectionTitle}>La Tua Conversazione con Galileo</R.Text>
        <R.Text style={st.narrative}>
          {sessionData.messageCount < 3
            ? 'Hai preferito esplorare da solo — segno di sicurezza!'
            : `Durante la sessione hai scambiato ${sessionData.messageCount} messaggi con Galileo. Ecco i momenti chiave:`}
        </R.Text>
        {keyMessages.map((msg, i) => {
          const isGalileo = msg.role === 'assistant';
          const text = stripHtml(msg.content).slice(0, 200);
          if (!text) return null;
          return (
            <R.View key={i} style={isGalileo ? st.chatBubbleGalileo : st.chatBubbleStudent}>
              <R.Text style={isGalileo ? st.chatRole : st.chatRoleStudent}>
                {isGalileo ? 'Galileo' : 'Tu'}
              </R.Text>
              <R.Text style={st.chatText}>
                {text}{msg.content && stripHtml(msg.content).length > 200 ? '...' : ''}
              </R.Text>
            </R.View>
          );
        })}
      </PageWrap>
    );
  };

  // ━━━ PAGE 6 (conditional): QUIZ ━━━
  const QuizPage = () => {
    if (!hasQuiz) return null;
    pageNum++;
    const quiz = exp.quiz;
    const answers = sessionData.quizResults.answers || [];
    const score = sessionData.quizResults.score || 0;
    const total = sessionData.quizResults.total || quiz.length;

    return (
      <PageWrap pageNum={pageNum} totalPages={totalPages}>
        <R.Text style={st.sectionTitle}>La Sfida del Quiz</R.Text>
        <R.Text style={st.narrative}>
          Dopo aver lavorato sul circuito, hai messo alla prova quello che hai imparato.
        </R.Text>

        {quiz.map((q, qi) => {
          const studentAnswer = answers[qi];
          const isCorrect = studentAnswer === q.correct;
          return (
            <R.View key={qi}>
              <R.Text style={st.quizQuestion}>
                {qi + 1}. {q.question}
              </R.Text>
              {q.options.map((opt, oi) => {
                const isStudentPick = oi === studentAnswer;
                const isRight = oi === q.correct;
                let style = { ...st.quizOption };
                if (isStudentPick && isRight) style = { ...style, ...st.quizCorrect };
                else if (isStudentPick && !isRight) style = { ...style, ...st.quizWrong };
                else if (isRight) style = { ...style, ...st.quizCorrect };
                return (
                  <R.Text key={oi} style={style}>
                    {isStudentPick ? '▸ ' : '  '}{opt}
                    {isRight ? ' ✓' : ''}
                    {isStudentPick && !isRight ? ' ✗' : ''}
                  </R.Text>
                );
              })}
              <R.Text style={st.quizExplanation}>
                {q.explanation}
              </R.Text>
            </R.View>
          );
        })}

        <R.View style={st.starsRow}>
          <R.Text style={st.starText}>{renderStars(score, total)}</R.Text>
        </R.View>
        <R.Text style={{ ...st.narrative, textAlign: 'center', marginTop: 4 }}>
          {score === total ? 'Perfetto! Hai capito tutto al primo colpo.'
            : score > 0 ? `${score} su ${total} — ci sei quasi! Rileggi le spiegazioni.`
            : 'Questa volta non e\' andata — ma ora hai le spiegazioni per capire meglio.'}
        </R.Text>
      </PageWrap>
    );
  };

  // ━━━ LAST PAGE: THE MEANING ━━━
  const SummaryPage = () => {
    pageNum++;
    const summary = aiSummary || { riassunto: [], prossimoPassoSuggerito: '', concettiToccati: [] };
    return (
      <PageWrap pageNum={pageNum} totalPages={totalPages}>
        <R.Text style={st.sectionTitle}>Il Senso della Tua Avventura</R.Text>

        {summary.riassunto.map((line, i) => (
          <R.Text key={i} style={st.summaryBullet}>
            {'•  '}{line}
          </R.Text>
        ))}

        {summary.concettiToccati?.length > 0 && (
          <R.View style={{ marginTop: 12 }}>
            <R.Text style={{ ...st.narrative, fontWeight: 700 }}>
              Concetti toccati:
            </R.Text>
            {summary.concettiToccati.map((c, i) => (
              <R.Text key={i} style={st.componentItem}>{'•  '}{c}</R.Text>
            ))}
          </R.View>
        )}

        {summary.prossimoPassoSuggerito && (
          <R.View style={{ ...st.boxSuccess, marginTop: 16 }}>
            <R.Text style={{ ...st.boxText, fontWeight: 700 }}>
              Il prossimo passo:
            </R.Text>
            <R.Text style={st.boxText}>
              {summary.prossimoPassoSuggerito}
            </R.Text>
          </R.View>
        )}

        <R.Text style={{ ...st.narrativeItalic, textAlign: 'center', marginTop: 30 }}>
          Generato con ELAB Tutor — elabtutor.school
        </R.Text>
      </PageWrap>
    );
  };

  // ━━━ Assemble document ━━━
  const doc = (
    <R.Document title={`Report - ${exp?.title || 'Sessione ELAB'}`} author="ELAB Tutor">
      <CoverPage />
      <MissionPage />
      <CircuitPage />
      {hasCode && <CodePage />}
      {hasChat && <ChatPage />}
      {hasQuiz && <QuizPage />}
      <SummaryPage />
    </R.Document>
  );

  // Generate blob and download
  const blob = await R.pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ELAB-Report-${exp?.id || 'sessione'}-${dateStr}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}
```

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Expected: Build success (component is tree-shaken until called).

---

## Task 4: Add Report button to NewElabSimulator toolbar

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx`

**Why:** The user clicks this button to generate the PDF. It needs access to canvasContainerRef and circuit state.

**Step 1: Import the services**

At the top of the file (near existing imports, around line 49):

```javascript
import { collectSessionData, captureCircuit, fetchAISummary } from '../../services/sessionReportService';
import { generateSessionReportPDF } from '../report/SessionReportPDF';
```

**Step 2: Add state for report generation**

Near line 220 (with other useState declarations):

```javascript
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
```

**Step 3: Add the handler function**

Near `handleExportPng` (around line 2735), add:

```javascript
const handleGenerateReport = useCallback(async () => {
  if (isGeneratingReport || !currentExperiment) return;
  setIsGeneratingReport(true);
  try {
    // 1. Capture screenshot
    const screenshot = await captureCircuit(canvasContainerRef);

    // 2. Collect session data
    const sessionData = collectSessionData({
      messages: messagesRef.current || [],
      activeExperiment: currentExperiment,
      circuitStateRef,
      canvasContainerRef,
      quizResults: quizResultsRef.current || null,
      codeContent: codeContentRef.current || null,
      compilationResult: compilationResultRef.current || null,
      sessionStartTime: sessionStartRef.current || Date.now(),
      buildStepIndex: buildStepIndexRef.current || -1,
      buildStepsTotal: currentExperiment?.buildSteps?.length || 0,
      isCircuitComplete: isCircuitCompleteRef.current || false,
    });

    // 3. Fetch AI summary (with fallback)
    const aiSummary = await fetchAISummary(sessionData);

    // 4. Generate and download PDF
    await generateSessionReportPDF(sessionData, screenshot, aiSummary);
  } catch (err) {
    console.error('Report generation failed:', err);
  } finally {
    setIsGeneratingReport(false);
  }
}, [currentExperiment, isGeneratingReport]);
```

**Step 4: Pass handler to ControlBar**

In the ControlBar props area (around line 2816-2858), add the new prop:

```javascript
onGenerateReport={currentExperiment ? handleGenerateReport : undefined}
isGeneratingReport={isGeneratingReport}
```

**Step 5: Render button in ControlBar**

Locate the ControlBar component definition (it may be inline or a separate file). Add a button next to the existing export PNG button:

```jsx
{onGenerateReport && (
  <button
    onClick={onGenerateReport}
    disabled={isGeneratingReport}
    title="Genera Report PDF della sessione"
    style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '6px 10px', borderRadius: 6,
      border: '1px solid #1E4D8C', background: '#1E4D8C',
      color: '#fff', cursor: isGeneratingReport ? 'wait' : 'pointer',
      fontSize: 12, fontFamily: 'var(--font-sans)',
      opacity: isGeneratingReport ? 0.6 : 1,
    }}
  >
    {isGeneratingReport ? '⏳ Generazione...' : '📄 Report PDF'}
  </button>
)}
```

---

## Task 5: Wire data refs from ElabTutorV4 → NewElabSimulator

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx`
- Modify: `src/components/simulator/NewElabSimulator.jsx`

**Why:** The simulator needs access to chat messages, quiz results, and session start time — which live in ElabTutorV4. We pass these down via refs.

**Step 1: Create refs in ElabTutorV4 for session data**

Near line 114 (existing refs), add:

```javascript
const messagesForReportRef = useRef([]);
const quizResultsForReportRef = useRef(null);
```

**Step 2: Keep refs in sync**

After the messages state updates, add a useEffect (near other effects):

```javascript
useEffect(() => {
  messagesForReportRef.current = messages;
}, [messages]);
```

**Step 3: Add quiz result callback**

When QuizPanel reports results, store them:

```javascript
const handleQuizComplete = useCallback((results) => {
  quizResultsForReportRef.current = results;
}, []);
```

**Step 4: Pass refs to NewElabSimulator**

In the JSX where NewElabSimulator is rendered, add props:

```jsx
<NewElabSimulator
  // ...existing props
  messagesRef={messagesForReportRef}
  quizResultsRef={quizResultsForReportRef}
  sessionStartRef={sessionStartRef}
/>
```

**Step 5: Accept refs in NewElabSimulator**

In NewElabSimulator's props destructuring, add:

```javascript
messagesRef,
quizResultsRef,
sessionStartRef,
```

Also create local refs for code/compilation/circuit-complete that the simulator already tracks, and expose them to the report handler.

---

## Task 6: Build, test, and verify

**Files:** None new

**Step 1: Build**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -20
```

Expected: Build success, 0 errors. Bundle size should increase minimally (SessionReportPDF is code-split with @react-pdf/renderer).

**Step 2: Manual test**

1. Open http://localhost:5173
2. Select any Vol1 experiment
3. Build a few components
4. Chat with Galileo
5. Try the quiz
6. Click "Report PDF" in toolbar
7. Verify PDF downloads with correct filename
8. Open PDF and check all 6-7 pages render correctly

**Step 3: Test edge cases**

- Report with no quiz done (should show "Non hai ancora provato...")
- Report with no chat messages (should skip chat page)
- Report with no code (Vol1/Vol2 — should skip code page)
- Report with incomplete circuit (should show encouragement)
- Report when nanobot is down (should use local fallback summary)

**Step 4: Deploy**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
```

---

## Summary of Files

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/components/simulator/utils/exportPng.js` | Add `captureCanvasBase64()` |
| Create | `src/services/sessionReportService.js` | Data collection + AI summary orchestration |
| Create | `src/components/report/SessionReportPDF.jsx` | @react-pdf document (6-8 pages) |
| Modify | `src/components/simulator/NewElabSimulator.jsx` | Add Report button + handler |
| Modify | `src/components/tutor/ElabTutorV4.jsx` | Wire data refs for report |
