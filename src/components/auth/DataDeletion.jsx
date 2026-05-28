// ============================================
// ELAB Tutor - Componente Eliminazione Dati
// GDPR Art. 17 - Diritto all'oblio
// © Andrea Marro — 15/02/2026
// ============================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clearAllSensitiveData } from '../../utils/crypto';
import { requestDataDeletion } from '../../services/gdprService';

/**
 * Componente per l'eliminazione completa dei dati utente (diritto all'oblio).
 * 
 * GDPR Art. 17: L'utente ha il diritto di ottenere la cancellazione dei dati
 * personali che lo riguardano senza ingiustificato ritardo.
 * 
 * @param {Object} props
 * @param {Object} props.user - Utente corrente
 * @param {Function} props.onDataDeleted - Callback quando i dati sono eliminati
 * @param {Function} props.onCancel - Callback per annullare
 */
export default function DataDeletion({ user, onDataDeleted, onCancel }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [confirmation, setConfirmation] = useState('');
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const reasons = [
        { value: 'no_longer_use', label: t('data_deletion.reasons.no_longer_use') },
        { value: 'privacy_concerns', label: t('data_deletion.reasons.privacy_concerns') },
        { value: 'data_breach', label: t('data_deletion.reasons.data_breach') },
        { value: 'incorrect_data', label: t('data_deletion.reasons.incorrect_data') },
        { value: 'other', label: t('data_deletion.reasons.other') },
    ];

    const handleStep1 = (e) => {
        e.preventDefault();
        if (!reason) {
            setError('Seleziona un motivo per continuare');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleStep2 = (e) => {
        e.preventDefault();
        if (confirmation !== 'ELIMINA') {
            setError('Digita ELIMINA per confermare');
            return;
        }
        setError('');
        setStep(3);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Inserisci la tua password per confermare');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Elimina dati locali cifrati
            clearAllSensitiveData();

            // 2. Chiamata backend GDPR (webhook → Notion)
            // requestDataDeletion gestisce anche la pulizia localStorage/sessionStorage
            await requestDataDeletion(user?.id || 'anonymous', password, reason);

            setSuccess(true);
            onDataDeleted?.();
        } catch (err) {
            setError('Errore durante l\'eliminazione. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={{ ...styles.successIcon, color: 'var(--elab-hex-28a745)' }}>&#10003;</div>
                    <h2 style={styles.successTitle}>{t('data_deletion.success_title')}</h2>
                    <p style={styles.successMessage}>
                        {t('data_deletion.success_message')}
                    </p>
                    <p style={styles.successSubmessage}>
                        {t('data_deletion.success_submessage')}
                    </p>
                    <div style={styles.successNotice}>
                        <strong>{t('data_deletion.success_notice_label')}</strong> {t('data_deletion.success_notice')}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.icon}>&#9888;</div>
                    <h2 style={styles.title}>{t('data_deletion.title')}</h2>
                </div>

                <div style={styles.warningBanner}>
                    <strong>{t('data_deletion.warning_label')}</strong> {t('data_deletion.warning_body')}
                </div>

                {/* Step 1: Motivo */}
                {step === 1 && (
                    <form onSubmit={handleStep1} style={styles.form}>
                        <p style={styles.description}>
                            {t('data_deletion.step1_description')}
                        </p>

                        <div style={styles.reasonsList}>
                            {reasons.map(r => (
                                <label key={r.value} style={styles.reasonLabel}>
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                    <span>{r.label}</span>
                                </label>
                            ))}
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <div style={styles.buttons}>
                            <button type="submit" style={styles.continueBtn}>
                                {t('data_deletion.buttons.continue')}
                            </button>
                            <button type="button" onClick={onCancel} style={styles.cancelBtn}>
                                {t('data_deletion.buttons.cancel')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Conferma ELIMINA */}
                {step === 2 && (
                    <form onSubmit={handleStep2} style={styles.form}>
                        <p style={styles.description}>
                            {t('data_deletion.step2_description_prefix')}
                            <strong>{t('data_deletion.step2_keyword')}</strong>
                            {t('data_deletion.step2_description_suffix')}
                        </p>

                        <div style={styles.field}>
                            <input
                                type="text"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                placeholder={t('data_deletion.step2_placeholder')}
                                style={styles.input}
                                autoFocus
                            />
                        </div>

                        <div style={styles.dataList}>
                            <h4 style={styles.dataListTitle}>{t('data_deletion.data_list_title')}</h4>
                            <ul style={styles.dataListItems}>
                                <li>{t('data_deletion.data_list.profile')}</li>
                                <li>{t('data_deletion.data_list.progress')}</li>
                                <li>{t('data_deletion.data_list.moods')}</li>
                                <li>{t('data_deletion.data_list.projects')}</li>
                                <li>{t('data_deletion.data_list.posts')}</li>
                                <li>{t('data_deletion.data_list.session')}</li>
                            </ul>
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <div style={styles.buttons}>
                            <button type="submit" style={styles.continueBtn}>
                                {t('data_deletion.buttons.continue')}
                            </button>
                            <button type="button" onClick={() => setStep(1)} style={styles.backBtn}>
                                {t('data_deletion.buttons.back')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Password finale */}
                {step === 3 && (
                    <form onSubmit={handleFinalSubmit} style={styles.form}>
                        <p style={styles.description}>
                            {t('data_deletion.step3_description')}
                        </p>

                        <div style={styles.field}>
                            <label style={styles.label}>{t('data_deletion.password_label')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('data_deletion.password_placeholder')}
                                style={styles.input}
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <div style={styles.buttons}>
                            <button 
                                type="submit" 
                                style={{ ...styles.deleteBtn, opacity: loading ? 0.7 : 1 }}
                                disabled={loading}
                            >
                                {loading ? t('data_deletion.buttons.deleting') : t('data_deletion.buttons.delete_final')}
                            </button>
                            <button type="button" onClick={() => setStep(2)} style={styles.backBtn}>
                                {t('data_deletion.buttons.back')}
                            </button>
                        </div>
                    </form>
                )}

                <div style={styles.gdprInfo}>
                    <span style={styles.gdprIcon}>*</span>
                    <span>
                        {t('data_deletion.gdpr_info_prefix')}
                        <strong>{t('data_deletion.gdpr_label')}</strong>
                        {t('data_deletion.gdpr_info_middle')}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>
                            {t('data_deletion.gdpr_info_link')}
                        </a>
                        {t('data_deletion.gdpr_info_suffix')}
                    </span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        overflowY: 'auto',
        padding: '20px',
        background: 'linear-gradient(135deg, var(--elab-navy) 0%, #0d1b2a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    },
    successCard: {
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '16px',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '12px',
    },
    title: {
        color: 'var(--elab-hex-dc3545)',
        fontSize: '24px',
        fontWeight: '700',
        margin: 0,
    },
    warningBanner: {
        background: 'var(--elab-hex-fff3cd)',
        border: '1px solid var(--elab-hex-ffc107)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '24px',
        color: 'var(--elab-hex-856404)',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    description: {
        color: '#333',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: 0,
    },
    reasonsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    reasonLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        background: 'var(--elab-hex-f8f9fa)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: '#333',
        fontSize: '14px',
        fontWeight: '600',
    },
    input: {
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        background: '#fff',
        outline: 'none',
    },
    dataList: {
        background: 'var(--elab-hex-f8f9fa)',
        borderRadius: '10px',
        padding: '16px',
    },
    dataListTitle: {
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: '#333',
    },
    dataListItems: {
        margin: 0,
        paddingLeft: '20px',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.8',
    },
    error: {
        color: 'var(--elab-hex-dc3545)',
        fontSize: '14px',
        padding: '12px',
        background: 'var(--elab-hex-f8d7da)',
        borderRadius: '8px',
        border: '1px solid var(--elab-hex-f5c6cb)',
    },
    buttons: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    },
    continueBtn: {
        flex: 1,
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        background: 'var(--elab-navy)',
        color: '#fff',
        cursor: 'pointer',
    },
    cancelBtn: {
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '10px',
        border: '1px solid #ddd',
        background: '#fff',
        color: '#666',
        cursor: 'pointer',
    },
    backBtn: {
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '10px',
        border: '1px solid #ddd',
        background: 'var(--elab-hex-f8f9fa)',
        color: '#666',
        cursor: 'pointer',
    },
    deleteBtn: {
        flex: 1,
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        background: 'var(--elab-hex-dc3545)',
        color: '#fff',
        cursor: 'pointer',
    },
    gdprInfo: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #eee',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.5',
    },
    gdprIcon: {
        fontSize: '16px',
    },
    link: {
        color: 'var(--elab-navy)',
        textDecoration: 'underline',
    },
    successIcon: {
        fontSize: '64px',
        marginBottom: '16px',
    },
    successTitle: {
        color: 'var(--elab-hex-28a745)',
        fontSize: '24px',
        fontWeight: '700',
        margin: '0 0 12px 0',
    },
    successMessage: {
        color: '#333',
        fontSize: '16px',
        margin: '0 0 8px 0',
    },
    successSubmessage: {
        color: '#666',
        fontSize: '14px',
        margin: '0 0 16px 0',
    },
    successNotice: {
        background: 'var(--elab-hex-e8f4fd)',
        border: '1px solid var(--elab-hex-bee5eb)',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px',
        color: 'var(--elab-hex-0c5460)',
    },
};
