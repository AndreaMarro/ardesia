// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Form Modale Professionale
// Componente riutilizzabile per tutti i moduli
// ============================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { COLORS, S } from '../GestionaleStyles';
import logger from '../../../../utils/logger';

// ── Formattazione valuta per anteprima ─────────
function formatCurrencyPreview(value) {
    if (value == null || value === '') return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(num);
}

// ── Campo singolo del form ─────────────────────
function FormField({ field, value, onChange, hasError }) {
    const {
        key,
        label,
        type = 'text',
        required,
        placeholder,
        options = [],
        disabled,
        min,
        max,
        rows,
        helpText,
    } = field;

    const baseInputStyle = {
        ...S.input,
        borderColor: hasError ? COLORS.danger : COLORS.border,
        background: disabled ? COLORS.bg : COLORS.card,
        cursor: disabled ? 'not-allowed' : 'text',
    };

    const handleChange = (val) => {
        onChange(key, val);
    };

    // ── Checkbox ───────────────────────────────
    if (type === 'checkbox') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
                <div
                    onClick={() => !disabled && handleChange(!value)}
                    style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '5px',
                        border: `2px solid ${value ? COLORS.accentLight : COLORS.border}`,
                        background: value ? COLORS.accentLight : COLORS.card,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        flexShrink: 0,
                    }}
                >
                    {value && (
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: 1 }}>
                            {'\u2713'}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '14px', color: COLORS.textPrimary, cursor: disabled ? 'not-allowed' : 'pointer' }}
                    onClick={() => !disabled && handleChange(!value)}
                >
                    {label}
                </span>
                {helpText && <small style={{ color: 'var(--elab-hex-9ca3af)', fontSize: '0.75rem', marginLeft: '4px' }}>{helpText}</small>}
            </div>
        );
    }

    // ── Textarea ───────────────────────────────
    if (type === 'textarea') {
        return (
            <div>
                <label style={S.label}>
                    {label}
                    {required && <span style={{ color: COLORS.danger, marginLeft: '3px' }}>*</span>}
                </label>
                <textarea
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder || `Inserisci ${label.toLowerCase()}...`}
                    disabled={disabled}
                    rows={rows || 3}
                    className={`gestionale-field${hasError ? ' has-error' : ''}`}
                    style={{
                        ...baseInputStyle,
                        resize: 'vertical',
                        minHeight: '70px',
                        fontFamily: 'inherit',
                    }}
                />
                {helpText && <small style={{ color: 'var(--elab-hex-9ca3af)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{helpText}</small>}
            </div>
        );
    }

    // ── Select ─────────────────────────────────
    if (type === 'select') {
        return (
            <div>
                <label style={S.label}>
                    {label}
                    {required && <span style={{ color: COLORS.danger, marginLeft: '3px' }}>*</span>}
                </label>
                <select
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    className={`gestionale-field${hasError ? ' has-error' : ''}`}
                    style={{
                        ...baseInputStyle,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '32px',
                    }}
                >
                    <option value="">{placeholder || `Seleziona ${label.toLowerCase()}...`}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {helpText && <small style={{ color: 'var(--elab-hex-9ca3af)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{helpText}</small>}
            </div>
        );
    }

    // ── Currency ───────────────────────────────
    if (type === 'currency') {
        return (
            <div>
                <label style={S.label}>
                    {label}
                    {required && <span style={{ color: COLORS.danger, marginLeft: '3px' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                    <span
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '14px',
                            color: COLORS.textMuted,
                            fontWeight: '600',
                            pointerEvents: 'none',
                        }}
                    >
                        {'€'}
                    </span>
                    <input
                        type="number"
                        value={value ?? ''}
                        onChange={(e) => handleChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="0,00"
                        disabled={disabled}
                        min={min ?? 0}
                        max={max}
                        step="0.01"
                        className={`gestionale-field${hasError ? ' has-error' : ''}`}
                        style={{
                            ...baseInputStyle,
                            paddingLeft: '30px',
                        }}
                    />
                </div>
                {value != null && value !== '' && (
                    <div
                        style={{
                            fontSize: '14px',
                            color: COLORS.textMuted,
                            marginTop: '3px',
                            fontStyle: 'italic',
                        }}
                    >
                        {formatCurrencyPreview(value)}
                    </div>
                )}
                {helpText && <small style={{ color: 'var(--elab-hex-9ca3af)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{helpText}</small>}
            </div>
        );
    }

    // ── Text, Number, Email, Date ──────────────
    return (
        <div>
            <label style={S.label}>
                {label}
                {required && <span style={{ color: COLORS.danger, marginLeft: '3px' }}>*</span>}
            </label>
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => {
                    const val = type === 'number'
                        ? (e.target.value === '' ? '' : parseFloat(e.target.value))
                        : e.target.value;
                    handleChange(val);
                }}
                placeholder={placeholder || `Inserisci ${label.toLowerCase()}...`}
                disabled={disabled}
                min={min}
                max={max}
                className={`gestionale-field${hasError ? ' has-error' : ''}`}
                style={baseInputStyle}
            />
            {helpText && <small style={{ color: 'var(--elab-hex-9ca3af)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{helpText}</small>}
        </div>
    );
}

// ── Componente Principale ──────────────────────
export default function GestionaleForm({
    title,
    fields = [],
    values = {},
    onChange,
    onSubmit,
    onCancel,
    submitLabel = 'Salva',
    isMobile,
}) {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef(null);

    // Chiudi con ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onCancel) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    // Validazione
    const validate = useCallback(() => {
        const newErrors = {};
        fields.forEach((field) => {
            if (field.required) {
                const val = values[field.key];
                if (val == null || val === '' || val === false) {
                    newErrors[field.key] = `${field.label} \u00E8 obbligatorio`;
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fields, values]);

    // Invio form
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!validate()) return;

            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } catch (err) {
                logger.error('Errore invio form:', err);
            } finally {
                setIsSubmitting(false);
            }
        },
        [validate, onSubmit, values]
    );

    // Gestione cambio valore
    const handleFieldChange = useCallback(
        (key, val) => {
            // Rimuovi errore al cambio
            if (errors[key]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            }
            onChange(key, val);

            // Supporto field.onChange personalizzato (es. calcolo automatico buste paga)
            const fieldDef = fields.find((f) => f.key === key);
            if (fieldDef?.onChange) {
                fieldDef.onChange(val, values, (updater) => {
                    const next = typeof updater === 'function' ? updater(values) : updater;
                    Object.entries(next).forEach(([k, v]) => {
                        if (k !== key) onChange(k, v);
                    });
                });
            }
        },
        [onChange, errors, fields, values]
    );

    // Click overlay per chiudere
    const handleOverlayClick = useCallback(
        (e) => {
            if (e.target === modalRef.current && onCancel) {
                onCancel();
            }
        },
        [onCancel]
    );

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div ref={modalRef} style={S.modal} onClick={handleOverlayClick}>
            <div
                style={S.modalContent(isMobile)}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Intestazione ──────────────────── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '20px',
                        paddingBottom: '14px',
                        borderBottom: `1px solid ${COLORS.border}`,
                    }}
                >
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: COLORS.textPrimary,
                            margin: 0,
                        }}
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            color: COLORS.textMuted,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'all 0.15s',
                            lineHeight: 1,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = COLORS.dangerBg;
                            e.currentTarget.style.color = COLORS.danger;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = COLORS.textMuted;
                        }}
                        title="Chiudi"
                    >
                        {'\u2715'}
                    </button>
                </div>

                {/* ── Messaggi di errore ─────────────── */}
                {hasErrors && (
                    <div
                        style={{
                            background: COLORS.dangerBg,
                            borderLeft: `4px solid ${COLORS.danger}`,
                            padding: '10px 14px',
                            borderRadius: '0 8px 8px 0',
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: COLORS.danger,
                        }}
                    >
                        <strong>Attenzione:</strong> Compila tutti i campi obbligatori contrassegnati con *
                    </div>
                )}

                {/* ── Griglia campi ─────────────────── */}
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '16px',
                        }}
                    >
                        {fields.map((field) => (
                            <div
                                key={field.key}
                                style={{
                                    gridColumn:
                                        field.fullWidth || field.type === 'textarea'
                                            ? '1 / -1'
                                            : field.type === 'checkbox'
                                            ? '1 / -1'
                                            : 'auto',
                                }}
                            >
                                <FormField
                                    field={field}
                                    value={values[field.key]}
                                    onChange={handleFieldChange}
                                    hasError={!!errors[field.key]}
                                />
                                {errors[field.key] && (
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: COLORS.danger,
                                            marginTop: '3px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {errors[field.key]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── Azioni ─────────────────────── */}
                    <div style={S.modalActions}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={S.btnSecondary}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = COLORS.border;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = COLORS.bg;
                            }}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                ...S.btnPrimary,
                                opacity: isSubmitting ? 0.6 : 1,
                                cursor: isSubmitting ? 'wait' : 'pointer',
                                minWidth: '120px',
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.background = COLORS.accentLight;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = COLORS.accent;
                            }}
                        >
                            {isSubmitting ? 'Salvataggio...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
