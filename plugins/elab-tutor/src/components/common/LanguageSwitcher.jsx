// ELAB Tutor — © Andrea Marro — 2026-05-28
// LanguageSwitcher: simple IT/EN toggle. Click cycles. Persists via i18next-browser-languagedetector
// (caches: ['localStorage'], key 'elab-locale'). Future: write Supabase users.preferred_language
// when authenticated (out of scope this iteration — Andrea ratify migration).

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LABELS = {
  it: { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  en: { code: 'EN', label: 'English', flag: '🇬🇧' },
};

export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'it').slice(0, 2);
  const next = current === 'it' ? 'en' : 'it';

  const handleToggle = useCallback(() => {
    i18n.changeLanguage(next);
  }, [i18n, next]);

  const cur = LABELS[current] || LABELS.it;
  const nxt = LABELS[next];

  return (
    <button
      type="button"
      className={`${styles.switcher} ${compact ? styles.compact : ''} ${className}`}
      onClick={handleToggle}
      aria-label={t('language.switchTo', { lang: nxt.label })}
      title={t('language.switchTo', { lang: nxt.label })}
      data-testid="language-switcher"
    >
      <span className={styles.flag} aria-hidden="true">{cur.flag}</span>
      <span className={styles.code}>{cur.code}</span>
      {!compact && <span className={styles.divider} aria-hidden="true">→</span>}
      {!compact && <span className={styles.nextCode}>{nxt.code}</span>}
    </button>
  );
}
