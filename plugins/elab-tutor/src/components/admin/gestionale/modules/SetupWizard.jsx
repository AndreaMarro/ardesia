// ============================================
// ELAB Gestionale - Setup Wizard Primo Avvio
// 7 step: Azienda → Indirizzo → PEC/SDI → IBAN → Logo → IVA → Riepilogo
// © Andrea Marro — 18 Febbraio 2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import { gestionaleAdmin } from '../GestionaleService';
import logger from '../../../../utils/logger';

const STEPS = [
    { id: 'azienda', label: 'Dati Aziendali', icon: '' },
    { id: 'indirizzo', label: 'Indirizzo', icon: '' },
    { id: 'contatti', label: 'PEC & SDI', icon: '' },
    { id: 'banca', label: 'Dati Bancari', icon: '' },
    { id: 'logo', label: 'Logo', icon: '' },
    { id: 'defaults', label: 'Valori Predefiniti', icon: '' },
    { id: 'riepilogo', label: 'Riepilogo', icon: '' },
];

const VALIDATORS = {
    ragioneSociale: v => v.trim().length >= 2 || 'Inserisci la ragione sociale',
    partitaIva: v => /^\d{11}$/.test(v) || 'P.IVA deve avere 11 cifre',
    codiceFiscale: v => !v || /^[A-Z0-9]{11,16}$/i.test(v) || 'CF non valido',
    indirizzo: v => v.trim().length >= 3 || 'Inserisci l\'indirizzo',
    cap: v => /^\d{5}$/.test(v) || 'CAP deve avere 5 cifre',
    citta: v => v.trim().length >= 2 || 'Inserisci la città',
    provincia: v => /^[A-Z]{2}$/i.test(v) || 'Provincia: 2 lettere (es. TO)',
    pec: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'PEC non valida',
    codiceSDI: v => !v || /^[A-Z0-9]{7}$/i.test(v) || 'Codice SDI: 7 caratteri alfanumerici',
    iban: v => !v || /^IT\d{2}[A-Z]\d{22}$/i.test(v.replace(/\s/g, '')) || 'IBAN italiano: IT + 25 caratteri',
};

const INITIAL_DATA = {
    ragioneSociale: '', partitaIva: '', codiceFiscale: '',
    indirizzo: '', citta: '', cap: '', provincia: '',
    pec: '', codiceSDI: '', telefono: '', email: '',
    iban: '', banca: '',
    logoUrl: '',
    aliquotaIvaDefault: 22, condizioniPagamentoDefault: '30gg',
    prefissoFattura: 'FT', prefissoOrdine: 'ORD',
};

export default function SetupWizard({ onComplete, isMobile }) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({ ...INITIAL_DATA });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const updateField = useCallback((field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const validateStep = useCallback((stepIndex) => {
        const fieldsPerStep = [
            ['ragioneSociale', 'partitaIva', 'codiceFiscale'],
            ['indirizzo', 'cap', 'citta', 'provincia'],
            ['pec', 'codiceSDI'],
            ['iban'],
            [],
            [],
            [],
        ];
        const fields = fieldsPerStep[stepIndex] || [];
        const newErrors = {};
        for (const field of fields) {
            const validator = VALIDATORS[field];
            if (validator) {
                const result = validator(data[field] || '');
                if (result !== true) newErrors[field] = result;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data]);

    const handleNext = useCallback(() => {
        if (validateStep(step)) {
            setStep(s => Math.min(s + 1, STEPS.length - 1));
        }
    }, [step, validateStep]);

    const handleBack = useCallback(() => {
        setStep(s => Math.max(s - 1, 0));
    }, []);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            gestionaleAdmin.updateImpostazioni(data);
            localStorage.setItem('elab_gest_setupComplete', 'true');
            gestionaleAdmin.addLog('Setup iniziale completato');
            logger.info('[Gestionale] Setup wizard completato');
            onComplete();
        } catch (err) {
            logger.error('[Gestionale] Errore salvataggio setup:', err);
            setErrors({ _global: 'Errore nel salvataggio. Riprova.' });
        } finally {
            setSaving(false);
        }
    }, [data, onComplete]);

    const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

    // ── Input helper ──
    const renderInput = (field, label, opts = {}) => {
        const { type = 'text', placeholder = '', required = false, halfWidth = false } = opts;
        return (
            <div style={{ flex: halfWidth ? '1 1 45%' : '1 1 100%', minWidth: halfWidth ? '140px' : '0' }}>
                <label style={{ ...S.label, fontSize: '14px' }}>
                    {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
                </label>
                <input
                    type={type}
                    value={data[field] || ''}
                    onChange={e => updateField(field, e.target.value)}
                    placeholder={placeholder}
                    style={{
                        ...S.input,
                        borderColor: errors[field] ? COLORS.danger : COLORS.border,
                        fontSize: '14px',
                        padding: '10px 14px',
                    }}
                />
                {errors[field] && (
                    <div style={{ color: COLORS.danger, fontSize: '14px', marginTop: '4px' }}>
                        {errors[field]}
                    </div>
                )}
            </div>
        );
    };

    // ── Step content ──
    const renderStepContent = () => {
        const row = { display: 'flex', flexWrap: 'wrap', gap: '14px' };
        switch (step) {
            case 0: return (
                <div style={row}>
                    {renderInput('ragioneSociale', 'Ragione Sociale', { required: true, placeholder: 'Es. ELAB Srl' })}
                    {renderInput('partitaIva', 'Partita IVA', { required: true, placeholder: '12345678901', halfWidth: true })}
                    {renderInput('codiceFiscale', 'Codice Fiscale', { placeholder: 'Opzionale', halfWidth: true })}
                </div>
            );
            case 1: return (
                <div style={row}>
                    {renderInput('indirizzo', 'Indirizzo', { required: true, placeholder: 'Via Roma 1' })}
                    {renderInput('cap', 'CAP', { required: true, placeholder: '10100', halfWidth: true })}
                    {renderInput('citta', 'Città', { required: true, placeholder: 'Torino', halfWidth: true })}
                    {renderInput('provincia', 'Provincia', { required: true, placeholder: 'TO', halfWidth: true })}
                </div>
            );
            case 2: return (
                <div style={row}>
                    {renderInput('pec', 'PEC', { type: 'email', placeholder: 'azienda@pec.it' })}
                    {renderInput('codiceSDI', 'Codice SDI (7 caratteri)', { placeholder: '0000000', halfWidth: true })}
                    {renderInput('telefono', 'Telefono', { placeholder: '+39 011 1234567', halfWidth: true })}
                    {renderInput('email', 'Email aziendale', { type: 'email', placeholder: 'info@azienda.it' })}
                </div>
            );
            case 3: return (
                <div style={row}>
                    {renderInput('iban', 'IBAN', { placeholder: 'IT60X0542811101000000123456' })}
                    {renderInput('banca', 'Banca', { placeholder: 'Es. Intesa Sanpaolo' })}
                </div>
            );
            case 4: return (
                <div>
                    {renderInput('logoUrl', 'URL Logo (opzionale)', { placeholder: 'https://example.com/logo.png' })}
                    <div style={{ ...S.alertBox('info'), marginTop: '14px' }}>
                        Puoi aggiungere il logo anche in seguito dalle Impostazioni.
                    </div>
                </div>
            );
            case 5: return (
                <div style={row}>
                    <div style={{ flex: '1 1 45%', minWidth: '140px' }}>
                        <label style={{ ...S.label, fontSize: '14px' }}>Aliquota IVA Default (%)</label>
                        <select
                            value={data.aliquotaIvaDefault}
                            onChange={e => updateField('aliquotaIvaDefault', Number(e.target.value))}
                            style={{ ...S.select, width: '100%', fontSize: '14px', padding: '10px 14px' }}
                        >
                            <option value={22}>22%</option>
                            <option value={10}>10%</option>
                            <option value={4}>4%</option>
                            <option value={0}>Esente (0%)</option>
                        </select>
                    </div>
                    <div style={{ flex: '1 1 45%', minWidth: '140px' }}>
                        <label style={{ ...S.label, fontSize: '14px' }}>Condizioni Pagamento</label>
                        <select
                            value={data.condizioniPagamentoDefault}
                            onChange={e => updateField('condizioniPagamentoDefault', e.target.value)}
                            style={{ ...S.select, width: '100%', fontSize: '14px', padding: '10px 14px' }}
                        >
                            <option value="immediato">Immediato</option>
                            <option value="30gg">30 giorni</option>
                            <option value="60gg">60 giorni</option>
                            <option value="90gg">90 giorni</option>
                        </select>
                    </div>
                    {renderInput('prefissoFattura', 'Prefisso Fatture', { placeholder: 'FT', halfWidth: true })}
                    {renderInput('prefissoOrdine', 'Prefisso Ordini', { placeholder: 'ORD', halfWidth: true })}
                </div>
            );
            // Andrea Marro — 18 Febbraio 2026
            case 6: return (
                <div>
                    <div style={{ ...S.card, padding: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 14px' }}>
                            Riepilogo Dati Aziendali
                        </h3>
                        {[
                            ['Ragione Sociale', data.ragioneSociale],
                            ['P.IVA', data.partitaIva],
                            ['CF', data.codiceFiscale],
                            ['Indirizzo', `${data.indirizzo}, ${data.cap} ${data.citta} (${data.provincia})`],
                            ['PEC', data.pec],
                            ['SDI', data.codiceSDI],
                            ['Telefono', data.telefono],
                            ['Email', data.email],
                            ['IBAN', data.iban],
                            ['Banca', data.banca],
                            ['IVA Default', `${data.aliquotaIvaDefault}%`],
                            ['Pagamento', data.condizioniPagamentoDefault],
                            ['Prefisso Fatture', data.prefissoFattura],
                            ['Prefisso Ordini', data.prefissoOrdine],
                        ].map(([label, value]) => (
                            <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                                borderBottom: `1px solid ${COLORS.borderLight}`, fontSize: '14px',
                            }}>
                                <span style={{ color: COLORS.textSecondary, fontWeight: '500' }}>{label}</span>
                                <span style={{ color: COLORS.textPrimary, fontWeight: '600', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>
                                    {value || '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                    {errors._global && (
                        <div style={{ ...S.alertBox('danger'), marginTop: '14px' }}>
                            {errors._global}
                        </div>
                    )}
                </div>
            );
            default: return null;
        }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '70vh', padding: isMobile ? '16px' : '40px',
            background: `linear-gradient(135deg, ${COLORS.bg} 0%, var(--elab-hex-e2e8f0) 100%)`,
        }}>
            <div style={{
                background: COLORS.card, borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: `1px solid ${COLORS.border}`,
                maxWidth: '640px', width: '100%', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: COLORS.primary, padding: isMobile ? '20px 16px' : '28px 32px',
                    color: '#fff',
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}></div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>
                        Configura il tuo Gestionale
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                        Inserisci i dati della tua azienda per iniziare
                    </p>
                </div>

                {/* Progress bar */}
                <div style={{ height: '4px', background: COLORS.borderLight }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.success})`,
                        transition: 'width 0.3s ease',
                    }} />
                </div>

                {/* Step indicators */}
                <div style={{
                    display: 'flex', gap: '0', padding: '16px 20px',
                    overflowX: 'auto', scrollbarWidth: 'none',
                }}>
                    {STEPS.map((s, i) => (
                        <div key={s.id} style={{
                            display: 'flex', alignItems: 'center', flexShrink: 0,
                        }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', fontWeight: '700',
                                background: i < step ? COLORS.success : i === step ? COLORS.accent : COLORS.borderLight,
                                color: i <= step ? '#fff' : COLORS.textMuted,
                                transition: 'all 0.2s',
                            }}>
                                {i < step ? '' : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div style={{
                                    width: isMobile ? '12px' : '24px', height: '2px',
                                    background: i < step ? COLORS.success : COLORS.borderLight,
                                    margin: '0 4px',
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step title */}
                <div style={{ padding: '0 24px 8px' }}>
                    <h2 style={{
                        fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 4px',
                    }}>
                        {STEPS[step].icon} {STEPS[step].label}
                    </h2>
                    <p style={{ fontSize: '14px', color: COLORS.textMuted, margin: 0 }}>
                        Step {step + 1} di {STEPS.length}
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 24px 24px' }}>
                    {renderStepContent()}
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 24px', borderTop: `1px solid ${COLORS.border}`,
                    background: COLORS.bg,
                }}>
                    <button
                        onClick={handleBack}
                        disabled={step === 0}
                        style={{
                            ...S.btnSecondary,
                            opacity: step === 0 ? 0.4 : 1,
                            cursor: step === 0 ? 'not-allowed' : 'pointer',
                            minHeight: '44px', fontSize: '14px',
                        }}
                    >
                        ← Indietro
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            style={{ ...S.btnPrimary, minHeight: '44px', fontSize: '14px', padding: '10px 24px' }}
                        >
                            Avanti →
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                ...S.btnSuccess,
                                minHeight: '44px', fontSize: '14px', padding: '10px 24px',
                                opacity: saving ? 0.6 : 1,
                            }}
                        >
                            {saving ? 'Salvataggio...' : ' Completa Setup'}
                        </button>
                    )}
                </div>

                {/* Skip */}
                <div style={{ textAlign: 'center', padding: '0 24px 16px' }}>
                    <button
                        onClick={() => {
                            localStorage.setItem('elab_gest_setupComplete', 'true');
                            onComplete();
                        }}
                        style={{
                            background: 'none', border: 'none', color: COLORS.textMuted,
                            fontSize: '14px', cursor: 'pointer', padding: '8px',
                        }}
                    >
                        Salta configurazione (potrai farlo dopo)
                    </button>
                </div>
            </div>
        </div>
    );
}
