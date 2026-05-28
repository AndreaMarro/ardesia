/**
 * ELAB — Analytics Consent Banner (GDPR Art. 8 / COPPA)
 * Banner per consenso cookie analitici - Ottimizzato per bambini 8-14 anni.
 * Mostra solo se l'utente non ha ancora scelto.
 * Include link alla Privacy Policy.
 *
 * Flow:
 *   Phase 'age'      — selettore eta (prima visita)
 *   Phase 'consent'   — accept/reject (>=14 anni)
 *   Phase 'parental'  — richiesta email genitore (<14 anni, Art. 8 GDPR Italia)
 *   Phase 'sent'      — conferma invio email genitore
 *
 * Consent values:
 *   'accepted' — analytics attivi (anonimizzati, no ID persistente)
 *   'rejected' — analytics bloccati
 *   'parental_required' — richiesto consenso genitore
 *   'parental_sent' — email inviata al genitore
 *   'parental_verified' — consenso genitore verificato
 *   null       — nessuna scelta (mostra banner)
 *
 * Italy digital age of consent: 14 (D.Lgs. 101/2018, Art. 2-quinquies)
 *
 * © Andrea Marro — 15/02/2026
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getConsent, saveConsent, isCOPPAApplicable } from '../../services/gdprService';
import gdprService from '../../services/gdprService';
import studentTracker from '../../services/studentTracker';
import { showToast } from './Toast';
import useFocusTrap from '../../hooks/useFocusTrap';
import { markOverlayDismissed } from '../../hooks/useOverlayQueue';
import styles from './ConsentBanner.module.css';

const CONSENT_KEY = 'elab_consent_v2';

/** Soglia eta digitale Italia (Art. 8 GDPR + D.Lgs. 101/2018) */
const ITALY_DIGITAL_AGE = 14;

/** Opzioni età per il selettore. Etichette risolte runtime via t().
 * iter 2026-05-28 i18n: il selettore prima usava costanti italiane statiche
 * (`Scegli...`, `X anni`, `18+ anni`). Adesso le costanti contengono solo gli
 * identificativi value + le t-key per la label; risolte dentro il componente. */
const AGE_OPTIONS = [
  { value: '', labelKey: 'consent.age_choose' },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: String(8 + i),
    labelKey: 'consent.age_year_n',
    n: 8 + i,
  })),
  { value: '18', labelKey: 'consent.age_18_plus' },
];

/**
 * Valida un indirizzo email con un pattern base.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ConsentBanner() {
  const { t } = useTranslation();
  const renderAgeLabel = (opt) => opt.n != null ? t(opt.labelKey, { n: opt.n }) : t(opt.labelKey);
  const [visible, setVisible] = useState(false);
  const [userAge, setUserAge] = useState(null);
  const [phase, setPhase] = useState('age'); // 'age' | 'consent' | 'parental' | 'sent'
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmailError, setParentEmailError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const consent = getConsent();
      if (consent === null) {
        setVisible(true);
      } else if (consent.status === 'parental_required' || consent.status === 'parental_sent') {
        // Minore senza consenso parentale verificato — mostra stato attesa
        setVisible(true);
        setPhase('sent');
        if (consent.parentEmail) {
          setParentEmail(consent.parentEmail);
        }
      }

      // Recupera eta se disponibile
      const storedAge = sessionStorage.getItem('elab_user_age');
      if (storedAge) {
        const age = parseInt(storedAge, 10);
        setUserAge(age);
        // Se l'eta e' gia' nota, salta la fase age
        if (age >= ITALY_DIGITAL_AGE) {
          setPhase('consent');
        } else {
          // Se non e' gia' in fase 'sent', mostra flusso parentale
          setPhase(prev => prev === 'sent' ? 'sent' : 'parental');
        }
      }
    } catch {
      // localStorage non disponibile — non mostrare banner
    }
  }, []);

  /** Gestione selezione eta */
  const handleAgeConfirm = () => {
    if (!userAge) return;

    try {
      sessionStorage.setItem('elab_user_age', String(userAge));
    } catch {
      // ignore
    }

    if (userAge >= ITALY_DIGITAL_AGE) {
      setPhase('consent');
    } else {
      setPhase('parental');
    }
  };

  /** Accetta consenso (solo >=14) */
  const handleAccept = () => {
    try {
      saveConsent({
        status: 'accepted',
        age: userAge,
        timestamp: new Date().toISOString(),
        analyticsAnonymized: true,
      });
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      // ignore
    }
    // GDPR Art.7: attivare tracking SOLO dopo consenso esplicito
    studentTracker.initAfterConsent();
    setVisible(false);
    markOverlayDismissed();
  };

  /** Rifiuta consenso */
  const handleReject = () => {
    try {
      saveConsent({
        status: 'rejected',
        age: userAge,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(CONSENT_KEY, 'rejected');
    } catch {
      // ignore
    }
    setVisible(false);
    markOverlayDismissed();
  };

  /** Invio richiesta consenso parentale */
  const handleParentalRequest = async () => {
    setParentEmailError('');

    if (!parentEmail.trim()) {
      setParentEmailError("Inserisci l'email del tuo genitore");
      return;
    }

    if (!isValidEmail(parentEmail.trim())) {
      setParentEmailError("Questa email non sembra corretta. Controlla bene!");
      return;
    }

    setSending(true);
    try {
      await gdprService.requestParentalConsent({
        childAge: userAge,
        parentEmail: parentEmail.trim(),
        consentMethod: 'email',
      });

      // Salva stato locale
      saveConsent({
        status: 'parental_required',
        age: userAge,
        parentEmail: parentEmail.trim(),
        timestamp: new Date().toISOString(),
      });

      setPhase('sent');
      showToast('Email inviata al tuo genitore!', 'success');
    } catch {
      // Webhook fallito: NON fingere che l'email sia stata inviata (COPPA compliance)
      setParentEmailError("Non siamo riusciti a inviare l'email. Riprova tra poco o chiedi al tuo insegnante.");
      showToast("Invio email fallito — riprova", 'error');
    } finally {
      setSending(false);
    }
  };

  // Messaggio adattato per bambini
  const isChild = userAge && userAge < ITALY_DIGITAL_AGE;

  // Maschera parziale dell'email genitore per conferma
  const maskedEmail = parentEmail
    ? parentEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
    : '';

  const trapRef = useFocusTrap(visible);

  if (!visible) return null;

  return (
    <div ref={trapRef} className={styles.banner} role="dialog" aria-label={t('consent.dialog_aria')} aria-modal="true">
      {/* ── FASE 1: Selezione eta ── */}
      {phase === 'age' && (
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <p className={styles.textChild}>
              {t('consent.age_intro')}
            </p>
            <div className={styles.ageRow}>
              <label htmlFor="elab-age-select" className={styles.ageLabel}>
                {t('consent.age_question')}
              </label>
              <select
                id="elab-age-select"
                className={styles.ageSelect}
                value={userAge || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setUserAge(v ? parseInt(v, 10) : null);
                }}
              >
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {renderAgeLabel(opt)}
                  </option>
                ))}
              </select>
              <button
                className={styles.btnAccept}
                onClick={handleAgeConfirm}
                disabled={!userAge}
              >
                {t('consent.age_next')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FASE 2a: Consenso standard (>=14) ── */}
      {phase === 'consent' && (
        <>
          <div className={styles.content}>
            <div className={styles.textContainer}>
              <p className={isChild ? styles.textChild : styles.text}>
                {isChild ? t('consent.child_text') : t('consent.adult_text')}
                {' '}
                <a
                  href="/privacy"
                  className={styles.privacyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isChild ? t('consent.child_privacy_link') : t('consent.adult_privacy_link')}
                </a>
              </p>

              {userAge && isCOPPAApplicable(userAge) && (
                <p className={styles.coppaNotice}>
                  <strong>{t('consent.coppa_label')}</strong> {t('consent.coppa_body')}
                </p>
              )}
            </div>
          </div>

          <div className={styles.buttons}>
            <button className={styles.btnAccept} onClick={handleAccept}>
              {isChild ? t('consent.accept_child') : t('consent.accept_adult')}
            </button>
            <button className={styles.btnReject} onClick={handleReject}>
              {isChild ? t('consent.reject_child') : t('consent.reject_adult')}
            </button>
          </div>
        </>
      )}

      {/* ── FASE 2b: Flusso parentale (<14 anni) ── */}
      {phase === 'parental' && (
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <p className={styles.textChild}>
              {t('consent.parental_intro')}
            </p>
            <p className={styles.parentalExplain}>
              {t('consent.parental_explain')}
            </p>

            <div className={styles.parentalForm}>
              <label htmlFor="elab-parent-email" className={styles.ageLabel}>
                {t('consent.parental_email_label')}
              </label>
              <input
                id="elab-parent-email"
                type="email"
                className={styles.parentInput}
                placeholder={t('consent.parental_email_placeholder')}
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e.target.value);
                  setParentEmailError('');
                }}
                disabled={sending}
              />
              {parentEmailError && (
                <p className={styles.emailError} role="alert" aria-live="assertive">{parentEmailError}</p>
              )}
              <button
                className={styles.btnParental}
                onClick={handleParentalRequest}
                disabled={sending}
              >
                {sending ? t('consent.parental_sending') : t('consent.parental_send')}
              </button>
            </div>

            <p className={styles.parentalNote}>
              {t('consent.parental_note')}
            </p>
          </div>
        </div>
      )}

      {/* ── FASE 3: Conferma invio ── */}
      {phase === 'sent' && (
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <p className={styles.textChild}>
              {t('consent.sent_intro', { email: '__MASKED__' }).split('__MASKED__').map((part, i, arr) =>
                i < arr.length - 1
                  ? <React.Fragment key={i}>{part}<strong>{maskedEmail}</strong></React.Fragment>
                  : <React.Fragment key={i}>{part}</React.Fragment>
              )}
            </p>
            <p className={styles.parentalNote}>
              {t('consent.sent_note')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
