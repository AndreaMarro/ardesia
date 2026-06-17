/**
 * SessionReportPDF — PDF Report della sessione ELAB
 * Genera un documento PDF narrativo con stile ELAB.
 * Copyright (c) Andrea Marro
 */

let P = null;

async function loadRenderer() {
  if (!P) {
    P = await import('@react-pdf/renderer');
    P.Font.register({
      family: 'Oswald',
      fonts: [
        { src: '/fonts/Oswald-Bold.ttf', fontWeight: 700 },
        { src: '/fonts/Oswald-Regular.ttf', fontWeight: 400 },
      ],
    });
    P.Font.register({
      family: 'OpenSans',
      fonts: [
        { src: '/fonts/OpenSans-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 700 },
        { src: '/fonts/OpenSans-Italic.ttf', fontStyle: 'italic' },
      ],
    });
    P.Font.register({
      family: 'FiraCode',
      src: '/fonts/FiraCode-Regular.ttf',
    });
  }
  return P;
}

const COMPONENT_NAMES = {
  'battery9v': 'Batteria 9V', 'breadboard-half': 'Breadboard (mezza)',
  'breadboard-full': 'Breadboard (intera)', 'led': 'LED', 'resistor': 'Resistore',
  'capacitor': 'Condensatore', 'push-button': 'Pulsante', 'potentiometer': 'Potenziometro',
  'photoResistor': 'Fotoresistore', 'buzzerPiezo': 'Buzzer Piezoelettrico',
  'motorDC': 'Motore DC', 'diode': 'Diodo', 'mosfet-n': 'MOSFET (canale N)',
  'phototransistor': 'Fototransistore', 'reed-switch': 'Interruttore Reed',
  'servo': 'Servomotore', 'lcd-16x2': 'Display LCD 16x2', 'multimeter': 'Multimetro',
  'rgb-led': 'LED RGB', 'nano-r4': 'Arduino Nano R4',
};

function getComponentName(type, comp) {
  let name = COMPONENT_NAMES[type] || type;
  if (type === 'resistor' && comp.value) name += ` (${comp.value}\u03A9)`;
  if (type === 'led' && comp.color) name += ` (${comp.color})`;
  if (type === 'capacitor' && comp.value) name += ` (${comp.value}\u00B5F)`;
  return name;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\[AZIONE:[^\]]*\]/g, '').trim();
}

function selectKeyMessages(messages, max = 15) {
  if (!messages || messages.length === 0) return [];
  if (messages.length <= max) return messages;
  const result = [messages[0]];
  const middle = messages.slice(1, -1);
  const important = middle.filter(m =>
    m.content?.includes('?') || m.content?.includes('errore') ||
    m.content?.includes('sbagliato') || m.content?.includes('perch')
  );
  for (const m of important.slice(0, max - 2)) {
    if (!result.includes(m)) result.push(m);
  }
  const remaining = max - result.length - 1;
  if (remaining > 0 && middle.length > 0) {
    const step = Math.max(1, Math.floor(middle.length / remaining));
    for (let i = 0; i < middle.length && result.length < max - 1; i += step) {
      if (!result.includes(middle[i])) result.push(middle[i]);
    }
  }
  if (messages.length > 1) result.push(messages[messages.length - 1]);
  return result;
}

function renderStars(score, total) {
  const filled = total > 0 ? Math.round((score / total) * 3) : 0;
  return Array.from({ length: 3 }, (_, i) => i < filled ? '\u2605' : '\u2606').join(' ');
}

function getWatermark() {
  const d = new Date();
  return `Andrea Marro \u2014 ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `0:${String(sec).padStart(2, '0')}`;
}

const EVENT_LABELS = {
  experiment_loaded: { icon: null, label: 'Esperimento caricato' },
  simulation_started: { icon: null, label: 'Simulazione avviata' },
  simulation_stopped: { icon: null, label: 'Simulazione fermata' },
  code_compiled: { icon: null, label: 'Codice compilato' },
  report_generated: { icon: null, label: 'Report generato' },
  component_placed: { icon: null, label: 'Componente piazzato' },
  wire_connected: { icon: null, label: 'Filo collegato' },
  quiz_answered: { icon: null, label: 'Quiz risposto' },
  error_occurred: { icon: null, label: 'Errore' },
};

function getEventDisplay(event) {
  const cfg = EVENT_LABELS[event.type] || { icon: '•', label: event.type };
  let detail = cfg.label;
  if (event.type === 'experiment_loaded' && event.experimentName) {
    detail = `Caricato: ${event.experimentName}`;
  } else if (event.type === 'code_compiled') {
    detail = event.success ? 'Compilazione riuscita' : `Compilazione fallita (${event.errorCount || 0} errori)`;
  }
  return { icon: cfg.icon, detail };
}

export async function generateSessionReportPDF(sessionData, circuitScreenshot, aiSummary, timeline = [], measurements = null) {
  const R = await loadRenderer();
  const vol = sessionData.volumeColor;
  const watermark = getWatermark();
  const exp = sessionData.experiment;

  const st = R.StyleSheet.create({
    page: { fontFamily: 'OpenSans', fontSize: 10, color: 'var(--elab-hex-333333)', paddingTop: 40, paddingBottom: 60, paddingHorizontal: 40 },
    headerBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: 'var(--elab-navy)' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, borderTopWidth: 3, borderTopColor: vol },
    footerText: { fontSize: 8, color: 'var(--elab-hex-737373)', fontFamily: 'OpenSans' },
    coverTitle: { fontFamily: 'Oswald', fontSize: 28, fontWeight: 700, color: 'var(--elab-navy)', marginTop: 100, textAlign: 'center' },
    coverSubtitle: { fontFamily: 'Oswald', fontSize: 16, fontWeight: 400, color: vol, textAlign: 'center', marginTop: 8 },
    coverDate: { fontSize: 11, color: 'var(--elab-hex-666666)', textAlign: 'center', marginTop: 16 },
    sectionTitle: { fontFamily: 'Oswald', fontSize: 20, fontWeight: 700, color: 'var(--elab-navy)', marginBottom: 12 },
    narrative: { fontSize: 10, lineHeight: 1.6, color: 'var(--elab-hex-333333)', marginBottom: 8 },
    narrativeItalic: { fontSize: 9, fontStyle: 'italic', color: 'var(--elab-hex-666666)', marginBottom: 8 },
    boxSuccess: { backgroundColor: 'var(--elab-hex-e8f5e9)', borderLeftWidth: 4, borderLeftColor: 'var(--elab-hex-4caf50)', padding: 10, marginVertical: 8, borderRadius: 2 },
    boxEncourage: { backgroundColor: 'var(--elab-hex-fff3e0)', borderLeftWidth: 4, borderLeftColor: 'var(--elab-hex-ff9800)', padding: 10, marginVertical: 8, borderRadius: 2 },
    boxText: { fontSize: 10, lineHeight: 1.5 },
    circuitImage: { width: '100%', maxHeight: 340, objectFit: 'contain', marginVertical: 10, borderWidth: 1, borderColor: 'var(--elab-hex-e0e0e0)', borderRadius: 4 },
    codeBlock: { backgroundColor: 'var(--elab-hex-f5f5f5)', padding: 10, borderRadius: 4, marginVertical: 8 },
    codeText: { fontFamily: 'FiraCode', fontSize: 8, color: 'var(--elab-hex-333333)', lineHeight: 1.5 },
    chatUnlim: { backgroundColor: 'var(--elab-hex-e8edf4)', padding: 8, borderRadius: 6, marginBottom: 6, marginRight: 40 },
    chatStudent: { backgroundColor: 'var(--elab-hex-f5f5f5)', padding: 8, borderRadius: 6, marginBottom: 6, marginLeft: 40 },
    chatRole: { fontFamily: 'Oswald', fontSize: 8, fontWeight: 700, color: 'var(--elab-navy)', marginBottom: 2 },
    chatRoleStudent: { fontFamily: 'Oswald', fontSize: 8, fontWeight: 700, color: 'var(--elab-hex-666666)', marginBottom: 2, textAlign: 'right' },
    chatText: { fontSize: 9, lineHeight: 1.4, color: 'var(--elab-hex-333333)' },
    quizQuestion: { fontFamily: 'OpenSans', fontWeight: 700, fontSize: 10, marginBottom: 6, marginTop: 10 },
    quizOption: { fontSize: 9, paddingVertical: 3, paddingLeft: 12 },
    quizCorrect: { color: 'var(--elab-hex-2e7d32)' },
    quizWrong: { color: 'var(--elab-hex-e65100)' },
    quizExplanation: { fontSize: 9, fontStyle: 'italic', color: 'var(--elab-hex-555555)', marginTop: 4, paddingLeft: 12 },
    starsRow: { flexDirection: 'row', marginVertical: 6, justifyContent: 'center' },
    starText: { fontSize: 18, marginHorizontal: 2 },
    componentItem: { fontSize: 9, color: 'var(--elab-hex-444444)', marginBottom: 2, paddingLeft: 8 },
    summaryBullet: { fontSize: 10, lineHeight: 1.6, color: 'var(--elab-hex-333333)', marginBottom: 6, paddingLeft: 12 },
    // Phase 6: Timeline & Measurements styles
    timelineRow: { flexDirection: 'row', marginBottom: 4, paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: 'var(--elab-hex-eeeeee)' },
    timelineTime: { width: 60, fontSize: 8, color: 'var(--elab-hex-737373)', fontFamily: 'FiraCode' },
    timelineIcon: { width: 18, fontSize: 10, textAlign: 'center' },
    timelineText: { flex: 1, fontSize: 9, color: 'var(--elab-hex-333333)' },
    measureTable: { marginVertical: 8 },
    measureHeaderRow: { flexDirection: 'row', backgroundColor: 'var(--elab-navy)', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 2 },
    measureHeaderText: { color: 'var(--elab-hex-ffffff)', fontSize: 8, fontFamily: 'Oswald', fontWeight: 700 },
    measureRow: { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: 'var(--elab-hex-eeeeee)' },
    measureCell: { fontSize: 8, fontFamily: 'FiraCode', color: 'var(--elab-hex-333333)' },
  });

  // Determine which conditional pages exist
  const hasCode = exp?.simulationMode === 'avr' && sessionData.codeContent;
  const hasChat = sessionData.messageCount > 0;
  const hasQuiz = sessionData.quizResults && exp?.quiz?.length > 0;

  const PageWrap = ({ children }) => {
    return (
      <R.Page size="A4" style={st.page}>
        <R.View style={st.headerBar} fixed />
        {children}
        <R.View style={st.footer} fixed>
          <R.Text style={st.footerText}>{watermark}</R.Text>
          <R.Text style={st.footerText} render={({ pageNumber, totalPages: tp }) => `Pagina ${pageNumber} di ${tp}`} />
        </R.View>
      </R.Page>
    );
  };

  // Build pages
  const pages = [];

  // PAGE 1: COVER
  pages.push(
    <PageWrap key="cover">
      <R.Text style={st.coverTitle}>La tua avventura con</R.Text>
      <R.Text style={st.coverSubtitle}>{exp?.title || 'ELAB Simulator'}</R.Text>
      <R.Text style={st.coverDate}>{sessionData.sessionDate} — ore {sessionData.sessionTime}</R.Text>
      <R.Text style={st.coverDate}>Durata: {sessionData.duration} minuti</R.Text>
      {exp?.chapter && (
        <R.Text style={{ ...st.narrativeItalic, textAlign: 'center', marginTop: 20 }}>{exp.chapter}</R.Text>
      )}
      <R.Text style={{ ...st.narrativeItalic, textAlign: 'center', marginTop: 60, fontSize: 10, color: 'var(--elab-navy)' }}>
        ELAB — Elettronica Lab
      </R.Text>
    </PageWrap>
  );

  // PAGE 2: THE MISSION
  const uniqueTypes = [...new Set((exp?.components || []).map(c => c.type))];
  pages.push(
    <PageWrap key="mission">
      <R.Text style={st.sectionTitle}>La Missione di Oggi</R.Text>
      <R.Text style={st.narrative}>{exp?.desc || 'Esplora il mondo dell\'elettronica con ELAB!'}</R.Text>
      {uniqueTypes.length > 0 && (
        <R.View style={{ marginTop: 10 }}>
          <R.Text style={{ ...st.narrative, fontWeight: 700 }}>I tuoi strumenti:</R.Text>
          {uniqueTypes.map((type, i) => {
            const comp = (exp?.components || []).find(c => c.type === type) || {};
            return <R.Text key={i} style={st.componentItem}>{'\u2022  '}{getComponentName(type, comp)}</R.Text>;
          })}
        </R.View>
      )}
      {exp?.concept && (
        <R.View style={{ ...st.boxSuccess, marginTop: 16 }}>
          <R.Text style={st.boxText}>{exp.concept}</R.Text>
        </R.View>
      )}
    </PageWrap>
  );

  // PAGE 3: THE CIRCUIT
  pages.push(
    <PageWrap key="circuit">
      <R.Text style={st.sectionTitle}>Il Tuo Circuito</R.Text>
      {circuitScreenshot ? (
        <R.Image src={circuitScreenshot} style={st.circuitImage} />
      ) : (
        <R.View style={st.boxEncourage}>
          <R.Text style={st.boxText}>Screenshot del circuito non disponibile.</R.Text>
        </R.View>
      )}
      {sessionData.isCircuitComplete ? (
        <R.View style={st.boxSuccess}>
          <R.Text style={st.boxText}>Ce l'hai fatta! Ogni componente al suo posto, ogni filo collegato. Il circuito funziona.</R.Text>
        </R.View>
      ) : sessionData.buildProgress ? (
        <R.View style={st.boxEncourage}>
          <R.Text style={st.boxText}>
            Hai completato {sessionData.buildProgress.current} passi su {sessionData.buildProgress.total}. Ogni passo conta — la prossima volta partirai avvantaggiato!
          </R.Text>
        </R.View>
      ) : (
        <R.View style={st.boxEncourage}>
          <R.Text style={st.boxText}>Il circuito non era ancora finito — nessun problema! Ogni tentativo e' un passo avanti.</R.Text>
        </R.View>
      )}
    </PageWrap>
  );

  // PAGE 3.5: PROCEDURA (Timeline) — Phase 6
  if (timeline && timeline.length > 0) {
    // Filter out report_generated (meta-event, not useful to student)
    const displayEvents = timeline.filter(e => e.type !== 'report_generated').slice(0, 30);
    pages.push(
      <PageWrap key="timeline">
        <R.Text style={st.sectionTitle}>La Tua Procedura</R.Text>
        <R.Text style={st.narrative}>
          Ecco cosa hai fatto durante la sessione, passo dopo passo:
        </R.Text>
        <R.View style={{ marginTop: 8 }}>
          {displayEvents.map((event, i) => {
            const { icon, detail } = getEventDisplay(event);
            return (
              <R.View key={i} style={st.timelineRow}>
                <R.Text style={st.timelineTime}>{formatElapsed(event.elapsed)}</R.Text>
                <R.Text style={st.timelineIcon}>{icon}</R.Text>
                <R.Text style={st.timelineText}>{detail}</R.Text>
              </R.View>
            );
          })}
        </R.View>
        {timeline.length > 30 && (
          <R.Text style={st.narrativeItalic}>
            ... e altri {timeline.length - 30} eventi (mostrati i primi 30).
          </R.Text>
        )}
      </PageWrap>
    );
  }

  // PAGE 3.6: MISURE ELETTRICHE — Phase 6
  const hasVoltages = measurements && Object.keys(measurements.voltages || {}).length > 0;
  const hasCurrents = measurements && Object.keys(measurements.currents || {}).length > 0;
  if (hasVoltages || hasCurrents) {
    pages.push(
      <PageWrap key="measurements">
        <R.Text style={st.sectionTitle}>Misure Elettriche</R.Text>
        <R.Text style={st.narrative}>
          Queste sono le misure reali del tuo circuito, calcolate dal simulatore:
        </R.Text>

        {hasVoltages && (
          <R.View style={st.measureTable}>
            <R.Text style={{ ...st.narrative, fontWeight: 700, marginBottom: 4 }}>Tensioni (Volt)</R.Text>
            <R.View style={st.measureHeaderRow}>
              <R.Text style={{ ...st.measureHeaderText, flex: 2 }}>Nodo</R.Text>
              <R.Text style={{ ...st.measureHeaderText, flex: 1, textAlign: 'right' }}>Tensione (V)</R.Text>
            </R.View>
            {Object.entries(measurements.voltages).slice(0, 20).map(([node, v], i) => (
              <R.View key={i} style={{ ...st.measureRow, backgroundColor: i % 2 === 0 ? 'var(--elab-hex-fafafa)' : 'var(--elab-hex-ffffff)' }}>
                <R.Text style={{ ...st.measureCell, flex: 2 }}>{node}</R.Text>
                <R.Text style={{ ...st.measureCell, flex: 1, textAlign: 'right' }}>{v} V</R.Text>
              </R.View>
            ))}
          </R.View>
        )}

        {hasCurrents && (
          <R.View style={st.measureTable}>
            <R.Text style={{ ...st.narrative, fontWeight: 700, marginBottom: 4, marginTop: 12 }}>Correnti (Ampere)</R.Text>
            <R.View style={st.measureHeaderRow}>
              <R.Text style={{ ...st.measureHeaderText, flex: 2 }}>Componente</R.Text>
              <R.Text style={{ ...st.measureHeaderText, flex: 1, textAlign: 'right' }}>Corrente (mA)</R.Text>
            </R.View>
            {Object.entries(measurements.currents).slice(0, 20).map(([compId, amps], i) => {
              const compName = COMPONENT_NAMES[compId.replace(/\d+$/, '')] || compId;
              return (
                <R.View key={i} style={{ ...st.measureRow, backgroundColor: i % 2 === 0 ? 'var(--elab-hex-fafafa)' : 'var(--elab-hex-ffffff)' }}>
                  <R.Text style={{ ...st.measureCell, flex: 2 }}>{compId} ({compName})</R.Text>
                  <R.Text style={{ ...st.measureCell, flex: 1, textAlign: 'right' }}>{(amps * 1000).toFixed(1)} mA</R.Text>
                </R.View>
              );
            })}
          </R.View>
        )}

        <R.View style={{ ...st.boxSuccess, marginTop: 12 }}>
          <R.Text style={st.boxText}>
            Queste misure corrispondono a quello che leggeresti con un multimetro reale. Confrontale con le formule del libro!
          </R.Text>
        </R.View>
      </PageWrap>
    );
  }

  // PAGE 4 (conditional): THE CODE
  if (hasCode) {
    const codeLines = (sessionData.codeContent || '').split('\n').slice(0, 40);
    const truncated = (sessionData.codeContent || '').split('\n').length > 40;
    pages.push(
      <PageWrap key="code">
        <R.Text style={st.sectionTitle}>Il Tuo Codice</R.Text>
        <R.Text style={st.narrative}>
          Hai scritto {(sessionData.codeContent || '').split('\n').length} righe di codice Arduino per controllare il circuito.
        </R.Text>
        <R.View style={st.codeBlock}>
          <R.Text style={st.codeText}>{codeLines.join('\n')}{truncated ? '\n// ... (codice troncato)' : ''}</R.Text>
        </R.View>
        {sessionData.compilationResult?.success ? (
          <R.View style={st.boxSuccess}>
            <R.Text style={st.boxText}>Compilazione riuscita! Il compilatore ha detto: tutto a posto.</R.Text>
          </R.View>
        ) : sessionData.compilationResult?.errors ? (
          <R.View style={st.boxEncourage}>
            <R.Text style={st.boxText}>Il compilatore ha trovato qualche errore — non preoccuparti, anche i programmatori esperti ne fanno.</R.Text>
          </R.View>
        ) : null}
      </PageWrap>
    );
  }

  // PAGE 5 (conditional): CHAT
  if (hasChat) {
    const keyMsgs = selectKeyMessages(sessionData.chatMessages);
    pages.push(
      <PageWrap key="chat">
        <R.Text style={st.sectionTitle}>La Tua Conversazione con UNLIM</R.Text>
        <R.Text style={st.narrative}>
          {sessionData.messageCount < 3
            ? 'Hai preferito esplorare da solo — segno di sicurezza!'
            : `Durante la sessione hai scambiato ${sessionData.messageCount} messaggi con UNLIM. Ecco i momenti chiave:`}
        </R.Text>
        {keyMsgs.map((msg, i) => {
          const isG = msg.role === 'assistant';
          const text = stripHtml(msg.content).slice(0, 200);
          if (!text) return null;
          return (
            <R.View key={i} style={isG ? st.chatUnlim : st.chatStudent}>
              <R.Text style={isG ? st.chatRole : st.chatRoleStudent}>{isG ? 'UNLIM' : 'Tu'}</R.Text>
              <R.Text style={st.chatText}>{text}{stripHtml(msg.content).length > 200 ? '...' : ''}</R.Text>
            </R.View>
          );
        })}
      </PageWrap>
    );
  }

  // PAGE 6 (conditional): QUIZ
  if (hasQuiz) {
    const quiz = exp.quiz;
    const answers = sessionData.quizResults.answers || [];
    const score = sessionData.quizResults.score || 0;
    const total = sessionData.quizResults.total || quiz.length;
    pages.push(
      <PageWrap key="quiz">
        <R.Text style={st.sectionTitle}>La Sfida del Quiz</R.Text>
        <R.Text style={st.narrative}>Dopo aver lavorato sul circuito, hai messo alla prova quello che hai imparato.</R.Text>
        {quiz.map((q, qi) => {
          const studentAnswer = answers[qi];
          const isCorrect = studentAnswer === q.correct;
          return (
            <R.View key={qi}>
              <R.Text style={st.quizQuestion}>{qi + 1}. {q.question}</R.Text>
              {q.options.map((opt, oi) => {
                const isPick = oi === studentAnswer;
                const isRight = oi === q.correct;
                let color = 'var(--elab-hex-333333)';
                if (isPick && isRight) color = 'var(--elab-hex-2e7d32)';
                else if (isPick && !isRight) color = 'var(--elab-hex-e65100)';
                else if (isRight) color = 'var(--elab-hex-2e7d32)';
                return (
                  <R.Text key={oi} style={{ ...st.quizOption, color }}>
                    {isPick ? '\u25B8 ' : '  '}{opt}{isRight ? ' \u2713' : ''}{isPick && !isRight ? ' \u2717' : ''}
                  </R.Text>
                );
              })}
              <R.Text style={st.quizExplanation}>{q.explanation}</R.Text>
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
  }

  // LAST PAGE: THE MEANING
  const summary = aiSummary || { riassunto: [], prossimoPassoSuggerito: '', concettiToccati: [] };
  pages.push(
    <PageWrap key="summary">
      <R.Text style={st.sectionTitle}>Il Senso della Tua Avventura</R.Text>
      {summary.riassunto.map((line, i) => (
        <R.Text key={i} style={st.summaryBullet}>{'\u2022  '}{line}</R.Text>
      ))}
      {summary.concettiToccati?.length > 0 && (
        <R.View style={{ marginTop: 12 }}>
          <R.Text style={{ ...st.narrative, fontWeight: 700 }}>Concetti toccati:</R.Text>
          {summary.concettiToccati.map((c, i) => (
            <R.Text key={i} style={st.componentItem}>{'\u2022  '}{c}</R.Text>
          ))}
        </R.View>
      )}
      {summary.prossimoPassoSuggerito && (
        <R.View style={{ ...st.boxSuccess, marginTop: 16 }}>
          <R.Text style={{ ...st.boxText, fontWeight: 700 }}>Il prossimo passo:</R.Text>
          <R.Text style={st.boxText}>{summary.prossimoPassoSuggerito}</R.Text>
        </R.View>
      )}
      <R.Text style={{ ...st.narrativeItalic, textAlign: 'center', marginTop: 40 }}>
        Generato con ELAB Tutor — elabtutor.school
      </R.Text>
    </PageWrap>
  );

  // Assemble and download
  const doc = (
    <R.Document title={`Report - ${exp?.title || 'Sessione ELAB'}`} author="ELAB Tutor">
      {pages}
    </R.Document>
  );

  const blob = await R.pdf(doc).toBlob();
  const filename = `ELAB-Report-${exp?.id || 'sessione'}-${new Date().toISOString().slice(0, 10)}.pdf`;

  // Return blob+filename so the caller can trigger download with a fresh user gesture.
  // Chrome blocks a.click() downloads after async work exhausts the transient user activation (~5s).
  return { blob, filename };
}
