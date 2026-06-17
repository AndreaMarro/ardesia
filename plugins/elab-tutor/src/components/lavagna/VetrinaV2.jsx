/**
 * VetrinaV2 — Landing page pre-login per la Lavagna ELAB
 * Hero con palette ELAB, stats, CTA, card volumi.
 * Sostituira VetrinaSimulatore in S8.
 * (c) Andrea Marro — 02/04/2026
 */
import React from 'react';
import css from './VetrinaV2.module.css';

const STATS = [
  { value: '62', label: 'Esperimenti' },
  { value: '21', label: 'Componenti' },
  { value: '3', label: 'Volumi' },
  { value: '24', label: 'Comandi Vocali' },
];

const VOLUMES = [
  { num: 1, color: 'var(--elab-lime)', title: 'Le Basi', desc: 'LED, resistori, condensatori, pulsanti', exp: 38 },
  { num: 2, color: 'var(--elab-orange)', title: 'Approfondiamo', desc: 'Serie, parallelo, transistor, MOSFET', exp: 18 },
  { num: 3, color: 'var(--elab-red)', title: 'Arduino', desc: 'Pin digitali, analogici, programmazione', exp: 6 },
];

export default function VetrinaV2({ onLogin, onRegister }) {
  return (
    <div className={css.container}>
      {/* Hero */}
      <section className={css.hero}>
        <div className={css.heroContent}>
          <span className={css.badge}>Simulatore Educativo</span>
          <h1 className={css.title}>
            Elettronica <span className={css.accent}>per tutti</span>
          </h1>
          <p className={css.subtitle}>
            Il docente arriva alla LIM e inizia subito a insegnare.
            Nessuna conoscenza pregressa richiesta.
          </p>
          <div className={css.ctas}>
            <button className={css.ctaPrimary} onClick={onLogin} aria-label="Accedi a ELAB">
              Accedi
            </button>
            <button className={css.ctaSecondary} onClick={onRegister} aria-label="Prova ELAB gratis">
              Prova Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={css.statsRow}>
        {STATS.map(s => (
          <div key={s.label} className={css.statCard}>
            <span className={css.statValue}>{s.value}</span>
            <span className={css.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Volumes */}
      <section className={css.volumes}>
        <h2 className={css.sectionTitle}>I tre volumi ELAB</h2>
        <p className={css.sectionSub}>Ogni volume si lega al kit fisico. Tutor + Kit + Volumi = unico prodotto.</p>
        <div className={css.volGrid}>
          {VOLUMES.map(v => (
            <div key={v.num} className={css.volCard}>
              <div className={css.volAccent} style={{ background: v.color }} />
              <div className={css.volBody}>
                <span className={css.volNum} style={{ color: v.color }}>Volume {v.num}</span>
                <h3 className={css.volTitle}>{v.title}</h3>
                <p className={css.volDesc}>{v.desc}</p>
                <span className={css.volExp}>{v.exp} esperimenti</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className={css.footerCta}>
        <h2 className={css.footerTitle}>Pronto per iniziare?</h2>
        <button className={css.ctaPrimary} onClick={onLogin} aria-label="Entra nella Lavagna ELAB">
          Entra nella Lavagna
        </button>
      </section>
    </div>
  );
}
