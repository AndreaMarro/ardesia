/**
 * DashboardShell — shell docente dashboard, integrato con useDashboardData hook (Day 18).
 *
 * Backward-compat (Day 10 scaffold test): rendering senza props conserva il
 * placeholder "Dashboard Docente — in sviluppo". L'integrazione hook è opt-in
 * tramite prop `enabled={true}` (default `false`) per evitare fetch non voluti
 * finché la Edge Function `dashboard-data` è solo scaffold.
 *
 * Props:
 *   - enabled (bool, default false)   → abilita fetch al mount
 *   - teacherId (string, optional)     → query param teacher_id
 *   - range ('7d'|'30d'|'90d', '7d')   → window metriche
 *
 * Stati renderizzati (uno alla volta):
 *   - disabled  → placeholder scaffold
 *   - loading   → skeleton con aria-busy
 *   - error     → alert accessibile (role="alert") con codice errore
 *   - ready     → 4 metric card (student_count / interactions / minutes / experiments)
 *
 * Accessibility: role="region" + aria-label + aria-live="polite" + aria-busy su loading.
 * Design tokens: Navy #1E4D8C title, palette CLAUDE.md regola 16.
 */
import React from 'react';
import styles from './DashboardShell.module.css';
import { useDashboardData } from '../../hooks/useDashboardData';

function MetricCard({ label, value, testId }) {
  return (
    <div className={styles.card} data-testid={testId}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}

export default function DashboardShell({ enabled = false, teacherId, range = '7d' } = {}) {
  const { metrics, schemaVersion, loading, error, refetch } = useDashboardData({
    teacherId,
    range,
    enabled,
  });

  const isDisabled = !enabled;

  return (
    <section
      className={styles.shell}
      role="region"
      aria-label="Dashboard Docente"
      aria-live="polite"
      aria-busy={loading || undefined}
    >
      <h1 className={styles.title}>Dashboard Docente</h1>

      {isDisabled && (
        <p className={styles.body} data-testid="dashboard-placeholder">
          In sviluppo — disponibile Day 11+.
        </p>
      )}

      {enabled && loading && (
        <p className={styles.body} data-testid="dashboard-loading">
          Caricamento metriche...
        </p>
      )}

      {enabled && error && (
        <div
          className={styles.error}
          role="alert"
          data-testid="dashboard-error"
        >
          <strong>Errore:</strong> {error.message}
          {error.code && <span className={styles.errorCode}> [{error.code}]</span>}
          <button
            type="button"
            className={styles.retryButton}
            onClick={refetch}
            data-testid="dashboard-retry"
          >
            Riprova
          </button>
        </div>
      )}

      {enabled && !loading && !error && (
        <>
          {schemaVersion && (
            <p className={styles.schemaBadge} data-testid="dashboard-schema">
              schema {schemaVersion}
            </p>
          )}
          <div className={styles.grid} data-testid="dashboard-grid">
            <MetricCard
              label="Studenti"
              value={metrics.student_count}
              testId="metric-student-count"
            />
            <MetricCard
              label="Interazioni"
              value={metrics.total_interactions}
              testId="metric-interactions"
            />
            <MetricCard
              label="Minuti medi sessione"
              value={metrics.avg_session_minutes}
              testId="metric-avg-minutes"
            />
            <MetricCard
              label="Esperimenti completati"
              value={metrics.experiments_completed}
              testId="metric-experiments"
            />
          </div>
        </>
      )}
    </section>
  );
}
