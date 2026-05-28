/**
 * HomeCompileLayoutV2 — Swarm 2 (UI/UX redesign) greenfield layout.
 *
 * Andrea verbatim (2026-05-29 5-swarm refactor):
 *   "rendi ui e ux homecompile bellissima moltissimo simile al sito edukit,
 *    priva di bug e con unlim integrato con chat e interfacciamento totale"
 *
 * Reference: edukits.co/code (Code Kit drag-and-drop Arduino app).
 * See docs/audits/2026-05-29-edukit-reference-audit.md for the full
 * extraction of palette, typography, button vocabulary, focus-ring,
 * radius scale and the Morfismo-safe adaptation rules.
 *
 * Architecture contract (mandated by orchestrator):
 *   - Pure render layer. NO useState, NO effects, NO API calls.
 *   - All state owned by HomeCompileEntry.jsx (Swarm 1 owner).
 *   - This component receives props and slot children, renders a grid.
 *
 * Morfismo (Sense 1 + Sense 2):
 *   - Palette tokens map onto ELAB design-system.css (Navy/Lime/Orange/Red).
 *     ZERO edukits purple #9A35FF anywhere.
 *   - Typography: Oswald display + Open Sans body + Fira Code mono.
 *   - Touch target floor 44x44px (.impeccable.md §9).
 *   - WCAG AA contrast verified; focus ring 3px tinted.
 *   - Light mode only (LIM-First .impeccable.md §4).
 *
 * Principio Zero:
 *   - All teacher-facing copy uses plural voice ("Ragazzi," / "Class,").
 *   - Bilingual via useTranslation() + t().
 *
 * © 2026-05-29 — Swarm 2 / ELAB Tutor / Andrea Marro
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './HomeCompileLayoutV2.module.css';

const STATUS_TO_TONE = {
  idle: 'neutral',
  compiling: 'progress',
  success: 'success',
  'verified-legacy': 'warning',
  error: 'danger',
};

const QUICK_QUESTIONS_KEYS = [
  'home_compile_v2.quick.read',
  'home_compile_v2.quick.fix',
  'home_compile_v2.quick.next',
];

const HomeCompileLayoutV2 = React.memo(function HomeCompileLayoutV2({
  boardLabel = 'Arduino Nano R4',
  compileStatus = 'idle',
  compileSize = null,
  sketchCode = '',
  onCompile,
  onUpload,
  onAskUnlim,
  onBackHome,
  canCompile = true,
  canUpload = false,
  editorSlot = null,
  bannerSlot = null,
  boardPickerSlot = null,
  unlimChatSlot = null,
  serialMonitorSlot = null,
  testId = 'home-compile-layout-v2',
}) {
  const { t } = useTranslation();
  const tone = STATUS_TO_TONE[compileStatus] || 'neutral';

  const statusCopy = useMemo(() => {
    switch (compileStatus) {
      case 'compiling':       return t('home_compile_v2.status.compiling', { board: boardLabel });
      case 'success':         return t('home_compile_v2.status.success', { board: boardLabel });
      case 'verified-legacy': return t('home_compile_v2.status.verified_legacy', { board: boardLabel });
      case 'error':           return t('home_compile_v2.status.error');
      default:                return t('home_compile_v2.status.idle', { board: boardLabel });
    }
  }, [compileStatus, boardLabel, t]);

  const sizeRow = useMemo(() => {
    if (!compileSize || typeof compileSize.flashPercent !== 'number') return null;
    const pct = Math.min(100, Math.max(0, Math.round(compileSize.flashPercent)));
    return { pct, used: compileSize.flashUsed, total: compileSize.flashTotal };
  }, [compileSize]);

  const sketchPreview = useMemo(() => {
    const lines = String(sketchCode || '').split('\n');
    const head = lines.slice(0, 12).join('\n');
    return head || t('home_compile_v2.sketch.empty');
  }, [sketchCode, t]);

  const handleCompile = (e) => {
    e?.preventDefault?.();
    if (!canCompile || typeof onCompile !== 'function') return;
    onCompile();
  };

  const handleUpload = (e) => {
    e?.preventDefault?.();
    if (!canUpload || typeof onUpload !== 'function') return;
    onUpload();
  };

  const handleQuick = (key) => {
    if (typeof onAskUnlim !== 'function') return;
    onAskUnlim(t(key));
  };

  return (
    <div
      className={styles.layout}
      data-testid={testId}
      data-tone={tone}
      data-elab-layout="hcv2-edukit"
    >
      <header className={styles.topbar} role="banner">
        <button
          type="button"
          className={styles.backBtn}
          onClick={typeof onBackHome === 'function' ? onBackHome : undefined}
          aria-label={t('home_compile_v2.back_home')}
        >
          <BackArrowIcon />
          <span className={styles.backBtnLabel}>{t('home_compile_v2.back_short')}</span>
        </button>

        <div className={styles.brandBlock}>
          <span className={styles.brandKicker}>ELAB</span>
          <h1 className={styles.brandTitle}>{t('home_compile_v2.title')}</h1>
        </div>

        <div
          className={styles.boardPill}
          aria-label={t('home_compile_v2.board_label')}
          title={boardLabel}
        >
          <BoardChipIcon />
          <span>{boardLabel}</span>
        </div>
      </header>

      {bannerSlot ? (
        <section className={styles.bannerStrip} aria-label={t('home_compile_v2.banner_label')}>
          {bannerSlot}
        </section>
      ) : null}

      <main className={styles.grid} data-grid-mode="editor-plus-aside">
        <section
          className={styles.editorCard}
          aria-label={t('home_compile_v2.editor_label')}
          data-onboard-target="editor"
        >
          {editorSlot ? editorSlot : (
            <div className={styles.editorPlaceholder} role="status">
              {t('home_compile_v2.editor.placeholder')}
            </div>
          )}
        </section>

        <aside
          className={styles.aside}
          aria-label={t('home_compile_v2.aside_label')}
          data-onboard-target="compile-bar"
        >
          <div className={styles.pillCluster} role="group" aria-label={t('home_compile_v2.actions_label')}>
            <button
              type="button"
              className={`${styles.pill} ${styles.pillPrimary}`}
              onClick={handleCompile}
              disabled={!canCompile || compileStatus === 'compiling'}
              data-status={compileStatus}
              aria-busy={compileStatus === 'compiling'}
            >
              <CompileIcon spinning={compileStatus === 'compiling'} />
              <span className={styles.pillLabel}>
                {compileStatus === 'compiling' ? t('home_compile_v2.btn.compiling') : t('home_compile_v2.btn.compile')}
              </span>
            </button>
            <button
              type="button"
              className={`${styles.pill} ${styles.pillAccent}`}
              onClick={handleUpload}
              disabled={!canUpload}
              title={!canUpload ? t('home_compile_v2.btn.upload_disabled_hint') : undefined}
            >
              <UploadIcon />
              <span className={styles.pillLabel}>{t('home_compile_v2.btn.upload')}</span>
            </button>
          </div>

          <div className={styles.statusCard} data-tone={tone} role="status" aria-live="polite">
            <StatusDot tone={tone} />
            <span className={styles.statusText}>{statusCopy}</span>
          </div>

          {sizeRow ? (
            <div className={styles.sizeStrip} role="group" aria-label={t('home_compile_v2.size_label')}>
              <div className={styles.sizeRow}>
                <span className={styles.sizeKey}>{t('home_compile_v2.size.flash')}</span>
                <span className={styles.sizeVal}>
                  {sizeRow.used}{' / '}{sizeRow.total}{' '}
                  <span className={styles.sizePct} aria-label={t('home_compile_v2.size.percent_aria', { pct: sizeRow.pct })}>
                    ({sizeRow.pct}%)
                  </span>
                </span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} data-tone={tone} style={{ width: `${sizeRow.pct}%` }} />
              </div>
            </div>
          ) : null}

          {boardPickerSlot ? (
            <div className={styles.boardPickerSlot} aria-label={t('home_compile_v2.board_pick_label')}>
              {boardPickerSlot}
            </div>
          ) : null}

          <details className={styles.sketchPreview}>
            <summary className={styles.sketchSummary}>
              <CodePreviewIcon />
              <span>{t('home_compile_v2.sketch.title')}</span>
            </summary>
            <pre className={styles.sketchBody}>{sketchPreview}</pre>
          </details>

          <div className={styles.unlimSlot} data-onboard-target="unlim-chat">
            {unlimChatSlot ? unlimChatSlot : (
              <div className={styles.unlimFallback}>
                <p className={styles.unlimFallbackHint}>{t('home_compile_v2.unlim.fallback_hint')}</p>
                <div className={styles.quickQuestions} role="group" aria-label={t('home_compile_v2.quick.label')}>
                  {QUICK_QUESTIONS_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={styles.quickChip}
                      onClick={() => handleQuick(key)}
                      disabled={typeof onAskUnlim !== 'function'}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {serialMonitorSlot ? (
        <section className={styles.serialStrip} aria-label={t('home_compile_v2.serial_label')}>
          {serialMonitorSlot}
        </section>
      ) : null}
    </div>
  );
});

export default HomeCompileLayoutV2;

function BackArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function BoardChipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h2" />
      <path d="M7 14h2" />
      <path d="M15 10h2" />
      <path d="M15 14h2" />
    </svg>
  );
}

function CompileIcon({ spinning = false }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      style={spinning ? { animation: 'hcv2-spin 0.9s linear infinite' } : undefined}
    >
      {spinning ? <path d="M21 12a9 9 0 1 1-6.219-8.56" /> : <polygon points="6 4 20 12 6 20 6 4" />}
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CodePreviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function StatusDot({ tone = 'neutral' }) {
  return (
    <span className={styles.statusDot} data-tone={tone} aria-hidden="true">
      <span className={styles.statusDotInner} />
    </span>
  );
}
