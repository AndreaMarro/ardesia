// ============================================
// ELAB Tutor - Pagina Registrazione
// Tutti i diritti riservati
// ============================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// Andrea Marro — 18/02/2026
const EyeIcon = ({ open }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {open ? (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        )}
    </svg>
);

const Spinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'registerSpin 0.8s linear infinite' }}>
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
);

export default function RegisterPage({ onNavigate }) {
    const { t } = useTranslation();
    const { register } = useAuth();
    const [form, setForm] = useState({
        nome: '',
        email: '',
        password: '',
        confermaPassword: '',
        scuola: '',
        citta: '',
        ruolo: 'user',
        privacyAccepted: false,
        parentConsent: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nome.trim() || !form.email.trim() || !form.password.trim()) {
            setError(t('auth.register.error_required'));
            return;
        }
        if (form.password.length < 6) {
            setError(t('auth.register.error_password_length'));
            return;
        }
        if (form.password !== form.confermaPassword) {
            setError(t('auth.register.error_password_mismatch'));
            return;
        }
        if (!form.privacyAccepted) {
            setError(t('auth.register.error_privacy_required'));
            return;
        }
        if (form.ruolo === 'user' && !form.parentConsent) {
            setError(t('auth.register.error_parent_consent'));
            return;
        }

        setLoading(true);
        setError('');
        const result = await register({
            nome: form.nome.trim(),
            email: form.email.trim(),
            password: form.password,
            scuola: form.scuola.trim(),
            citta: form.citta.trim(),
            ruolo: form.ruolo,
        });

        if (!result.success) {
            setError(result.error);
        } else {
            onNavigate('tutor');
        }
        setLoading(false);
    };

    const inputStyle = (field) => ({
        ...styles.input,
        borderColor: focusedField === field
            ? 'var(--elab-lime)'
            : 'rgba(255,255,255,0.15)',
        boxShadow: focusedField === field
            ? '0 0 0 3px rgba(124,179,66,0.2)'
            : 'none',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
    });

    return (
        <div style={styles.page}>
            {/* Inject spinner keyframes */}
            <style>{`
                @keyframes registerSpin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div style={styles.card}>
                <div style={{ ...styles.logo, color: 'var(--elab-navy)', fontWeight: 800, fontFamily: 'Oswald, sans-serif', letterSpacing: '-1px' }}>ELAB</div>
                <h1 style={styles.title}>{t('auth.register.title')}</h1>
                <p style={styles.subtitle}>{t('auth.register.subtitle')}</p>

                <form onSubmit={handleSubmit} style={styles.form} aria-label={t('auth.register.form_aria')}>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label} htmlFor="reg-nome">{t('auth.register.name_label')}</label>
                            <input
                                id="reg-nome"
                                type="text"
                                value={form.nome}
                                onChange={e => updateField('nome', e.target.value)}
                                onFocus={() => setFocusedField('nome')}
                                onBlur={() => setFocusedField(null)}
                                placeholder={t('auth.register.name_placeholder')}
                                style={inputStyle('nome')}
                                autoComplete="name"
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={styles.consentBox}>
                        <label style={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={form.privacyAccepted}
                                onChange={e => updateField('privacyAccepted', e.target.checked)}
                                disabled={loading}
                            />
                            <span>
                                {t('auth.register.privacy_accept')}
                            </span>
                        </label>
                        {form.ruolo === 'user' && (
                            <label style={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={form.parentConsent}
                                    onChange={e => updateField('parentConsent', e.target.checked)}
                                    disabled={loading}
                                />
                                <span>
                                    {t('auth.register.parent_consent')}
                                </span>
                            </label>
                        )}
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label} htmlFor="reg-email">{t('auth.register.email_label')}</label>
                        <input
                            id="reg-email"
                            type="email"
                            value={form.email}
                            onChange={e => updateField('email', e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder={t('auth.register.email_placeholder')}
                            style={inputStyle('email')}
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label} htmlFor="reg-password">{t('auth.register.password_label')}</label>
                            <div style={styles.passwordWrap}>
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => updateField('password', e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder={t('auth.register.password_placeholder')}
                                    style={{ ...inputStyle('password'), paddingRight: '44px' }}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={styles.eyeBtn}
                                    aria-label={showPassword ? t('auth.register.hide_password') : t('auth.register.show_password')}
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label} htmlFor="reg-confirm-password">{t('auth.register.confirm_password_label')}</label>
                            <div style={styles.passwordWrap}>
                                <input
                                    id="reg-confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={form.confermaPassword}
                                    onChange={e => updateField('confermaPassword', e.target.value)}
                                    onFocus={() => setFocusedField('confermaPassword')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder={t('auth.register.confirm_password_placeholder')}
                                    style={{ ...inputStyle('confermaPassword'), paddingRight: '44px' }}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(p => !p)}
                                    style={styles.eyeBtn}
                                    aria-label={showConfirmPassword ? t('auth.register.hide_password') : t('auth.register.show_password')}
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showConfirmPassword} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>{t('auth.register.role_label')}</label>
                        <div style={styles.roleToggle}>
                            <button type="button" onClick={() => updateField('ruolo', 'user')}
                                aria-label={t('auth.register.role_student_aria')}
                                aria-pressed={form.ruolo === 'user'}
                                style={{
                                    ...styles.roleBtn,
                                    background: form.ruolo === 'user' ? 'var(--elab-lime)' : 'rgba(255,255,255,0.1)',
                                    color: form.ruolo === 'user' ? 'var(--elab-hex-1a1a2e)' : 'rgba(255,255,255,0.6)',
                                }}>
                                {t('auth.register.role_student_label')}
                            </button>
                            <button type="button" onClick={() => updateField('ruolo', 'docente')}
                                aria-label={t('auth.register.role_teacher_aria')}
                                aria-pressed={form.ruolo === 'docente'}
                                style={{
                                    ...styles.roleBtn,
                                    background: form.ruolo === 'docente' ? 'var(--elab-navy)' : 'rgba(255,255,255,0.1)',
                                    color: form.ruolo === 'docente' ? 'white' : 'rgba(255,255,255,0.6)',
                                    border: form.ruolo === 'docente' ? '2px solid var(--elab-lime)' : '2px solid transparent',
                                }}>
                                {t('auth.register.role_teacher_label')}
                            </button>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label} htmlFor="reg-scuola">{t('auth.register.school_label')}</label>
                            <input
                                id="reg-scuola"
                                type="text"
                                value={form.scuola}
                                onChange={e => updateField('scuola', e.target.value)}
                                onFocus={() => setFocusedField('scuola')}
                                onBlur={() => setFocusedField(null)}
                                placeholder={t('auth.register.school_placeholder')}
                                style={inputStyle('scuola')}
                                autoComplete="organization"
                                disabled={loading}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label} htmlFor="reg-citta">{t('auth.register.city_label')}</label>
                            <input
                                id="reg-citta"
                                type="text"
                                value={form.citta}
                                onChange={e => updateField('citta', e.target.value)}
                                onFocus={() => setFocusedField('citta')}
                                onBlur={() => setFocusedField(null)}
                                placeholder={t('auth.register.city_placeholder')}
                                style={inputStyle('citta')}
                                autoComplete="address-level2"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && <p style={styles.error} role="alert">{error}</p>}

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'wait' : 'pointer',
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Spinner /> {t('auth.register.submitting')}
                            </span>
                        ) : t('auth.register.submit')}
                    </button>
                </form>

                <p style={styles.footer}>
                    {t('auth.register.have_account')}{' '}
                    <button onClick={() => onNavigate('login')} style={styles.link}>{t('auth.register.login_link')}</button>
                </p>

                <button onClick={() => onNavigate('showcase')} style={styles.backBtn}>
                    {t('auth.login.back_showcase')}
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--elab-navy) 0%, #0d1b2a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '16px',
    },
    card: {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: window.innerWidth <= 480 ? '24px 16px' : '40px 48px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        maxWidth: '560px',
        width: '100%',
    },
    logo: { fontSize: '56px', marginBottom: '12px' },
    title: { color: '#fff', fontSize: '28px', fontWeight: '700', margin: '0 0 6px' },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 28px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' },
    roleToggle: { display: 'flex', gap: '10px' },
    roleBtn: {
        flex: 1,
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '10px',
        border: '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    label: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600' },
    input: {
        padding: '14px 16px',
        fontSize: '15px',
        borderRadius: '10px',
        border: '1.5px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    passwordWrap: {
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: '14px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, var(--elab-lime), #6fa030)',
        color: 'var(--elab-hex-1a1a2e)',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'opacity 200ms ease, transform 100ms ease',
    },
    error: {
        color: 'var(--elab-hex-ff6b6b)',
        fontSize: '14px',
        margin: '0',
        padding: '10px',
        background: 'rgba(255,107,107,0.1)',
        borderRadius: '8px',
    },
    consentBox: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    checkboxRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '14px',
        lineHeight: '1.35',
    },
    footer: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '24px' },
    link: {
        color: 'var(--elab-lime)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'underline',
    },
    backBtn: {
        marginTop: '16px',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'rgba(255,255,255,0.5)',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'border-color 200ms ease, color 200ms ease',
    },
};
