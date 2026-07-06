/**
 * SessionReportComic — Fumetto report end-of-class
 * Sprint S iter 13 atom F2 (fumetto-opus)
 *
 * Renders 6-vignette comic-style recap of session experiments.
 * Morfismo Sense 2: each vignette cites Vol.X pag.Y verbatim from packs/elab-tutor/data/volume-references.js.
 * Principio Zero V3: plurale "Ragazzi," in header + footer.
 * NO emoji icons (ElabIcons.jsx). Brand palette Navy/Lime/Orange/Red.
 *
 * (c) Andrea Marro — 2026-04-28
 */
import React, { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildSessionReportComicModel } from '../../services/fumettoService';
import { ReportIcon, PrintIcon, BookIcon } from '../common/ElabIcons';
import { multimodalRouter } from '../../services/multimodalRouter';
import UnlimMascotte from '../common/UnlimMascotte';
import SessionReportComicCliffhanger from './SessionReportComicCliffhanger';
import styles from './SessionReportComic.module.css';

const FUMETTO_NEXT_EXPERIMENT_CTA_ENABLED = false;

function formatSessionDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('it-IT');
  } catch {
    return '';
  }
}

function UnlimMascot() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.mascot}
      data-testid="session-report-comic-mascot"
      aria-label={t('session_comic.mascot_aria')}
    >
      <UnlimMascotte
        size="small"
        state="aspetta"
        className={styles.mascotSvg}
        ariaLabel="UNLIM mascotte canonica Tea, con puntatore luminoso sul kit fisico"
      />
      <span className={styles.mascotLabel}>UNLIM guida il ponte, il kit fisico resta protagonista.</span>
    </div>
  );
}

function PhotoPlaceholder({ title }) {
  return (
    <div className={styles.photoPlaceholder} aria-hidden="true">
      <BookIcon size={28} className={styles.placeholderIcon} />
      <span className={styles.placeholderText}>
        {title || 'Esperimento'}
      </span>
    </div>
  );
}

export default function SessionReportComic({ session, onExport, onMountNextExperiment }) {
  const { t } = useTranslation();
  const reportModel = useMemo(() => buildSessionReportComicModel(session), [session]);
  const {
    vignettes,
    exercisePrompts,
    notesPrompt,
    multipleChoiceQuestions,
    diaryPage,
    sessionFingerprint,
    nextExperiment,
  } = reportModel;
  const sessionDate = formatSessionDate(session?.startedAt);
  const studentAlias = session?.studentAlias ?? '';
  const [failedAssets, setFailedAssets] = useState(() => new Set());
  const [loadedAssets, setLoadedAssets] = useState(() => new Set());
  const [generatedImages, setGeneratedImages] = useState(() => ({}));
  const [imageGenStatus, setImageGenStatus] = useState('idle');
  const [imageGenMessage, setImageGenMessage] = useState('');
  const geminiStatus = session?.fumettoGeminiStatus;
  const geminiDraftReceived = geminiStatus === 'ready' || geminiStatus === 'received';
  const geminiDraftRejected = geminiDraftReceived && session?.geminiDraft && !reportModel.geminiDraftApplied;

  const handleExport = useCallback(() => {
    if (typeof onExport === 'function') {
      onExport();
    } else if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }, [onExport]);

  const handleMountNextExperiment = useCallback((experimentId) => {
    if (typeof onMountNextExperiment === 'function') {
      onMountNextExperiment(experimentId);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      typeof window.__ELAB_API?.unlim?.mountExperiment === 'function'
    ) {
      window.__ELAB_API.unlim.mountExperiment(experimentId);
    } else if (
      typeof window !== 'undefined' &&
      typeof window.__ELAB_API?.mountExperiment === 'function'
    ) {
      window.__ELAB_API.mountExperiment(experimentId);
    }
    if (typeof window !== 'undefined' && experimentId) {
      const nextHash = `#lavagna?exp=${encodeURIComponent(experimentId)}`;
      if (!window.location.hash.includes(`exp=${encodeURIComponent(experimentId)}`)) {
        window.location.hash = nextHash;
      }
    }
  }, [onMountNextExperiment]);

  const handleGenerateImages = useCallback(async () => {
    const briefs = reportModel.imageGenerationBriefs || [];
    setImageGenStatus('loading');
    setImageGenMessage('Generazione immagini ELAB in corso...');

    try {
      const nextImages = {};
      let generatedCount = 0;

      for (let index = 0; index < briefs.length; index += 1) {
        const brief = briefs[index];
        if (!brief?.prompt) continue;

        const result = await multimodalRouter.routeImageGen(
          {
            prompt: brief.prompt,
            width: 1024,
            height: 768,
            numSteps: 4,
          },
          { sessionId: `${sessionFingerprint}-panel-${index + 1}` }
        );

        const image = result?.data?.image || result?.data?.imageBase64;
        if (result?.ok && image) {
          nextImages[index] = image.startsWith('data:image/')
            ? image
            : `data:image/png;base64,${image}`;
          generatedCount += 1;
        }
      }

      setGeneratedImages(nextImages);
      if (generatedCount > 0) {
        setImageGenStatus('ready');
        setImageGenMessage(`Immagini generate: ${generatedCount}/6, basate sulla sessione e sulla mascotte Tea.`);
      } else {
        setImageGenStatus('deferred');
        setImageGenMessage('Generazione immagini non disponibile ora: il fumetto usa asset verificati e prompt Tea pronti.');
      }
    } catch (_err) {
      setImageGenStatus('deferred');
      setImageGenMessage('Generazione immagini non disponibile ora: il fumetto usa asset verificati e prompt Tea pronti.');
    }
  }, [reportModel.imageGenerationBriefs, sessionFingerprint]);

  return (
    <article
      className={styles.container}
      role="article"
      aria-label={t('session_comic.report_aria')}
    >
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <ReportIcon size={32} className={styles.titleIcon} aria-hidden="true" />
          <div className={styles.meta}>
            <h2 className={styles.title}>{t('session_comic.title')}</h2>
            <p className={styles.subtitle}>
              {studentAlias && (
                <span className={styles.alias}>{t('session_comic.class_prefix', { name: studentAlias })}</span>
              )}
              {sessionDate && (
                <span className={styles.date}>
                  {studentAlias ? ' — ' : ''}
                  {sessionDate}
                </span>
              )}
            </p>
          </div>
        </div>
        <UnlimMascot />
        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExport}
          aria-label={t('session_comic.export_pdf_aria')}
        >
          <PrintIcon size={20} aria-hidden="true" />
          <span>{t('session_comic.export_pdf')}</span>
        </button>
        <button
          type="button"
          className={styles.generateImagesBtn}
          onClick={handleGenerateImages}
          disabled={imageGenStatus === 'loading'}
          aria-label={t('session_comic.generate_images_aria')}
        >
          <BookIcon size={20} aria-hidden="true" />
          <span>{imageGenStatus === 'loading' ? t('session_comic.generating_images') : t('session_comic.generate_images')}</span>
        </button>
      </header>

      {imageGenMessage && (
        <p
          className={styles.imageGenStatus}
          data-testid="session-report-comic-imagegen-status"
          role="status"
        >
          {imageGenMessage}
        </p>
      )}

      {geminiStatus && (
        <p
          className={styles.imageGenStatus}
          data-testid="session-report-comic-gemini-status"
          role="status"
        >
          {geminiDraftRejected
            ? t('session_comic.gemini_rejected')
            : geminiDraftReceived && reportModel.geminiDraftApplied
              ? t('session_comic.gemini_ready')
              : geminiStatus === 'loading'
              ? t('session_comic.gemini_loading')
              : t('session_comic.gemini_unavailable')}
        </p>
      )}

      <div className={styles.grid}>
        {vignettes.map((slot, idx) => {
          const exp = slot.exp;
          const volRef = slot.volRef;
          const narration = slot.narration;
          const generatedImage = generatedImages[idx];
          const hasGeneratedImage = typeof generatedImage === 'string' && generatedImage.startsWith('data:image/');
          const hasWorkingAsset = !hasGeneratedImage && slot.assetUrl && !failedAssets.has(slot.assetUrl);
          const isAssetLoaded = hasWorkingAsset && loadedAssets.has(slot.assetUrl);
          const narrationId = exp ? `narration-${exp.id}-${idx}` : `placeholder-${idx}`;
          const vignetteAriaLabel = exp
            ? `Vignetta ${idx + 1} — ${slot.roleLabel} — ${exp.title || exp.id}${
                volRef ? ` — Volume ${volRef.volume} pagina ${volRef.bookPage}` : ''
              }`
            : `Vignetta ${idx + 1} — ancora da svolgere`;
          return (
            <figure
              key={exp ? `${exp.id}-${slot.role}-${idx}` : `slot-${idx}`}
              className={styles.vignette}
              aria-label={vignetteAriaLabel}
              aria-describedby={narration ? narrationId : undefined}
            >
              {exp ? (
                <>
                  {hasGeneratedImage ? (
                    <div className={styles.photoSlot}>
                      <img
                        src={generatedImage}
                        alt={`Immagine generata per ${exp.title || exp.id}`}
                        className={`${styles.photo} ${styles.photoLoaded}`}
                      />
                    </div>
                  ) : hasWorkingAsset ? (
                    <div className={styles.photoSlot}>
                      {!isAssetLoaded && (
                        <PhotoPlaceholder title={exp.title || exp.id} />
                      )}
                      <img
                        src={slot.assetUrl}
                        alt={`Foto esperimento: ${exp.title || exp.id}`}
                        className={`${styles.photo} ${isAssetLoaded ? styles.photoLoaded : styles.photoPending}`}
                        loading="lazy"
                        onLoad={() => {
                          setLoadedAssets((current) => {
                            const next = new Set(current);
                            next.add(slot.assetUrl);
                            return next;
                          });
                        }}
                        onError={() => {
                          setFailedAssets((current) => {
                            const next = new Set(current);
                            next.add(slot.assetUrl);
                            return next;
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <PhotoPlaceholder title={exp.title || 'Esperimento'} />
                  )}
                  <figcaption className={styles.caption}>
                    <span className={styles.arcRole}>{slot.roleLabel}</span>
                    <strong className={styles.captionTitle}>
                      {exp.title || exp.id}
                    </strong>
                    {volRef && (
                      <cite className={styles.volumeRef}>
                        Vol.{volRef.volume} pag.{volRef.bookPage}
                      </cite>
                    )}
                    {narration && (
                      <p
                        id={narrationId}
                        className={styles.narration}
                      >
                        {narration}
                      </p>
                    )}
                    {slot.sessionEvidence && (
                      <p className={styles.sessionEvidence}>
                        {slot.sessionEvidence}
                      </p>
                    )}
                  </figcaption>
                </>
              ) : (
                <div className={styles.placeholder} aria-hidden="true">
                  <span>{t('session_comic.no_context')}</span>
                </div>
              )}
            </figure>
          );
        })}
      </div>

      <section
        className={styles.workshop}
        data-testid="session-report-comic-exercises"
        aria-label={t('session_comic.exercises_aria')}
      >
        <h3 className={styles.sectionTitle}>{t('session_comic.exercises_title')}</h3>
        <ol className={styles.exerciseList}>
          {exercisePrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ol>
      </section>

      <section
        className={styles.quiz}
        data-testid="session-report-comic-quiz"
        aria-label={t('session_comic.quiz_aria')}
      >
        <h3 className={styles.sectionTitle}>{t('session_comic.quiz_title')}</h3>
        <ol className={styles.quizList}>
          {multipleChoiceQuestions.map((item) => (
            <li key={item.question} className={styles.quizItem}>
              <p className={styles.quizQuestion}>{item.question}</p>
              <ol className={styles.choiceList} type="A">
                {item.options.map((option) => (
                  <li key={option} className={styles.choiceItem}>
                    <span className={styles.choiceBox} aria-hidden="true" />
                    <span>{option}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={styles.notes}
        data-testid="session-report-comic-notes"
        aria-label={t('session_comic.notes_aria')}
      >
        <h3 className={styles.sectionTitle}>{t('session_comic.notes_title')}</h3>
        <p className={styles.notesPrompt}>{notesPrompt}</p>
        <div className={styles.noteLines} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section
        className={styles.diary}
        data-testid="session-report-comic-diary"
        aria-label={t('session_comic.diary_aria')}
      >
        <h3 className={styles.sectionTitle}>{diaryPage.title}</h3>
        <ol className={styles.diaryPrompts}>
          {diaryPage.prompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ol>
        <div className={styles.diaryLines} aria-hidden="true">
          {Array.from({ length: diaryPage.lineCount }).map((_, index) => (
            <span key={`diary-line-${index + 1}`} />
          ))}
        </div>
      </section>

      {FUMETTO_NEXT_EXPERIMENT_CTA_ENABLED && session?.savedAt && nextExperiment && (
        <SessionReportComicCliffhanger
          nextExperiment={nextExperiment}
          onMountNext={handleMountNextExperiment}
        />
      )}

      <footer className={styles.footer}>
        <p className={styles.fingerprint}>{t('session_comic.fingerprint', { fingerprint: sessionFingerprint })}</p>
        <p className={styles.footerText}>{t('session_comic.footer')}</p>
      </footer>
    </article>
  );
}
