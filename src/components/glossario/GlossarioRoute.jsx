/**
 * GlossarioRoute — internal #glossario route.
 *
 * Sprint U iter 70 Team D — UI overhaul + Tea materials integration carryover.
 *
 * Replaces external `https://elab-tutor-glossario.vercel.app/glossario` link
 * (mandate `feedback_glossario_external_url.md` carryover iter 41 PM).
 *
 * Data source: `src/data/glossario-terms.json` (180 terms total — Tea 27/04/2026
 * extracted from 3 PDFs: 66 Vol1 + 59 Vol2 + 55 Vol3).
 *
 * The external standalone page documented "61 termini, 3 volumi, 2 reading modes,
 * alphabet filter A-U". We expose:
 *   - All 180 terms with volume + chapter context
 *   - 2 reading modes: TECNICO (spec) / BAMBINI (kid-friendly)
 *   - Alphabet filter (auto-derived from `term[0].toUpperCase()`)
 *   - Volume filter chips (Vol 1 / Vol 2 / Vol 3 / Tutti)
 *   - Free-text search on term + technical text + child text
 *
 * Linguaggio: plurale "Ragazzi" preserved (PRINCIPIO ZERO).
 *
 * Honesty caveats:
 *   - NOT visually verified browser (defer Andrea ratify iter 71+ Playwright)
 *   - External standalone reported 61 terms (likely Vol1-only filtered) —
 *     internal version preserves all 180 terms across 3 volumes
 *   - No Supabase persistence (read-only, static JSON bundled with app)
 *   - No external CDN — Tea PDFs were extracted at build time, stored in
 *     `src/data/glossario-terms.json` and shipped in the bundle
 *
 * Andrea Marro — 2026-05-16 PM iter 70 Team D
 */
import React, { useMemo, useState, useCallback } from 'react';
import glossarioData from '../../data/glossario-terms.json';
import UnlimMascotte from '../common/UnlimMascotte';
import styles from './GlossarioRoute.module.css';

const ALL_VOLUMES = [1, 2, 3];
const READING_MODES = [
  { id: 'bambini', label: 'Per Ragazzi', helper: 'Spiegazioni semplici 8-14 anni' },
  { id: 'tecnico', label: 'Tecnico', helper: 'Definizioni per docenti + Volume riferimento' },
];

/**
 * Group terms by initial letter (uppercase, dedup punctuation).
 * Returns sorted alphabet list and a map letter → terms[].
 */
export function indexByLetter(terms) {
  const map = new Map();
  for (const t of terms) {
    const ch = (t.term || '').trim().charAt(0).toUpperCase();
    if (!ch) continue;
    if (!map.has(ch)) map.set(ch, []);
    map.get(ch).push(t);
  }
  return {
    letters: Array.from(map.keys()).sort((a, b) => a.localeCompare(b, 'it')),
    byLetter: map,
  };
}

/**
 * Filter terms by volume set + free-text search.
 * Returns new array (preserves original order within filter).
 */
export function filterTerms(allTerms, { volumes, search }) {
  const set = new Set(volumes && volumes.length ? volumes : ALL_VOLUMES);
  const q = (search || '').trim().toLowerCase();
  return allTerms.filter((t) => {
    if (!set.has(t.volume)) return false;
    if (!q) return true;
    const hay = `${t.term} ${t.tecnico} ${t.bambini} ${t.capitoloTitle}`.toLowerCase();
    return hay.includes(q);
  });
}

function GlossarioRoute({ onClose }) {
  const allTerms = glossarioData.terms || [];
  const [activeVolumes, setActiveVolumes] = useState([1, 2, 3]);
  const [readingMode, setReadingMode] = useState('bambini');
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState(null);

  const filtered = useMemo(
    () => filterTerms(allTerms, { volumes: activeVolumes, search }),
    [allTerms, activeVolumes, search]
  );

  const indexed = useMemo(() => indexByLetter(filtered), [filtered]);

  const displayed = useMemo(() => {
    if (!activeLetter) return filtered;
    return indexed.byLetter.get(activeLetter) || [];
  }, [filtered, indexed, activeLetter]);

  const toggleVolume = useCallback((vol) => {
    setActiveVolumes((prev) => {
      if (prev.includes(vol)) {
        // Removing — but never empty (always at least one volume on)
        const next = prev.filter((v) => v !== vol);
        return next.length ? next : ALL_VOLUMES;
      }
      return [...prev, vol].sort();
    });
    setActiveLetter(null);
  }, []);

  const resetAll = useCallback(() => {
    setActiveVolumes([1, 2, 3]);
    setReadingMode('bambini');
    setSearch('');
    setActiveLetter(null);
  }, []);

  return (
    <div className={styles.route} data-testid="glossario-route">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <UnlimMascotte size="small" state="aspetta" position="inline" />
          <div>
            <h1 className={styles.title}>Glossario ELAB</h1>
            <p className={styles.subtitle}>
              {allTerms.length} termini dai 3 volumi · curato da Tea De Venere
            </p>
          </div>
        </div>
        {typeof onClose === 'function' && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            data-testid="glossario-close"
            aria-label="Chiudi glossario"
          >
            Chiudi
          </button>
        )}
      </header>

      <section className={styles.toolbar} aria-label="Filtri glossario">
        <div className={styles.filterGroup} role="group" aria-label="Volumi">
          <span className={styles.filterLabel}>Volumi</span>
          {ALL_VOLUMES.map((v) => {
            const active = activeVolumes.includes(v);
            return (
              <button
                key={v}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                aria-pressed={active}
                data-testid={`glossario-vol-${v}`}
                onClick={() => toggleVolume(v)}
              >
                Vol {v}
              </button>
            );
          })}
        </div>

        <div className={styles.filterGroup} role="group" aria-label="Modalità lettura">
          <span className={styles.filterLabel}>Modalità</span>
          {READING_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.chip} ${
                readingMode === m.id ? styles.chipActive : ''
              }`}
              aria-pressed={readingMode === m.id}
              data-testid={`glossario-mode-${m.id}`}
              onClick={() => setReadingMode(m.id)}
              title={m.helper}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.searchGroup}>
          <label htmlFor="glossario-search" className={styles.srOnly}>
            Cerca un termine
          </label>
          <input
            id="glossario-search"
            type="search"
            className={styles.searchInput}
            placeholder="Cerca: tensione, LED, microchip..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveLetter(null);
            }}
            data-testid="glossario-search"
            autoComplete="off"
          />
          {(search || activeLetter || activeVolumes.length < 3) && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetAll}
              data-testid="glossario-reset"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      <nav className={styles.alphabet} aria-label="Filtra per lettera">
        <button
          type="button"
          className={`${styles.alphaBtn} ${!activeLetter ? styles.alphaActive : ''}`}
          onClick={() => setActiveLetter(null)}
          data-testid="glossario-alpha-all"
        >
          Tutti
        </button>
        {indexed.letters.map((ch) => (
          <button
            key={ch}
            type="button"
            className={`${styles.alphaBtn} ${
              activeLetter === ch ? styles.alphaActive : ''
            }`}
            onClick={() => setActiveLetter(ch)}
            data-testid={`glossario-alpha-${ch}`}
          >
            {ch}
          </button>
        ))}
      </nav>

      <main className={styles.results} data-testid="glossario-results">
        <p className={styles.resultsCount}>
          {displayed.length === 0
            ? 'Ragazzi, nessun termine trovato. Provate un altro filtro.'
            : `${displayed.length} ${
                displayed.length === 1 ? 'termine' : 'termini'
              } trovat${displayed.length === 1 ? 'o' : 'i'}`}
        </p>

        <ul className={styles.cardList}>
          {displayed.map((t) => (
            <li
              key={t.id}
              className={styles.card}
              data-testid={`glossario-term-${t.id}`}
            >
              <header className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{t.term}</h3>
                <span
                  className={`${styles.cardBadge} ${
                    styles[`badgeVol${t.volume}`] || ''
                  }`}
                >
                  Vol {t.volume} · Cap {t.capitolo}
                </span>
              </header>
              <p className={styles.cardChapter}>{t.capitoloTitle}</p>
              <p
                className={styles.cardBody}
                data-mode={readingMode}
              >
                {readingMode === 'tecnico' ? t.tecnico : t.bambini}
              </p>
            </li>
          ))}
        </ul>
      </main>

      <footer className={styles.footer}>
        <small>
          Curato da Tea De Venere · 27 aprile 2026 — per Andrea Marro · Volumi
          Davide Fagherazzi
        </small>
      </footer>
    </div>
  );
}

export default GlossarioRoute;
