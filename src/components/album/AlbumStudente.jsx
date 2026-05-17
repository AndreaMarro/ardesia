/**
 * AlbumStudente — Supabase wire-up (iter 72 TEAM D).
 *
 * Sprint U iter 72 Team D — TEAM D Codex MED finding (Codex audit iter 70):
 * "Album SCAFFOLD only — no Supabase integration". This iter wires a
 * defensive optional fetch on mount when `sessions` prop NOT supplied.
 *
 * Backward-compat preserved: when callers pass `sessions` prop explicitly
 * (e.g. existing tests + callers that already hydrate from another store),
 * we render that. Only when `sessions` is undefined AND a `studentId` prop
 * is provided do we attempt Supabase fetch via `studentService`-style
 * pattern (`isSupabaseConfigured()` gate + `supabase.from().select()`).
 *
 * Tea specs (iter 70 carryover):
 *   - `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/album_studente_mockup.html` 37KB
 *   - `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/album_studente_spec.html` 28KB
 *
 * Schema reference (DEFERRED migration not applied prod — TODO iter 73):
 *   `supabase/migrations/_DEFER_20260509010000_student_album_narrative_comics.sql.bak`
 *   table `student_album` columns: id, student_id, experiment_id,
 *   narrative_map_id, volume, chapter, chapter_title, story_arc,
 *   timeline_position, status, comic_asset_url, comic_metadata (JSONB
 *   with `panels` array for fumetto rendering), session_screenshot_url,
 *   created_at.
 *
 * Honesty caveats:
 *   - student_album schema EXISTS as .bak DEFERRED migration; NOT applied
 *     production. Iter 73 task: rename migration + push to prod + verify.
 *     Until then, fetch will fail gracefully (no rows / error catch →
 *     empty state with PRINCIPIO ZERO plurale message).
 *   - Mapping comic_metadata JSONB → in-component `fumetto.panels` shape
 *     assumes Tea fumetto contract; iter 73 verify with real ingest.
 *   - NO PDF export (would require pdf-lib/jspdf integration)
 *   - NO realtime subscription (Supabase channels) — defer iter 73+
 *   - GDPR: queries scoped by studentId. No surnames in studentName prop
 *     (truncated 40 chars defensive).
 *
 * Andrea Marro — 2026-05-17 iter 72 Team D
 */
import React, { useState, useEffect } from 'react';
import UnlimMascotte from '../common/UnlimMascotte';
import supabase, { isSupabaseConfigured } from '../../services/supabaseClient';
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

/**
 * Map a Supabase `student_album` row into the in-component session shape
 * expected by FumettoCard (kept stable from iter 70 scaffold props
 * contract for backward-compat with tests + callers).
 */
function mapAlbumRowToSession(row) {
  if (!row) return null;
  const metadata = row.comic_metadata || {};
  return {
    id: row.id,
    experimentId: row.experiment_id,
    completedAt: row.created_at,
    fumetto: {
      experimentTitle:
        metadata.experimentTitle ||
        row.chapter_title ||
        row.experiment_id,
      panels: Array.isArray(metadata.panels) ? metadata.panels : [],
      coverUrl: row.comic_asset_url || null,
    },
  };
}

/**
 * Defensive Supabase fetch for the student's album entries.
 * Returns `{ data: Session[] | null, error: string | null }`.
 * Never throws — caller may render empty state on null data.
 */
async function fetchAlbumFromSupabase(studentId) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: 'supabase_not_configured' };
  }
  if (!studentId) {
    return { data: null, error: 'no_student_id' };
  }
  try {
    // TODO iter 73 schema migration: rename
    // `_DEFER_20260509010000_student_album_narrative_comics.sql.bak`
    // → active migration + `supabase db push --linked` + verify table.
    // Until then, this query likely fails with "relation does not exist"
    // and falls through to the empty state — caught below.
    const { data, error } = await supabase
      .from('student_album')
      .select(
        'id, student_id, experiment_id, chapter_title, comic_asset_url, comic_metadata, created_at'
      )
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message || 'fetch_error' };
    }
    const sessions = (data || [])
      .map(mapAlbumRowToSession)
      .filter(Boolean);
    return { data: sessions, error: null };
  } catch (err) {
    return {
      data: null,
      error: (err && err.message) || 'fetch_exception',
    };
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
          aria-label={`Apri fumetto ${fumetto.experimentTitle || session.experimentId || ''}`.trim()}
        >
          Apri fumetto
        </button>
      </footer>
    </article>
  );
}

function AlbumStudente({ sessions, onOpenFumetto, studentName, studentId }) {
  const safeName = (studentName || '').slice(0, 40);

  // Track fetched sessions when caller did NOT pass `sessions` prop
  // explicitly. Backward-compat: passing `sessions={...}` (incl. empty
  // array) short-circuits the fetch — preserves iter 70 test contract.
  const propsHasSessions = sessions !== undefined;
  const [fetchedSessions, setFetchedSessions] = useState(null);
  const [fetchState, setFetchState] = useState(
    propsHasSessions ? 'idle' : 'loading'
  );
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (propsHasSessions) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await fetchAlbumFromSupabase(studentId);
      if (cancelled) return;
      if (error) {
        setFetchError(error);
        setFetchedSessions([]);
        setFetchState('error');
      } else {
        setFetchedSessions(data || []);
        setFetchState('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propsHasSessions, studentId]);

  const effectiveSessions = propsHasSessions ? sessions : fetchedSessions;
  const hasSessions =
    Array.isArray(effectiveSessions) && effectiveSessions.length > 0;
  const isLoading = !propsHasSessions && fetchState === 'loading';

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

      {isLoading ? (
        <div className={styles.empty} data-testid="album-loading">
          <p className={styles.emptyTitle}>
            Ragazzi, stiamo caricando l'album dal vostro account…
          </p>
        </div>
      ) : !hasSessions ? (
        <div className={styles.empty} data-testid="album-empty">
          <p className={styles.emptyTitle}>
            Ragazzi, non c'è ancora nessun fumetto in album.
          </p>
          <p className={styles.emptyHint}>
            Aprite il kit ELAB e completate un esperimento sulla
            breadboard — l'UNLIM genererà automaticamente il fumetto
            che troverete qui (e potete scattare anche una foto del
            circuito reale).
          </p>
          {fetchError && (
            <p
              className={styles.emptyHint}
              data-testid="album-fetch-error"
              style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}
            >
              (Sincronizzazione offline — riprovate fra qualche minuto.)
            </p>
          )}
        </div>
      ) : (
        <div className={styles.grid} data-testid="album-grid">
          {effectiveSessions.map((s) => (
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
          Album studente — scaffold iter 70 D · Supabase wire iter 72 D · schema apply iter 73+
        </small>
      </footer>
    </section>
  );
}

export default AlbumStudente;
