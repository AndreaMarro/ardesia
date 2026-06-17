/**
 * WelcomePage — Pagina di benvenuto ELAB Tutor
 * Campo chiave univoca → redirect a #lavagna
 * (c) Andrea Marro — 03/04/2026
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setClassKey } from '../services/supabaseSync';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--elab-navy) 0%, #2A5FA0 40%, var(--elab-lime) 100%)',
    fontFamily: "'Open Sans', sans-serif",
    padding: 24,
  },
  card: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding: '48px 40px',
    maxWidth: 440,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--elab-navy)',
    margin: '0 0 8px',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    margin: '0 0 32px',
  },
  label: {
    display: 'block',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--elab-navy)',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
    border: '2px solid #ddd',
    borderRadius: 12,
    outline: 'none',
    transition: 'border-color 200ms',
    fontFamily: "'Open Sans', sans-serif",
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '14px',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: 1,
    color: '#fff',
    background: 'var(--elab-lime)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'background 200ms',
    minHeight: 48,
  },
  error: {
    color: 'var(--elab-red)',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
};

export default function WelcomePage({ onNavigate }) {
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  // E2E bypass — only when VITE_E2E_AUTH_BYPASS=true on Preview deploy.
  // NEVER enabled on Production (env var scope: Preview only in Vercel).
  // Allows Playwright harness to skip license gate WelcomePage and load Lavagna directly.
  useEffect(() => {
    if (import.meta.env.VITE_E2E_AUTH_BYPASS === 'true') {
      try { localStorage.setItem('elab-license-key', 'ELAB2026'); } catch { /* */ }
      setClassKey('ELAB2026');
      if (onNavigate) onNavigate('lavagna');
      else window.location.hash = '#lavagna';
    }
  }, [onNavigate]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError(t('welcome.error_required'));
      return;
    }
    // Validazione chiave — password hardcoded unica
    if (trimmed.toUpperCase() !== 'ELAB2026') {
      setError(t('welcome.error_invalid'));
      return;
    }
    // Salva la chiave e vai alla Lavagna
    try { localStorage.setItem('elab-license-key', trimmed); } catch { /* */ }
    setClassKey(trimmed);
    if (onNavigate) onNavigate('lavagna');
    else window.location.hash = '#lavagna';
  }, [key, onNavigate]);

  return (
    <div style={S.page}>
      <div style={S.card}>
        <img
          src="/assets/mascot/logo-senza-sfondo.png"
          alt="UNLIM"
          style={S.logo}
        />
        <h1 style={S.title}>{t('welcome.title')}</h1>
        <p style={S.subtitle}>{t('welcome.subtitle')}</p>

        <form onSubmit={handleSubmit}>
          <label style={S.label} htmlFor="license-key">{t('welcome.key_label')}</label>
          <input
            id="license-key"
            style={S.input}
            type="text"
            placeholder={t('welcome.key_placeholder')}
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            autoFocus
            autoComplete="off"
          />
          {error && <div style={S.error}>{error}</div>}
          <button
            type="submit"
            style={S.btn}
            onMouseEnter={(e) => e.target.style.background = 'var(--elab-hex-3d6620)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--elab-lime)'}
          >
            {t('welcome.enter')}
          </button>
        </form>
      </div>
      <div style={S.footer}>{t('welcome.footer')}</div>
    </div>
  );
}
