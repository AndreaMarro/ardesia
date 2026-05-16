/**
 * AlbumStudente — initial scaffold (Tea iter 70 D).
 *
 * Sprint U iter 70 Team D — UI overhaul + Tea materials integration.
 *
 * Tea specs:
 *   - `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/album_studente_mockup.html` 37KB
 *   - `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/album_studente_spec.html` 28KB
 *   - `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/album_studente_spec.pdf` 53KB
 *
 * Scope iter 70 D (scaffold ONLY): render the canonical empty-state, list of
 * sessions converted into fumetto cards, and CTA to open each fumetto. Full
 * integration with `unlimMemory` + Supabase `student_sessions` table is deferred
 * iter 71+.
 *
 * Props:
 *   - sessions: optional Array<{id, experimentId, completedAt, fumetto: {...}}>
 *               If omitted/null, renders empty state.
 *   - onOpenFumetto: optional handler (session) => void
 *   - studentName: optional display name (max 40 chars, never surname — GDPR)
 *
 * Honesty caveats:
 *   - SCAFFOLD ONLY — empty state + list shell. Full mockup HTML (37KB) NOT yet
 *     ported to React; defer iter 71+.
 *   - NO Supabase wire-up (read-only props for now)
 *   - NO PDF export (would require pdf-lib/jspdf integration)
 *   - NOT visually verified browser (defer Andrea ratify iter 71+)
 *
 * Andrea Marro — 2026-05-16 PM iter 70 Team D
 */
import React from 'react';
import UnlimMascotte from '../common/UnlimMascotte';
import styles from './AlbumStudente.module.css';

const VALID_TAGS = ['problema', 'ipotesi', 'errore', 'click', 'successo', 'ponte'];

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function FumettoCard({ session, onOpenFumetto }) {
  const fumetto = session.fumetto || {};
  const panels = Array.isArray(fumetto.panels) ? fumetto.panels : [];
  const cover = panels.find((p) => VALID_TAGS.includes(p.role)) || panels[0];
  const handleClick = () => {
    if (typeof onOpenFumetto === 'function') onOpenFumetto(session);
  };
  return (
    <article
      className={styles.card}
      data-testid={`album-card-${session.id}`}
      data-experiment-id={session.experimentId}
    >
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          {fumetto.experimentTitle || session.experimentId || 'Esperimento senza titolo'}
        </h3>
        <span className={styles.cardDate}>{formatDate(session.completedAt)}</span>
      </header>
      {cover ? (
        <p className={styles.cardCaption} data-testid="album-card-caption">
          {cover.caption || cover.title || 'Vignetta di apertura'}
        </p>
      ) : (
        <p className={styles.cardCaptionEmpty}>
          Fumetto non ancora generato dall'UNLIM.
        </p>
      )}
      <footer className={styles.cardFooter}>
        <span className={styles.panelCount}>
          {panels.length} {panels.length === 1 ? 'vignetta' : 'vignette'}
        </span>
        <button
          type="button"
          className={styles.cardCta}
          onClick={handleClick}
          data-testid="album-card-open"
        >
          Apri fumetto
        </button>
      </footer>
    </article>
  );
}

function AlbumStudente({ sessions, onOpenFumetto, studentName }) {
  const safeName = (studentName || '').slice(0, 40);
  const hasSessions = Array.isArray(sessions) && sessions.length > 0;

  return (
    <section className={styles.album} data-testid="album-studente">
      <header className={styles.header}>
        <UnlimMascotte size="small" state="aspetta" position="inline" />
        <div>
          <h2 className={styles.title}>
            {safeName ? `Album di ${safeName}` : 'Album dei Ragazzi'}
          </h2>
          <p className={styles.subtitle}>
            Tutti i fumetti generati dagli esperimenti, in ordine cronologico.
          </p>
        </div>
      </header>

      {!hasSessions ? (
        <div className={styles.empty} data-testid="album-empty">
          <p className={styles.emptyTitle}>
            Ragazzi, non c'è ancora nessun fumetto in album.
          </p>
          <p className={styles.emptyHint}>
            Aprite il kit ELAB e completate un esperimento — l'UNLIM genererà
            automaticamente il fumetto che troverete qui.
          </p>
        </div>
      ) : (
        <div className={styles.grid} data-testid="album-grid">
          {sessions.map((s) => (
            <FumettoCard
              key={s.id}
              session={s}
              onOpenFumetto={onOpenFumetto}
            />
          ))}
        </div>
      )}

      <footer className={styles.footer}>
        <small>
          Album studente — scaffold iter 70 D · integrazione completa iter 71+
        </small>
      </footer>
    </section>
  );
}

export default AlbumStudente;
