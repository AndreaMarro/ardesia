// ============================================
// AI Circuit Generator + Student-as-Reviewer
// OECD 2026: Pedagogically intentional AI use
// SafeMarkdown (no XSS), "Non so" celebrato
// © Andrea Marro — 2026
// ============================================

import React, { useState } from 'react';
import { sendChat } from '../../services/api';
import REVIEW_CIRCUITS from '../../data/review-circuits';
import SafeMarkdown from './shared/SafeMarkdown';
import { StarResult } from './shared/StarRating';
import ReflectionPrompt from './shared/ReflectionPrompt';
import CrossNavigation from './shared/CrossNavigation';
import './TutorTools.css';

function calcReviewStars(answersCount, textsCount) {
  if (answersCount > 0 && textsCount >= 3) return 3;
  if (answersCount > 0) return 2;
  return 1;
}

const REVIEW_STAR_MESSAGES = {
  3: 'Revisore esperto! Risposte motivate e critiche.',
  2: 'Buona revisione! Prova ad aggiungere più spiegazioni.',
  1: 'Revisione completata!',
};

const EXAMPLE_PROMPTS = [
  { text: 'Un circuito che suona un allarme quando fa buio', layer: 'terra' },
  { text: 'Un semaforo per pedoni con pulsante', layer: 'schema' },
  { text: 'Una luce notturna automatica', layer: 'terra' },
  { text: 'Un termometro con LED caldo/freddo', layer: 'schema' },
  { text: 'Un robot che si ferma davanti agli ostacoli', layer: 'cielo' },
  { text: 'Un sistema di irrigazione automatica', layer: 'cielo' }
];

export default function CircuitReview({ onSendToUNLIM, onOpenSimulator, logSession }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [reviewAnswers, setReviewAnswers] = useState({});
  const [reviewTexts, setReviewTexts] = useState({});
  const [reviewComplete, setReviewComplete] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const generateCircuit = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGenerated(null);
    setReviewAnswers({});
    setReviewTexts({});
    setReviewComplete(false);
    setShowReflection(false);

    logSession?.('review-generate', { prompt: prompt.trim() });

    try {
      const systemPrompt = `Sei UNLIM, tutor di elettronica per ragazzi 8-14 anni.
Lo studente vuole un circuito: "${prompt.trim()}"

Genera una risposta con ESATTAMENTE questo formato:

**Circuito: [titolo breve]**

- **Componenti necessari:**
- [lista componenti con valori]

- **Schema di collegamento:**
[descrizione semplice dei collegamenti passo passo]

- **Codice Arduino:**
\`\`\`cpp
[codice Arduino completo e commentato]
\`\`\`

- **Domande di revisione per lo studente:**
1. [domanda critica sul circuito]
2. [domanda su un caso limite]
3. [domanda su alternative]
4. [domanda su miglioramenti]
5. [domanda di comprensione]

Rispondi in italiano, tono amichevole ma preciso.`;

      const result = await sendChat(systemPrompt);

      if (result.success) {
        // Parsing robusto delle domande con fallback multipli
        const resp = result.response || '';
        let questions = [];

        // Strategia 1: cerca la sezione Domande
        const reviewMatch = resp.match(/[-*].*?(?:Domande|domande|DOMANDE|revisione|Revisione).*?\n([\s\S]*?)$/);
        if (reviewMatch) {
          const qLines = reviewMatch[1].split('\n').filter(l => l.trim().match(/^\d+\.\s*.+/));
          qLines.forEach(q => {
            const cleaned = q.replace(/^\d+\.\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
            if (cleaned.length > 5) questions.push(cleaned);
          });
        }

        // Strategia 2: se nessuna domanda trovata, cerca tutte le righe numerate dopo il blocco codice
        if (questions.length === 0) {
          const afterCode = resp.split('```').pop() || '';
          const numbered = afterCode.split('\n').filter(l => l.trim().match(/^\d+\.\s*.{8,}/));
          numbered.forEach(q => {
            const cleaned = q.replace(/^\d+\.\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
            if (cleaned.length > 5) questions.push(cleaned);
          });
        }

        // Strategia 3: cerca righe che iniziano con "- " dopo il codice (liste non numerate)
        if (questions.length === 0) {
          const afterCode = resp.split('```').pop() || '';
          const bulleted = afterCode.split('\n').filter(l => l.trim().match(/^[-•]\s*.{8,}.*\?/));
          bulleted.forEach(q => {
            const cleaned = q.replace(/^[-•]\s*/, '').trim();
            if (cleaned.length > 5) questions.push(cleaned);
          });
        }

        // Fallback finale: domande predefinite pertinenti
        if (questions.length === 0) {
          questions = [
            'Il circuito ha tutti i resistori di protezione necessari?',
            'Cosa succede se un componente si guasta?',
            'Si potrebbe fare in modo più semplice?',
            'Ci sono componenti che consumano troppa corrente?',
            'Hai capito come funziona ogni parte del codice?'
          ];
        }

        // Limita a max 7 domande
        questions = questions.slice(0, 7);

        setGenerated({
          response: resp,
          questions
        });
      } else {
        // G53: Offline fallback — use pre-generated circuits
        useOfflineFallback();
      }
    } catch {
      // G53: Offline fallback — use pre-generated circuits
      useOfflineFallback();
    }

    function useOfflineFallback() {
      const circuit = REVIEW_CIRCUITS[Math.floor(Math.random() * REVIEW_CIRCUITS.length)];
      setGenerated({
        response: circuit.description + '\n\nComponenti: ' + circuit.components.join(', '),
        questions: circuit.questions.map(q => q.text),
        _offlineData: circuit, // Store for answer checking
      });
    }

    setIsGenerating(false);
  };

  const answerQuestion = (index, answer) => {
    setReviewAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const setReviewText = (index, text) => {
    setReviewTexts(prev => ({ ...prev, [index]: text }));
  };

  const submitReview = () => {
    const textsCount = Object.values(reviewTexts).filter(t => t && t.trim().length >= 5).length;
    const stars = calcReviewStars(Object.keys(reviewAnswers).length, textsCount);
    setEarnedStars(stars);
    setReviewComplete(true);
    setShowReflection(true);
    logSession?.('review-complete', {
      prompt: prompt.trim(),
      answers: reviewAnswers,
      texts: reviewTexts,
      questionsCount: generated.questions.length,
      stars
    });
  };

  const allAnswered = generated && generated.questions.length > 0 &&
    Object.keys(reviewAnswers).length === generated.questions.length;

  // Split response at "Domande" heading to show circuit without review questions
  const circuitResponse = generated?.response?.split('- **Domande')[0] || '';

  return (
    <div className="elab-tool">
      {/* Header */}
      <div className="elab-tool__hero">
        <span className="elab-tool__hero-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
        </span>
        <h2>Genera & Rivedi</h2>
        <p>
          Descrivi il circuito che vuoi. UNLIM lo genera, ma il <strong>tuo compito</strong> è rivederlo e criticarlo!
          <br />Un buon ingegnere non si fida mai ciecamente.
        </p>
      </div>

      {/* Input — © Andrea Marro — 20/02/2026 */}
      <div className="elab-tool__card">
        <label style={{ display: 'block', fontWeight: 600, color: 'var(--elab-text)', fontSize: '0.88rem', marginBottom: 8 }}>
          Descrivi il circuito che vuoi:
        </label>
        <div className="elab-tool__input-row">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Es: un allarme che suona quando fa buio..."
            className="elab-tool__input"
            onKeyDown={e => e.key === 'Enter' && generateCircuit()}
            disabled={isGenerating}
          />
          <button
            onClick={generateCircuit}
            disabled={!prompt.trim() || isGenerating}
            className="elab-tool__btn elab-tool__btn--primary"
          >
            {isGenerating ? 'Genero...' : 'Genera'}
          </button>
        </div>

        <div className="elab-tool__suggestions" style={{ marginTop: 8 }}>
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <button key={i} onClick={() => setPrompt(ex.text)} className="elab-tool__suggestion">
              {ex.text}
            </button>
          ))}
        </div>
      </div>

      {/* Risposta AI — SafeMarkdown (no XSS!) */}
      {generated && (
        <div className="elab-tool__card">
          <h3>Circuito generato da UNLIM</h3>
          <SafeMarkdown text={circuitResponse} />
        </div>
      )}

      {/* Domande di Revisione */}
      {generated && generated.questions.length > 0 && (
        <div className="elab-tool__card elab-tool__card--warning">
          <h3 style={{ color: 'var(--color-warning)' }}>La tua revisione</h3>
          <p style={{ color: 'var(--elab-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            Non fidarti ciecamente dell'AI! Rispondi a queste domande:
          </p>

          {generated.questions.map((q, i) => (
            <div key={i} style={{
              marginBottom: 14, padding: '12px 14px', borderRadius: 10,
              background: 'var(--color-bg-secondary)', animation: 'elab-cardIn 0.3s ease backwards',
              animationDelay: `${i * 0.08}s`
            }}>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--elab-text)', marginBottom: 8 }}>
                {i + 1}. {q}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Sì', 'No', 'Non so'].map((answer) => (
                  <button
                    key={answer}
                    onClick={() => answerQuestion(i, answer)}
                    disabled={reviewComplete}
                    className={`elab-tool__option ${reviewAnswers[i] === answer ? 'selected' : ''}`}
                    style={{ width: 'auto', padding: '6px 14px', minHeight: 44 }}
                  >
                    {answer === 'Sì' && '\u2713 '}{answer === 'No' && '\u2717 '}{answer === 'Non so' && '? '}{answer}
                  </button>
                ))}
              </div>
              {/* Celebrate "Non so" */}
              {reviewAnswers[i] === 'Non so' && (
                <p style={{ color: 'var(--elab-navy)', fontSize: '0.875rem', marginTop: 6, fontStyle: 'italic' }}>
                  Ottima onestà! Non sapere è il primo passo per imparare.
                </p>
              )}
              {/* Optional text explanation */}
              {reviewAnswers[i] && (
                <input
                  type="text"
                  value={reviewTexts[i] || ''}
                  onChange={e => setReviewText(i, e.target.value)}
                  placeholder="Perché? (facoltativo)"
                  className="elab-tool__input"
                  style={{ marginTop: 6, fontSize: '0.875rem', minHeight: 44 }}
                  disabled={reviewComplete}
                />
              )}
            </div>
          ))}

          {allAnswered && !reviewComplete && (
            <button onClick={submitReview} className="elab-tool__btn elab-tool__btn--primary elab-tool__btn--full" style={{ marginTop: 8 }}>
              Invia la tua revisione
            </button>
          )}

          {reviewComplete && (
            <div className="elab-tool__result elab-tool__result--correct" style={{ marginTop: 12 }}>
              <span className="elab-tool__result-icon"></span>
              <p className="elab-tool__result-text">Revisione completata!</p>
              <p className="elab-tool__result-sub">
                Un buon ingegnere controlla sempre il lavoro — anche quello dell'AI. Hai valutato {generated.questions.length} aspetti critici.
              </p>
              <div style={{ marginTop: 8 }}>
                <StarResult stars={earnedStars} message={REVIEW_STAR_MESSAGES[earnedStars]} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reflection */}
      {showReflection && reviewComplete && (
        <ReflectionPrompt
          toolName="review"
          activityId={`review-${Date.now()}`}
          onSave={(entry) => { logSession?.('review-reflection', entry); setShowReflection(false); }}
          onDismiss={() => setShowReflection(false)}
        />
      )}

      {/* Cross Navigation */}
      {reviewComplete && (
        <CrossNavigation links={[
          { icon: '', label: 'Apri il Simulatore', action: () => onOpenSimulator?.() },
          { icon: '', label: 'Chiedi a UNLIM', action: () => onSendToUNLIM?.(`Ho generato un circuito "${prompt}". Puoi controllare se è corretto?`) }
        ]} />
      )}
    </div>
  );
}
