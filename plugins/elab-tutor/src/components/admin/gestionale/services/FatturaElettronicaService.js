// ELAB Gestionale - Servizio Fatturazione Elettronica FatturaPA
// © Andrea Marro — 18 Febbraio 2026
// Genera XML conforme FatturaPA 1.2.2 (FPR12 privati, FPA12 PA)
// L'invio reale SDI richiede un backend con certificato qualificato.
// ============================================================

import { XMLBuilder } from 'fast-xml-parser';
import logger from '../../../../utils/logger';

// ── Mappa metodo pagamento → codice FatturaPA ──────────
const METODO_PAGAMENTO_MAP = {
    bonifico: 'MP05',
    contanti: 'MP01',
    carta: 'MP08',
    assegno: 'MP02',
    riba: 'MP12',
};

// ── Mappa aliquota IVA → Natura (esenzione) ─────────────
const NATURA_IVA_MAP = {
    0: 'N2.2', // Non soggetto — altri casi
};

// ── XMLBuilder configurazione ──────────────────────────
const builderOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true,
};

// ── Stato macchina SDI ─────────────────────────────────
// bozza_locale → xml_generato → firmato → inviato_sdi → accettato_sdi | rifiutato_sdi
const SDI_TRANSITIONS = {
    bozza_locale: ['xml_generato'],
    xml_generato: ['firmato'],
    firmato: ['inviato_sdi'],
    inviato_sdi: ['accettato_sdi', 'rifiutato_sdi'],
    accettato_sdi: [],
    rifiutato_sdi: ['xml_generato'], // Can retry
};

// ── LocalStorage key per stati SDI ─────────────────────
const SDI_STORAGE_KEY = 'elab_gest_sdi_status';

function getSdiStatuses() {
    try {
        return JSON.parse(localStorage.getItem(SDI_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function setSdiStatus(fatturaId, status) {
    const all = getSdiStatuses();
    all[fatturaId] = { status, updatedAt: new Date().toISOString() };
    localStorage.setItem(SDI_STORAGE_KEY, JSON.stringify(all));
}

function getSdiStatus(fatturaId) {
    const all = getSdiStatuses();
    return all[fatturaId]?.status || 'bozza_locale';
}

function canTransition(fatturaId, targetStatus) {
    const current = getSdiStatus(fatturaId);
    const allowed = SDI_TRANSITIONS[current] || [];
    return allowed.includes(targetStatus);
}

// ── Genera progressivo trasmissione ────────────────────
function generateProgressivo() {
    const counter = parseInt(localStorage.getItem('elab_gest_sdi_counter') || '0', 10) + 1;
    localStorage.setItem('elab_gest_sdi_counter', String(counter));
    return String(counter).padStart(5, '0');
}

// ── Formatta data YYYY-MM-DD ───────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    return dateStr.split('T')[0];
}

// ── Formatta importo 2 decimali ────────────────────────
function formatAmount(num) {
    return (num || 0).toFixed(2);
}

// ── Genera XML FatturaPA ───────────────────────────────
function generateXML(fattura, azienda) {
    if (!fattura || !azienda) {
        logger.error('[FatturaPA] Dati mancanti: fattura o azienda null');
        return null;
    }

    const isPA = (fattura.clienteCodSDI || '').length === 6;
    const formatoTrasmissione = isPA ? 'FPA12' : 'FPR12';
    const codiceDestinatario = fattura.clienteCodSDI || azienda.codiceSDI || '0000000';

    // Splitta P.IVA in paese + codice
    const cedentePIVA = (azienda.piva || '').replace(/\s/g, '');
    const cedenteIdPaese = cedentePIVA.substring(0, 2) || 'IT';
    const cedenteIdCodice = cedentePIVA.substring(2) || cedentePIVA;

    const cessionarioPIVA = (fattura.clientePIVA || '').replace(/\s/g, '');
    const cessIdPaese = cessionarioPIVA.substring(0, 2) || 'IT';
    const cessIdCodice = cessionarioPIVA.substring(2) || cessionarioPIVA;

    // Righe fattura
    const righe = (fattura.righe || []).filter(r => r.descrizione?.trim());
    if (righe.length === 0) {
        logger.warn('[FatturaPA] Fattura senza righe valide');
        return null;
    }

    // Calcolo totali per aliquota
    const riepilogoIVA = {};
    const dettaglioLinee = righe.map((riga, idx) => {
        const imponibile = (riga.quantita || 1) * (riga.prezzoUnitario || 0);
        const aliquota = riga.aliquotaIVA ?? 22;
        const key = String(aliquota);

        if (!riepilogoIVA[key]) {
            riepilogoIVA[key] = { imponibile: 0, imposta: 0, aliquota };
        }
        riepilogoIVA[key].imponibile += imponibile;
        riepilogoIVA[key].imposta += imponibile * (aliquota / 100);

        const linea = {
            NumeroLinea: idx + 1,
            Descrizione: riga.descrizione,
            Quantita: formatAmount(riga.quantita || 1),
            PrezzoUnitario: formatAmount(riga.prezzoUnitario || 0),
            PrezzoTotale: formatAmount(imponibile),
            AliquotaIVA: formatAmount(aliquota),
        };

        if (aliquota === 0 && NATURA_IVA_MAP[0]) {
            linea.Natura = NATURA_IVA_MAP[0];
        }

        return linea;
    });

    // DatiRiepilogo
    const datiRiepilogo = Object.values(riepilogoIVA).map(r => {
        const entry = {
            AliquotaIVA: formatAmount(r.aliquota),
            ImponibileImporto: formatAmount(r.imponibile),
            Imposta: formatAmount(r.imposta),
            EsigibilitaIVA: 'I', // Immediata
        };
        if (r.aliquota === 0 && NATURA_IVA_MAP[0]) {
            entry.Natura = NATURA_IVA_MAP[0];
        }
        return entry;
    });

    // Importo totale documento
    const importoTotale = Object.values(riepilogoIVA).reduce(
        (sum, r) => sum + r.imponibile + r.imposta, 0
    );

    const progressivo = generateProgressivo();

    // Struttura XML FatturaPA
    const fatturaPA = {
        '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
        'p:FatturaElettronica': {
            '@_versione': formatoTrasmissione,
            '@_xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
            '@_xmlns:p': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xsi:schemaLocation': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2.2/Schema_del_file_xml_FatturaPA_v1.2.2.xsd',

            FatturaElettronicaHeader: {
                DatiTrasmissione: {
                    IdTrasmittente: {
                        IdPaese: cedenteIdPaese,
                        IdCodice: cedenteIdCodice,
                    },
                    ProgressivoInvio: progressivo,
                    FormatoTrasmissione: formatoTrasmissione,
                    CodiceDestinatario: codiceDestinatario,
                },
                CedentePrestatore: {
                    DatiAnagrafici: {
                        IdFiscaleIVA: {
                            IdPaese: cedenteIdPaese,
                            IdCodice: cedenteIdCodice,
                        },
                        ...(azienda.codiceFiscale ? { CodiceFiscale: azienda.codiceFiscale } : {}),
                        Anagrafica: {
                            Denominazione: azienda.ragioneSociale || 'ELAB S.r.l.',
                        },
                        RegimeFiscale: azienda.regimeFiscale || 'RF01',
                    },
                    Sede: {
                        Indirizzo: azienda.indirizzo || '',
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
                        CAP: azienda.cap || '00000',
                        Comune: azienda.citta || '',
                        Provincia: azienda.provincia || '',
                        Nazione: 'IT',
                    },
                },
                CessionarioCommittente: {
                    DatiAnagrafici: {
                        IdFiscaleIVA: {
                            IdPaese: cessIdPaese,
                            IdCodice: cessIdCodice,
                        },
                        Anagrafica: {
                            Denominazione: fattura.clienteNome || '',
                        },
                    },
                    Sede: {
                        Indirizzo: fattura.clienteIndirizzo || 'N/A',
                        CAP: fattura.clienteCAP || '00000',
                        Comune: fattura.clienteCitta || 'N/A',
                        Provincia: fattura.clienteProvincia || '',
                        Nazione: 'IT',
                    },
                },
            },

            FatturaElettronicaBody: {
                DatiGenerali: {
                    DatiGeneraliDocumento: {
                        TipoDocumento: fattura.tipo === 'nota_credito' ? 'TD04' : 'TD01',
                        Divisa: 'EUR',
                        Data: formatDate(fattura.data),
                        Numero: fattura.numero || '1',
                        ImportoTotaleDocumento: formatAmount(importoTotale),
                        ...(fattura.note ? { Causale: fattura.note.substring(0, 200) } : {}),
                    },
                },
                DatiBeniServizi: {
                    DettaglioLinee: dettaglioLinee,
                    DatiRiepilogo: datiRiepilogo,
                },
                DatiPagamento: {
                    CondizioniPagamento: 'TP02', // Pagamento completo
                    DettaglioPagamento: {
                        ModalitaPagamento: METODO_PAGAMENTO_MAP[fattura.metodoPagamento] || 'MP05',
                        DataScadenzaPagamento: formatDate(fattura.dataScadenza || fattura.data),
                        ImportoPagamento: formatAmount(importoTotale),
                        ...(azienda.iban ? { IBAN: azienda.iban.replace(/\s/g, '') } : {}),
                    },
                },
            },
        },
    };

    try {
        const builder = new XMLBuilder(builderOptions);
        const xml = builder.build(fatturaPA);
        logger.info(`[FatturaPA] XML generato per fattura ${fattura.numero}`);
        return xml;
    } catch (err) {
        logger.error('[FatturaPA] Errore generazione XML:', err);
        return null;
    }
}

// ── Validazione base XML ───────────────────────────────
function validateXML(xmlString) {
    const errors = [];

    if (!xmlString || typeof xmlString !== 'string') {
        return { valid: false, errors: ['XML vuoto o non valido'] };
    }

    // Check root element
    if (!xmlString.includes('FatturaElettronica')) {
        errors.push('Manca elemento root FatturaElettronica');
    }

    // Check required sections
    const required = [
        'DatiTrasmissione',
        'CedentePrestatore',
        'CessionarioCommittente',
        'DatiGeneraliDocumento',
        'DatiBeniServizi',
    ];
    for (const section of required) {
        if (!xmlString.includes(section)) {
            errors.push(`Sezione obbligatoria mancante: ${section}`);
        }
    }

    // Check P.IVA format
    const pivaMatch = xmlString.match(/<IdCodice>(\d+)<\/IdCodice>/g);
    if (pivaMatch) {
        for (const m of pivaMatch) {
            const code = m.replace(/<\/?IdCodice>/g, '');
            if (code.length < 7 || code.length > 16) {
                errors.push(`IdCodice sospetto: ${code} (lunghezza ${code.length})`);
            }
        }
    }

    // Check FormatoTrasmissione
    if (!xmlString.includes('FPR12') && !xmlString.includes('FPA12')) {
        errors.push('FormatoTrasmissione mancante o non valido (deve essere FPR12 o FPA12)');
    }

    return { valid: errors.length === 0, errors };
}

// ── Download XML come file ─────────────────────────────
function downloadXML(xmlString, filename) {
    if (!xmlString) {
        logger.warn('[FatturaPA] Nessun XML da scaricare');
        return false;
    }

    try {
        const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'fattura_elettronica.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        logger.info(`[FatturaPA] Download XML: ${filename}`);
        return true;
    } catch (err) {
        logger.error('[FatturaPA] Errore download XML:', err);
        return false;
    }
}

// ── Genera filename SDI standard ───────────────────────
// Formato: IT{P.IVA}_{progressivo}.xml
function generateFilename(azienda, fattura) {
    const piva = (azienda.piva || '').replace(/\s/g, '').replace(/^IT/, '');
    const numero = (fattura.numero || 'FT001').replace(/[^A-Za-z0-9]/g, '');
    return `IT${piva}_${numero}.xml`;
}

// ── Export API ──────────────────────────────────────────
const FatturaElettronicaService = {
    generateXML,
    validateXML,
    downloadXML,
    generateFilename,
    getSdiStatus,
    setSdiStatus,
    canTransition,
    getSdiStatuses,
    SDI_TRANSITIONS,
};

export default FatturaElettronicaService;
