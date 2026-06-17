/**
 * PassoPassoUnifiedPanel — UN solo pannello unificato Manuale + Passo Passo.
 *
 * Andrea verbatim 2026-05-25:
 *   "devono essere un unico pannello nella modalità passo passo. usa impeccable"
 *
 * Sostituisce sia VolumeViewer (manuale flottante) sia BuildModeGuide (step
 * panel sopra simulatore) per la SOLA modalità "passo-passo". Negli altri
 * mode il VolumeViewer torna a finestra flottante standalone.
 *
 * Design direction (impeccable):
 *   - "Cartaceo digitale" — estensione del libro fisico, NO glassmorphism,
 *     NO gradient AI-slop. Tipografia stampa + colori palette ELAB volumi.
 *   - Layout asymmetric 60/40 — PDF a sinistra page intera, step a destra.
 *   - Step number gigante Oswald (didattico capitolo-libro), leggibile LIM 5m.
 *   - Hint con stripe arancione left (textbook tip pattern), no card-in-card.
 *   - Btn Avanti lime primario, Indietro ghost.
 *
 * State bridge:
 *   - currentStepIndex + experiment data drilled da LavagnaShell (mirroring
 *     NewElabSimulator.buildStepIndex via elab-build-step-change window event).
 *   - Step nav buttons dispatch `elab-passo-advance` { delta: +1|-1 } che
 *     NewElabSimulator ascolta + applica via handleBuildStepChange.
 *   - Mount/unmount dispatch `elab-unified-passo-active` { active: bool } per
 *     NewElabSimulator → nasconde BuildModeGuide standalone quando attivo.
 *
 * @author Andrea Marro
 * @since 2026-05-25
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import logger from '../../utils/logger';
import FloatingWindow from './FloatingWindow';
import { getCliffhangerFor, getNextExperimentInChain } from '../../services/experimentNarrativeService';
import { findExperimentById } from '../../data/experiments-index';
import { getLessonPath } from '../../data/lesson-paths';
import css from './PassoPassoUnifiedPanel.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const VOLUME_PATHS = {
  1: '/volumes/volume1.pdf',
  2: '/volumes/volume2.pdf',
  3: '/volumes/volume3.pdf',
};

const VOLUME_LABELS = {
  1: 'Volume 1 — Le Basi',
  2: 'Volume 2 — Approfondiamo',
  3: 'Volume 3 — Arduino',
};

function dispatchWindowEvent(name, detail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch (err) {
    logger.warn(`[PassoPassoUnifiedPanel] dispatch ${name} failed:`, err?.message || err);
  }
}

/**
 * Andrea /goal 25/05 PM-3: rendi le frasi del Passo Passo "meno tecniche
 * rivolgendoti ai ragazzi ma rimanendo completamente chiaro sul fare capire
 * cosa fare". Trasforma le stringhe data-side (tecniche, imperative) in
 * frasi rivolte alla classe in plurale ("Ragazzi…") mantenendo i pin/fori
 * esatti (Principio Zero: docente capisce + spiega ai ragazzi col linguaggio
 * giusto, mai sostituendo la precisione tecnica con vaghezza).
 *
 * Pattern-match conservatori: se nessun pattern matcha → testo invariato
 * (mai inventare istruzioni). Solo morfologia di apertura cambia.
 */
function makeStepKidFriendly(rawText) {
  if (!rawText || typeof rawText !== 'string') return rawText;
  let t = rawText.trim();
  // "Posiziona breadboard mezza." → "Ragazzi, mettete la breadboard mezza sul banco."
  t = t.replace(/^Posiziona breadboard\s+(\w+)\.?$/i,
    "Ragazzi, mettete la breadboard $1 sul banco.");
  // "Posiziona batteria 9V." → "Ragazzi, prendete la batteria 9V e mettetela vicino alla breadboard."
  t = t.replace(/^Posiziona batteria\s+(\w+V?)\.?$/i,
    "Ragazzi, prendete la batteria $1 e mettetela vicino alla breadboard.");
  // "Posiziona resistore da 470 ohm nei fori A2, A9." → kid-friendly
  t = t.replace(/^Posiziona resistore\s+da\s+([\w\s]+?)\s+nei fori\s+([\w\d,\s]+)\.?$/i,
    "Ragazzi, prendete il resistore da $1 e infilatene le gambette nei fori $2 della breadboard.");
  // "Posiziona LED red nei fori F9, F10." → kid-friendly
  t = t.replace(/^Posiziona LED\s+(\w+)\s+nei fori\s+([\w\d,\s]+)\.?$/i,
    "Ragazzi, prendete il LED $1 e infilatene le gambette nei fori $2 (la gamba lunga = positivo, la corta = negativo).");
  // Generic "Posiziona X nei fori Y." (component fallback)
  t = t.replace(/^Posiziona\s+(.+?)\s+nei fori\s+([\w\d,\s]+)\.?$/i,
    "Ragazzi, prendete $1 e infilatelo nei fori $2 della breadboard.");
  // Generic "Posiziona X." (no pin info)
  t = t.replace(/^Posiziona\s+(.+?)\.?$/i,
    "Ragazzi, prendete $1 e mettetelo sul banco.");
  // "Collega un filo RED da X a Y." → kid-friendly
  t = t.replace(/^Collega un filo\s+(\w+)\s+da\s+(\S+?)\s+a\s+(\S+?)\.?$/i,
    "Ragazzi, prendete un filo $1 e collegate $2 con $3.");
  // "Collega X a Y." (no color)
  t = t.replace(/^Collega\s+(\S+?)\s+a\s+(\S+?)\.?$/i,
    "Ragazzi, collegate $1 con $2.");
  return t;
}

export default function PassoPassoUnifiedPanel({
  visible = false,
  onClose,
  volumeNumber = 1,
  initialPage = 1,
  onPageChange,
  onVolumeChange,
  // Step state mirroring (from LavagnaShell via elab-build-step-change bridge)
  experimentTitle = '',
  currentStepIndex = -1,
  buildSteps = [],
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stageRef = useRef(null);
  const [stageWidth, setStageWidth] = useState(800);
  // Andrea feedback 2026-05-25 PM-2: zoom controls. zoomFactor multiplies
  // the auto-fit width so the docente can ingrandire la pagina sulla LIM.
  const [zoomFactor, setZoomFactor] = useState(1.0);
  // Andrea feedback 2026-05-25 PM-2: PDF page crash sometimes — recover
  // by remounting the <Page> via key bump (similar pattern to react-pdf
  // recommended retry) when a Page-level error fires.
  const [pageKey, setPageKey] = useState(0);

  const filePath = VOLUME_PATHS[volumeNumber] || VOLUME_PATHS[1];
  const volumeLabel = VOLUME_LABELS[volumeNumber] || 'Volume';

  // Reload PDF only when volume actually changes (different file).
  useEffect(() => {
    setLoading(true);
    setError(null);
    setNumPages(null);
  }, [volumeNumber]);

  // Sync internal pageNumber to incoming prop (Passo Passo step → bookPage).
  useEffect(() => {
    setPageNumber(initialPage || 1);
  }, [initialPage]);

  // Signal NewElabSimulator that unified mode is active for the BuildModeGuide
  // suppression. Andrea bug fix 2026-05-25 PM-2: the previous version only
  // dispatched a window event — if the simulator listener mounted AFTER the
  // panel (race), the suppression flag was lost and the legacy ComponentDrawer
  // appeared alongside the unified panel. Solution: write a synchronous global
  // flag (window.__ELAB_UNIFIED_PASSO_ACTIVE) that NewElabSimulator can read
  // at any render — AND keep dispatching the event for late listeners.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.__ELAB_UNIFIED_PASSO_ACTIVE = Boolean(visible);
    dispatchWindowEvent('elab-unified-passo-active', { active: Boolean(visible) });
    return () => {
      window.__ELAB_UNIFIED_PASSO_ACTIVE = false;
      dispatchWindowEvent('elab-unified-passo-active', { active: false });
    };
  }, [visible]);

  // Auto-fit page width to the available stage. ResizeObserver tracks the
  // book column on window/orientation changes.
  useEffect(() => {
    if (!visible) return undefined;
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(320, Math.floor(entry.contentRect.width) - 24);
      setStageWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    logger.error('[PassoPassoUnifiedPanel] PDF load error:', err);
    setError('Impossibile caricare il volume. Verifica la connessione e riprova.');
    setLoading(false);
  }, []);

  const goToPage = useCallback((p) => {
    const safeTotal = numPages || 1;
    const next = Math.max(1, Math.min(p, safeTotal));
    setPageNumber(next);
    onPageChange?.(next, volumeNumber);
  }, [numPages, onPageChange, volumeNumber]);

  const documentOptions = useMemo(() => ({
    cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), []);

  // Andrea feedback 2026-05-25 PM-2: zoom handlers. Bounded 0.6× .. 2.4×.
  const zoomIn = useCallback(() => setZoomFactor((z) => Math.min(2.4, +(z + 0.2).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoomFactor((z) => Math.max(0.6, +(z - 0.2).toFixed(2))), []);
  const zoomReset = useCallback(() => setZoomFactor(1.0), []);

  // Andrea feedback 2026-05-25 PM-2: page render crash recovery. react-pdf
  // occasionally throws on heavy page transitions or worker stalls. We bump
  // a key on Page-level error → React remounts the <Page>, forcing a fresh
  // render request that usually succeeds. Logged for visibility.
  const onPageLoadError = useCallback((err) => {
    logger.warn('[PassoPassoUnifiedPanel] Page load error — remounting:', err?.message || err);
    setPageKey((k) => k + 1);
  }, []);

  const onPageRenderError = useCallback((err) => {
    logger.warn('[PassoPassoUnifiedPanel] Page render error — remounting:', err?.message || err);
    setPageKey((k) => k + 1);
  }, []);

  // Reset zoom when volume changes — otherwise an aggressive zoom carries
  // across to the next PDF and confuses the docente.
  useEffect(() => { setZoomFactor(1.0); }, [volumeNumber]);

  // Resolve current step data + bounds. ComponentDrawer convention:
  //   stepIndex === -1 → intro state (no step yet, btn label "Inizia")
  //   stepIndex in [0, total-1] → active step
  //   stepIndex === total-1 → last step (btn label "Finito")
  //   stepIndex >= total → complete state (cliffhanger card)
  const totalSteps = Array.isArray(buildSteps) ? buildSteps.length : 0;
  const isIntro = currentStepIndex < 0;
  const isComplete = totalSteps > 0 && currentStepIndex >= totalSteps;
  const currentStep = (!isIntro && !isComplete && currentStepIndex < totalSteps)
    ? buildSteps[currentStepIndex]
    : null;
  const isLast = totalSteps > 0 && currentStepIndex === totalSteps - 1;

  const stepNumberLabel = isIntro
    ? '00'
    : isComplete
      ? '✓'
      : String(currentStepIndex + 1).padStart(2, '0');

  // Andrea feedback 2026-05-25: cliffhanger CTA on complete. Resolve next
  // experiment via two sources: cliffhanger-table (Vol3 authoritative) →
  // narrative chain → lesson-path.next_experiment (fallback).
  const experimentId = experimentTitle && currentStepIndex !== undefined
    ? null /* resolved below via props if needed */
    : null;
  const cliffhangerData = useMemo(() => {
    // Pass the experiment id only when isComplete to avoid pointless lookups.
    if (!isComplete || !experimentTitle) return null;
    // experimentId is not in props (kept lightweight). LavagnaShell passes
    // experimentTitle but the chain resolver needs an id. We derive it from
    // the dispatched DOM event by trying both lesson-path and cliffhanger.
    // For v1 we read from the global API: __ELAB_API.unlim.getCircuitState().
    let expId = null;
    try {
      expId = window?.__ELAB_API?.unlim?.getCircuitState?.()?.experiment?.id || null;
    } catch { /* ignore */ }
    if (!expId) return null;

    const cliff = getCliffhangerFor(expId);
    let nextId = cliff?.valid ? cliff.next_id : getNextExperimentInChain(expId);

    // Fallback: lesson-path next_experiment object
    let nextTitle = null;
    let nextPreview = null;
    if (!nextId) {
      const lp = getLessonPath(expId);
      if (lp?.next_experiment?.id) {
        nextId = lp.next_experiment.id;
        nextTitle = lp.next_experiment.title;
        nextPreview = lp.next_experiment.preview;
      }
    } else {
      const lp = getLessonPath(expId);
      if (lp?.next_experiment?.id === nextId) {
        nextTitle = lp.next_experiment.title;
        nextPreview = lp.next_experiment.preview;
      }
    }

    // Look up next experiment's full data for richer card
    let nextExp = null;
    if (nextId) {
      try { nextExp = findExperimentById(nextId); } catch { /* ignore */ }
      if (nextExp && !nextTitle) nextTitle = nextExp.title;
    }

    return {
      cliffhanger: cliff?.cliffhanger || nextPreview || 'Continuiamo l’avventura con il prossimo esperimento.',
      nextId,
      nextTitle: nextTitle || (nextExp?.title) || null,
      nextExp,
    };
  }, [isComplete, experimentTitle]);

  const handleLoadNext = useCallback(() => {
    if (!cliffhangerData?.nextId) return;
    try {
      window?.__ELAB_API?.unlim?.mountExperiment?.(cliffhangerData.nextId);
    } catch (err) {
      logger.warn('[PassoPassoUnifiedPanel] mountExperiment next failed:', err?.message || err);
    }
  }, [cliffhangerData]);

  const stepKind = useMemo(() => {
    if (!currentStep) return '';
    const t = (currentStep.componentType || '').toLowerCase();
    if (t.includes('wire') || t.includes('filo')) return 'Filo';
    if (t.includes('battery')) return 'Batteria';
    if (t.includes('led')) return 'LED';
    if (t.includes('resistor')) return 'Resistore';
    if (t.includes('breadboard')) return 'Breadboard';
    if (t.includes('button') || t.includes('pulsante')) return 'Pulsante';
    if (t.includes('capacitor') || t.includes('condensatore')) return 'Condensatore';
    if (t.includes('nano') || t.includes('arduino')) return 'Arduino';
    if (t) return t.charAt(0).toUpperCase() + t.slice(1);
    return 'Passo';
  }, [currentStep]);

  const advanceStep = useCallback((delta) => {
    dispatchWindowEvent('elab-passo-advance', { delta });
  }, []);

  // Auto-size the floating window: ~85% viewport, capped.
  const winSize = useMemo(() => {
    if (typeof window === 'undefined') return { w: 1100, h: 700 };
    return {
      w: Math.min(1280, Math.max(880, Math.floor(window.innerWidth * 0.85))),
      h: Math.min(820, Math.max(560, Math.floor(window.innerHeight * 0.85))),
    };
  }, [visible]);

  if (!visible) return null;

  const headerTitle = experimentTitle
    ? `${volumeLabel} · Passo Passo · ${experimentTitle}`
    : `${volumeLabel} · Passo Passo`;

  return (
    <FloatingWindow
      id="passo-passo-unified"
      title={headerTitle}
      defaultPosition={{ x: 40, y: 40 }}
      defaultSize={winSize}
      onClose={onClose}
    >
      <div className={css.panel}>
        {/* Andrea /goal 25/05 PM-3: disclaimer top — esperimenti software
            verranno allineati tecnicamente/elettricamente ai disegni del manuale.
            Posizionato come sottile stripe, font 11px, color attenuato → non intrusivo. */}
        <div className={css.disclaimer} role="note" aria-label="Avviso allineamento esperimenti">
          <span className={css.disclaimerIcon} aria-hidden="true">ⓘ</span>
          <span>
            Gli esperimenti del software verranno allineati tecnicamente
            ed elettricamente ai disegni del manuale cartaceo.
          </span>
        </div>

        {/* Compact toolbar — volume tabs (no AppHeader-style chrome) */}
        <div className={css.toolbar}>
          <nav className={css.volTabs} aria-label="Cambia volume">
            {[1, 2, 3].map((v) => (
              <button
                key={v}
                type="button"
                className={`${css.volTab} ${v === volumeNumber ? css.volTabActive : ''}`}
                onClick={() => onVolumeChange?.(v)}
                aria-pressed={v === volumeNumber}
                aria-label={`Volume ${v}`}
              >
                Vol {v}
              </button>
            ))}
          </nav>
        </div>

        <div className={css.body}>
          {/* Left 60% — book page (PDF intera) */}
          <section className={css.bookSide} aria-label="Pagina del manuale">
            <div ref={stageRef} className={css.bookStage}>
              {loading && (
                <div className={css.bookLoading}>
                  <div className={css.spinner} />
                  <span>Apriamo il volume…</span>
                </div>
              )}
              {error && (
                <div className={css.bookError}>
                  <span>{error}</span>
                  <button
                    type="button"
                    className={css.retryBtn}
                    onClick={() => { setError(null); setLoading(true); }}
                  >
                    Riprova
                  </button>
                </div>
              )}
              <Document
                file={filePath}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={documentOptions}
                loading=""
              >
                <Page
                  key={`page-${pageNumber}-${pageKey}`}
                  pageNumber={pageNumber}
                  width={Math.round(stageWidth * zoomFactor)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className={css.bookPage}
                  loading=""
                  onLoadError={onPageLoadError}
                  onRenderError={onPageRenderError}
                />
              </Document>
            </div>

            <footer className={css.bookFoot}>
              <button
                type="button"
                className={css.pageBtn}
                onClick={() => goToPage(pageNumber - 1)}
                disabled={pageNumber <= 1}
                aria-label="Pagina precedente"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className={css.pageInfo}>
                <span className={css.pageNum}>{pageNumber}</span>
                <span className={css.pageSep}>di</span>
                <span className={css.pageTot}>{numPages || '—'}</span>
              </span>
              <button
                type="button"
                className={css.pageBtn}
                onClick={() => goToPage(pageNumber + 1)}
                disabled={pageNumber >= (numPages || 1)}
                aria-label="Pagina successiva"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Andrea feedback 2026-05-25 PM-2: zoom controls (LIM ingrandimento) */}
              <span className={css.footSep} aria-hidden="true" />
              <button
                type="button"
                className={css.pageBtn}
                onClick={zoomOut}
                disabled={zoomFactor <= 0.6}
                aria-label="Riduci zoom"
                title="Riduci zoom"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4.5 7h5M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className={css.zoomLabel}
                onClick={zoomReset}
                aria-label={`Zoom ${Math.round(zoomFactor * 100)}% — clicca per ripristinare`}
                title="Clicca per ripristinare 100%"
              >
                {Math.round(zoomFactor * 100)}%
              </button>
              <button
                type="button"
                className={css.pageBtn}
                onClick={zoomIn}
                disabled={zoomFactor >= 2.4}
                aria-label="Aumenta zoom"
                title="Aumenta zoom"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4.5 7h5M7 4.5v5M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </footer>
          </section>

          {/* Right 40% — Passo Passo step */}
          <aside className={css.stepSide} aria-label="Istruzione del passo">
            <div className={css.stepCounter}>
              <span className={css.stepCounterLabel}>Passo</span>
              <span className={css.stepCounterTotal}>
                {isComplete
                  ? 'Completato'
                  : isIntro && totalSteps > 0
                    ? `Pronti? · ${totalSteps} passi`
                    : totalSteps > 0
                      ? `${currentStepIndex + 1} di ${totalSteps}`
                      : '—'}
              </span>
            </div>

            <div className={css.stepNumberWrap} aria-hidden="true">
              <span className={css.stepNumber}>{stepNumberLabel}</span>
              {currentStep && <span className={css.stepKindBadge}>{stepKind}</span>}
            </div>

            {isComplete ? (
              <div className={css.cliffhangerCard}>
                <p className={css.cliffhangerDone}>
                  Esperimento completato!
                </p>
                {cliffhangerData?.cliffhanger && (
                  <p className={css.cliffhangerText}>
                    {cliffhangerData.cliffhanger}
                  </p>
                )}
                {cliffhangerData?.nextId && cliffhangerData?.nextTitle && (
                  <button
                    type="button"
                    className={css.cliffhangerBtn}
                    onClick={handleLoadNext}
                    aria-label={`Apri prossimo esperimento: ${cliffhangerData.nextTitle}`}
                  >
                    <span className={css.cliffhangerBtnLabel}>Prossimo</span>
                    <span className={css.cliffhangerBtnTitle}>{cliffhangerData.nextTitle}</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            ) : currentStep ? (
              <div className={css.stepContent}>
                {/* Andrea /goal 25/05 PM-3: trasforma testo step in linguaggio
                    kid-friendly plurale "Ragazzi…" mantenendo pin/fori esatti. */}
                <p className={css.stepText}>{makeStepKidFriendly(currentStep.text)}</p>
                {currentStep.hint && (
                  <p className={css.stepHint}>
                    <span className={css.stepHintIcon} aria-hidden="true">›</span>
                    {currentStep.hint}
                  </p>
                )}
              </div>
            ) : isIntro && totalSteps > 0 ? (
              <div className={css.stepContent}>
                {/* Andrea /goal 25/05 PM-3: linguaggio rivolto ai ragazzi, plurale
                    "Ragazzi" (Principio Zero), niente termini tecnici, chiaro
                    cosa fare. Riferimento al kit fisico (sempre protagonista). */}
                <p className={css.stepText}>
                  Ragazzi, oggi montiamo insieme <strong>{experimentTitle || "il nostro esperimento"}</strong>.
                  Sul vostro banco avete il kit: prendete <strong>i pezzi uno alla volta</strong>,
                  seguendo le foto del libro. Quando siete pronti, premete <strong>Inizia</strong>.
                </p>
              </div>
            ) : (
              <div className={css.stepEmpty}>
                <p>
                  Ragazzi, scegliete prima un esperimento dal libro, poi torniamo qui per il <strong>Passo Passo</strong>.
                </p>
              </div>
            )}

            {!isComplete && (
              <div className={css.stepControls}>
                <button
                  type="button"
                  className={css.btnGhost}
                  onClick={() => advanceStep(-1)}
                  disabled={isIntro || totalSteps === 0}
                  aria-label="Passo precedente"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Indietro</span>
                </button>
                <button
                  type="button"
                  className={css.btnPrimary}
                  onClick={() => advanceStep(+1)}
                  disabled={totalSteps === 0}
                  aria-label={isIntro ? 'Inizia esperimento' : isLast ? 'Termina esperimento' : 'Passo successivo'}
                >
                  <span>{isIntro ? 'Inizia' : isLast ? 'Finito' : 'Avanti'}</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </FloatingWindow>
  );
}
